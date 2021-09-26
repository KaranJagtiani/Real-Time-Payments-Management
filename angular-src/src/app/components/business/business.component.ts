import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth-service/auth.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DataService } from "src/app/services/message-passer/passer.service";
import { ChatService } from "src/app/services/chat-service/chat.service";
import { speedDialFabAnimations } from "src/app/services/animation/animation";

@Component({
  selector: "app-business",
  templateUrl: "./business.component.html",
  styleUrls: ["./business.component.scss"],
  animations: speedDialFabAnimations,
})
export class BusinessComponent implements OnInit {
  business: any = "";

  assingBookieForm: FormGroup;
  addPaymentForm: FormGroup;

  bookiesToBeAdded: any = [];
  businessBookies: any = [];

  payments: any = [];
  collections: any = [];

  fabTogglerState = "inactive";
  buttonsToggled: boolean = false;

  showItems() {
    this.fabTogglerState = "active";
    this.buttonsToggled = true;
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttonsToggled = false;
  }

  onToggleFab() {
    this.buttonsToggled ? this.hideItems() : this.showItems();
  }

  businessPageToggled: boolean = false;
  collectionsPageToggled: boolean = false;

  constructor(
    private authService: AuthService,
    private matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private data: DataService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.chatService.messages.subscribe((msg) => {
      this.openSnackBar(msg.msg);
      if (msg.resetBookieList) {
        this.matDialog.closeAll();
        this.getBookiesList();
        this.bookieSelected = "";
      } else if (msg.resetPaymentList) {
        this.matDialog.closeAll();
        this.getPayments();
        // Get all by business name
      } else if (msg.collectionAdded) {
        if (msg.payment.balance == 0) {
          for (let i = 0; i < this.payments.length; i++) {
            if (this.payments[i]._id == msg.payment.prev_id) {
              this.payments.splice(i, 1);
            }
          }
        } else {
          for (let i = 0; i < this.payments.length; i++) {
            if (this.payments[i]._id == msg.payment.prev_id) {
              this.payments[i].amount = msg.payment.balance;
            }
          }
        }
      }
    });
    this.assingBookieForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
    });

    this.addPaymentForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      amount: new FormControl("", [Validators.required]),
      contact: new FormControl("", [Validators.required]),
      address: new FormControl("", [Validators.required]),
      notes: new FormControl(""),
      typeOfPayment: new FormControl("", [Validators.required]),
    });

    this.data.currentMessage.subscribe((msg: any) => {
      if (msg.resetPaymentsList) {
        this.business = msg.business;
        this.getBookiesList();
        this.getPayments();
      }

      if (msg.businessPageToggled) {
        this.businessPageToggled = true;
      } else this.businessPageToggled = false;

      if (msg.collectionsPageToggled) this.collectionsPageToggled = true;
      else this.collectionsPageToggled = false;
    });
  }

  getBookiesList() {
    this.authService
      .getBookiesListForBusiness(this.business.name)
      .subscribe((data) => {
        if (data.success) {
          this.bookiesToBeAdded = data.bookiesToBeAdded;
          this.businessBookies = data.businessBookies;
        }
      });
  }

  getPayments() {
    this.authService.getPayments(this.business.name).subscribe((data) => {
      if (data.success) {
        data.payments.sort(function (a, b) {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
        });
        for (let i = 0; i < data.payments.length; i++) {
          data.payments[i].date = this.formatDate(
            new Date(data.payments[i].date)
          );
        }
        this.payments = data.payments;
      }
    });
  }

  getApprovedPayments() {
    this.authService
      .getApprovedPaymentsForBusiness(this.business.name)
      .subscribe((data) => {
        console.log("Approved Payments.");
        console.log(data);
        this.collections = data.payments;
      });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Close", {
      duration: 10000,
    });
  }

  showDialog(content, showCollections) {
    this.hideItems();
    this.assingBookieForm.controls["name"].setValue("");
    if (showCollections) {
      // Get Approved Payments
      this.getApprovedPayments();
    }
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = "99.9%";
      dialogConfig.panelClass = "my-panel";
      dialogConfig.position = {
        top: "10px",
      };
      let dialogRef = this.matDialog.open(content, dialogConfig);
    }
  }

  bookieSelected: any;

  bookieChanged() {
    this.bookieSelected = "";
    let name = this.assingBookieForm.controls["name"].value;
    for (let i = 0; i < this.bookiesToBeAdded.length; i++) {
      if (this.bookiesToBeAdded[i].name == name) {
        console.log("");
        this.bookieSelected = this.bookiesToBeAdded[i];
      }
    }
  }

  confirmAddBookie() {
    if (!this.bookieSelected) {
      this.openSnackBar("Bookie not selected.");
      return;
    }
    let obj = {
      socketName: "added-bookie-to-business",
      data: this.bookieSelected,
      business: this.business,
    };
    this.chatService.sendMsg(obj);
  }

  deleteBookie(bookie) {
    let obj = {
      socketName: "remove-bookie-from-business",
      data: bookie,
      business: this.business,
    };
    this.chatService.sendMsg(obj);
  }

  addPayment() {
    let payment: any = {
      businessName: this.business.name,
      name: this.addPaymentForm.controls["name"].value,
      amount: this.addPaymentForm.controls["amount"].value,
      contact: this.addPaymentForm.controls["contact"].value,
      address: this.addPaymentForm.controls["address"].value,
      notes: this.addPaymentForm.controls["notes"].value,
      typeOfPayment: this.addPaymentForm.controls["typeOfPayment"].value,
      date: new Date(),
    };
    let obj = {
      socketName: "add-payment-business",
      data: payment,
    };
    this.chatService.sendMsg(obj);
  }

  deletePayment(payment) {
    let obj = {
      businessName: this.business.name,
      payment: payment,
      socketName: "delete-payment-business",
    };
    this.chatService.sendMsg(obj);
  }

  backButton() {
    this.businessPageToggled = false;
    this.collectionsPageToggled = false;
    this.data.changeMessage({
      collections: "",
      businessPageToggled: true,
      collectionsPageToggled: false,
    });
  }

  goToApprovedPayments() {
    console.log("Go To Approved Payments");
    this.collectionsPageToggled = true;
    this.authService
      .getCollectionsForBusiness(this.business.name)
      .subscribe((data) => {
        if (data.success) {
          data.collections.forEach((collection) => {
            collection.collectionDate = this.formatDate(
              new Date(collection.collectionDate)
            );
          });
          this.businessPageToggled = false;
          this.collectionsPageToggled = true;
          this.data.changeMessage({
            collections: data.collections,
            businessPageToggled: false,
            collectionsPageToggled: true,
          });
        }
      });
  }

  formatDate(date) {
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();
    var timeOfDay = "PM";
    if (hour < 12) {
      timeOfDay = "AM";
    }
    if (hour > 12) {
      hour -= 12;
      if (hour == 12) {
        timeOfDay = "AM";
      }
    }
    if (hour == 0) {
      hour = 12;
    }
    if (hour < 10) {
      hour = "0" + String(hour);
    }
    if (min < 10) {
      min = "0" + String(min);
    }
    return (
      this.suffixNumber(day) +
      " " +
      monthNames[monthIndex] +
      " " +
      year +
      ",  " +
      hour +
      ":" +
      min +
      timeOfDay
    );
  }

  suffixNumber(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }
}

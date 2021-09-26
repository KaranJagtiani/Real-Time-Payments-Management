import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service/auth.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { DataService } from "src/app/services/message-passer/passer.service";
import { ChatService } from "src/app/services/chat-service/chat.service";

@Component({
  selector: "app-bookie-home",
  templateUrl: "./bookie-home.component.html",
  styleUrls: ["./bookie-home.component.scss"],
})
export class BookieHomeComponent implements OnInit {
  user: any;
  name: String = "";

  payments: any = [];

  addCollectionForm: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private data: DataService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.addCollectionForm = new FormGroup({
      amount: new FormControl("", [Validators.required]),
    });

    if (!this.chatService.alreadyConnected()) {
      this.chatService.connectToSocket();
      let obj = {
        socketName: "bookie-joined",
        user: JSON.parse(localStorage.getItem("user")),
      };
      this.chatService.sendMsg(obj);
    }
    this.chatService.messages.subscribe((msg) => {
      this.openSnackBar(msg.msg);
      if (msg.payment) {
        msg.payment.date = this.formatDate(new Date(msg.payment.date));
      }

      if (msg.resetPaymentList) {
        this.getAllPayments();
      } else if (msg.paymentAdded) {
        let flag = 0;
        for (let i = 0; i < this.payments.length; i++) {
          if (this.payments[i].name == msg.payment.businessName) {
            this.payments[i].payments.unshift(msg.payment);
            flag = 1;
          }
        }
        if (flag == 0) {
          let obj = {
            name: msg.payment.businessName,
            payments: [msg.payment],
          };
          this.payments.push(obj);
        }
      } else if (msg.deletedPayment) {
        for (let i = 0; i < this.payments.length; i++) {
          if (this.payments[i].name == msg.payment.businessName) {
            for (let j = 0; j < this.payments[i].payments.length; j++) {
              if (this.payments[i].payments[j]._id == msg.payment._id) {
                this.payments[i].payments.splice(j, 1);
              }
            }
          }
        }
      } else if (msg.collectionAdded) {
        this.matDialog.closeAll();
        if (msg.payment.balance == 0) {
          for (let i = 0; i < this.payments.length; i++) {
            if (this.payments[i].name == msg.payment.businessName) {
              for (let j = 0; j < this.payments[i].payments.length; j++) {
                if (this.payments[i].payments[j]._id == msg.payment.prev_id) {
                  this.payments[i].payments.splice(j, 1);
                }
              }
            }
          }
        } else {
          for (let i = 0; i < this.payments.length; i++) {
            if (this.payments[i].name == msg.payment.businessName) {
              for (let j = 0; j < this.payments[i].payments.length; j++) {
                if (this.payments[i].payments[j]._id == msg.payment.prev_id) {
                  this.payments[i].payments[j].amount = msg.payment.balance;
                }
              }
            }
          }
        }
      }
    });

    this.authService.getUserProfile().subscribe((data) => {
      if (data.success) {
        this.user = data.user;
        this.name = data.user.name;
        this.getAllPayments();
      } else {
        this.router.navigate(["/"]);
      }
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Close", {
      duration: 10000,
    });
  }

  showDialog(content, showCollections) {
    if (showCollections) this.getCollections();
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = "98%";
      dialogConfig.panelClass = "my-panel";
      dialogConfig.position = {
        top: "10px",
      };
      let dialogRef = this.matDialog.open(content, dialogConfig);
    }
  }

  logoutButtonClicked() {
    localStorage.clear();
    this.router.navigate(["/"]);
  }

  checkIfInPaymentsList(businessName) {
    for (let i = 0; i < this.payments.length; i++) {
      if (this.payments[i]["name"] == businessName) return 1;
    }
    return 0;
  }

  checkIfInCollectionsList(businessName) {
    for (let i = 0; i < this.payments.length; i++) {
      if (this.payments[i]["name"] == businessName) return 1;
    }
    return 0;
  }

  addToCollectionsList(payment) {
    for (let i = 0; i < this.payments.length; i++) {
      if (this.payments[i]["name"] == payment.businessName) {
        this.payments[i]["payments"].push(payment);
        return;
      }
    }
  }

  collections: any = [];
  getCollections() {
    this.authService
      .getCollectionsForBookie(this.user.username)
      .subscribe((data) => {
        if (data.success) {
          data.collections.forEach((collection) => {
            collection.collectionDate = this.formatDate(
              new Date(collection.collectionDate)
            );
          });
          this.collections = data.collections;
          this.collections.sort(function (a, b) {
            if (a.collectionDate > b.collectionDate) return -1;
            if (a.collectionDate < b.collectionDate) return 1;
          });
        }
      });
  }

  addToPaymentsList(payment) {
    for (let i = 0; i < this.payments.length; i++) {
      if (this.payments[i]["name"] == payment.businessName) {
        this.payments[i]["payments"].push(payment);
        return;
      }
    }
  }

  getAllPayments() {
    this.authService
      .getPaymentsForBookie(this.user.username)
      .subscribe((data) => {
        if (data.success) {
          for (let i = 0; i < data.payments.length; i++) {
            data.payments[i].date = this.formatDate(
              new Date(data.payments[i].date)
            );
          }

          this.authService.getUserProfile().subscribe((profile) => {
            if (data.success) {
              this.user = profile.user;
              this.payments = [];

              for (let i = 0; i < this.user.businesses.length; i++) {
                let obj = {
                  name: this.user.businesses[i],
                  payments: [],
                };
                this.payments.push(obj);
              }

              for (let i = 0; i < data.payments.length; i++) {
                if (this.checkIfInPaymentsList(data.payments[i].businessName)) {
                  this.addToPaymentsList(data.payments[i]);
                } else {
                  let obj = {
                    name: data.payments[i].businessName,
                    payments: [data.payments[i]],
                  };
                  this.payments.push(obj);
                }
              }

              for (let i = 0; i < this.payments.length; i++) {
                this.payments[i].payments.sort(function (a, b) {
                  if (a.date > b.date) return -1;
                  if (a.date < b.date) return 1;
                });
              }
            } else {
              this.router.navigate(["/"]);
            }
          });
        }
      });
  }

  balanceNegative: boolean = false;

  amountChanged(amoutToBePaid) {
    if (
      Number(this.addCollectionForm.controls["amount"].value) &&
      this.addCollectionForm.controls["amount"].value
    ) {
      if (amoutToBePaid - this.addCollectionForm.controls["amount"].value < 0) {
        this.addCollectionForm.controls["amount"].setErrors({
          incorrect: true,
        });
        this.balanceNegative = true;
      } else {
        this.addCollectionForm.controls["amount"].setErrors(null);
        this.balanceNegative = false;
      }
    } else
      this.addCollectionForm.controls["amount"].setErrors({ incorrect: true });
  }

  submitCollection(business) {
    var amountReg = /^\d+$/;
    if (!this.addCollectionForm.controls["amount"].value.match(amountReg)) {
      this.openSnackBar("Enter a valid amount.");
      return;
    }

    let obj = {
      prev_id: business._id,
      bookieUsername: this.user.username,
      bookieName: this.user.name,
      businessName: business.businessName,
      name: business.name,
      contact: business.contact,
      address: business.address,
      originalAmount: business.amount,
      collectedAmount: this.addCollectionForm.controls["amount"].value,
      balance:
        business.amount - this.addCollectionForm.controls["amount"].value,
      notes: business.notes,
      typeOfPayment: business.typeOfPayment,
      originalDate: business.date,
      collectionDate: new Date(),
      socketName: "add-new-collection",
    };

    this.chatService.sendMsg(obj);
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

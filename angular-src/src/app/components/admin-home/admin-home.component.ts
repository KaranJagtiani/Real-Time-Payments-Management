import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service/auth.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DataService } from "src/app/services/message-passer/passer.service";
import { ChatService } from "src/app/services/chat-service/chat.service";
import { speedDialFabAnimations } from "src/app/services/animation/animation";

@Component({
  selector: "app-admin-home",
  templateUrl: "./admin-home.component.html",
  styleUrls: ["./admin-home.component.scss"],
  animations: speedDialFabAnimations,
})
export class AdminHomeComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private data: DataService,
    private chatService: ChatService
  ) {}

  user: any;
  name: String = "";

  addBookieForm: FormGroup;
  addBusinessForm: FormGroup;

  businesses: any = [];
  business: any = "";

  fabTogglerState = "inactive";
  buttonsToggled: boolean = false;

  businessPageToggled: boolean = false;
  collectionsPageToggled: boolean = false;

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

  ngOnInit() {
    this.data.changeMessage({
      business: "",
      businessPageToggled: false,
      collectionsPageToggled: false,
    });

    this.data.currentMessage.subscribe((msg: any) => {
      if (msg.businessPageToggled) this.businessPageToggled = true;
      else this.businessPageToggled = false;

      if (msg.collectionsPageToggled) this.collectionsPageToggled = true;
      else this.collectionsPageToggled = false;
    });

    if (!this.chatService.alreadyConnected()) {
      this.chatService.connectToSocket();
      let obj = {
        socketName: "admin-joined",
        user: JSON.parse(localStorage.getItem("user")),
      };
      this.chatService.sendMsg(obj);
    }

    this.addBookieForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      confPassword: new FormControl("", [Validators.required]),
      mobile: new FormControl("", [Validators.required]),
    });

    this.addBusinessForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
    });

    this.authService.getUserProfile().subscribe(
      (data) => {
        if (data.success) {
          this.user = data.user;
          this.name = data.user.name;
          this.getBusinesses();
        } else {
          this.router.navigate(["/"]);
        }
      },
      (err) => {
        if (err.status === 401) {
          localStorage.clear();
          this.router.navigate(["/"]);
          return;
        }
      }
    );
  }

  getBusinesses() {
    this.authService.getBusinesses().subscribe((businesses) => {
      this.businesses = businesses.businesses;
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 10000,
    });
  }

  logoutButtonClicked() {
    localStorage.clear();
    this.router.navigate(["/"]);
  }

  showeDialog(content) {
    this.hideItems();
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

  submitBookie() {
    let userObj: any = {
      name: this.addBookieForm.controls["name"].value,
      username: this.addBookieForm.controls["username"].value,
      password: this.addBookieForm.controls["password"].value,
      confirmPass: this.addBookieForm.controls["confPassword"].value,
      mobile: this.addBookieForm.controls["mobile"].value,
      bookie: true,
    };
    this.authService.registerBookie(userObj).subscribe((data) => {
      if (data.success) {
        this.addBookieForm.reset();
        this.matDialog.closeAll();
      }
      this.openSnackBar(data.msg, "Close");
    });
  }

  submitBusiness() {
    let businessObj: any = {
      name: this.addBusinessForm.controls["name"].value,
    };
    this.authService.addNewBusiness(businessObj).subscribe((data) => {
      if (data.success) {
        this.getBusinesses();
        this.addBusinessForm.reset();
        this.matDialog.closeAll();
      }
      this.openSnackBar(data.msg, "Close");
    });
  }

  deleteBusiness(business) {
    let obj = {
      businessName: business.name,
    };
    this.authService.removeBusiness(obj).subscribe((data) => {
      if (data.success) {
        this.getBusinesses();
        this.matDialog.closeAll();
      }
      this.openSnackBar(data.msg, "Close");
    });
  }

  businessClickedFunc(business) {
    this.business = business;
    this.authService.getBusinessByName(this.business.name).subscribe((data) => {
      if (data.success) {
        this.business = data.business;
        this.businessPageToggled = true;
        this.collectionsPageToggled = false;
        this.data.changeMessage({
          business: this.business,
          businessPageToggled: true,
          collectionsPageToggled: false,
          resetPaymentsList: true,
        });
      }
    });
  }

  backButton() {
    this.business = "";
    this.businessPageToggled = false;
    this.collectionsPageToggled = false;
    this.data.changeMessage({
      business: "",
      businessPageToggled: false,
      collectionsPageToggled: false,
    });
  }

  backButtonCollections() {
    this.businessPageToggled = true;
    this.collectionsPageToggled = false;
    this.data.changeMessage({
      collections: "",
      businessPageToggled: true,
      collectionsPageToggled: false,
    });
  }
}

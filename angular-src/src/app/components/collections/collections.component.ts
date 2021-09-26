import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth-service/auth.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DataService } from "src/app/services/message-passer/passer.service";

@Component({
  selector: "app-collections",
  templateUrl: "./collections.component.html",
  styleUrls: ["./collections.component.scss"],
})
export class CollectionsComponent implements OnInit {
  collections: any = [];
  businessName: string = "";

  businessPageToggled: boolean = false;
  collectionsPageToggled: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private data: DataService
  ) {}

  ngOnInit() {
    this.data.currentMessage.subscribe((msg: any) => {
      if (msg.businessPageToggled) this.businessPageToggled = true;
      else this.businessPageToggled = false;

      if (msg.collectionsPageToggled) {
        this.collectionsPageToggled = true;

        msg.collections.sort(function (a, b) {
          if (a.collectionDate > b.collectionDate) return -1;
          if (a.collectionDate < b.collectionDate) return 1;
        });

        this.collections = msg.collections;
        if (this.collections[0]) {
          this.businessName = this.collections[0].businessName;
          console.log(this.businessName);
        }
        console.log(this.collections);
      } else this.collectionsPageToggled = false;
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Close", {
      duration: 10000,
    });
  }

  showDialog(content) {
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = "99.9%";
      dialogConfig.panelClass = "my-panel";
      let dialogRef = this.matDialog.open(content, dialogConfig);
    }
  }

  backButton() {
    this.businessPageToggled = true;
    this.collectionsPageToggled = false;
    this.data.changeMessage({
      collections: "",
      businessPageToggled: true,
      collectionsPageToggled: false,
    });
  }

  getCollections() {
    this.authService
      .getCollectionsForBusiness(this.businessName)
      .subscribe((data) => {
        if (data.success) {
          this.collections = data.collections;
          console.log("Get Collections");
          console.log(this.collections);
        }
      });
  }

  getApprovedPayments() {
    this.authService
      .getApprovedPaymentsForBusiness(this.businessName)
      .subscribe((data) => {
        console.log("Approved Payments.");
        console.log(data);
        this.getCollections();
      });
  }

  approvePayment(payment) {
    console.log("Approve Payment");
    console.log(payment);

    this.authService.addApprovedPayment(payment).subscribe((data) => {
      console.log(data);
      if (data.success) {
        this.openSnackBar(data.msg);
        this.getApprovedPayments();
        this.matDialog.closeAll();
      }
    });
  }
}

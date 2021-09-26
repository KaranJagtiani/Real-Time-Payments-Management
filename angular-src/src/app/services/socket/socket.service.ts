import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable, Subject } from "rxjs";
import { environment as ENV } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket;

  constructor() {}

  public sendMessage(socketName, message) {
    this.socket.emit(
      socketName,
      {
        from: "User",
        text: message,
      },
      (back) => {
        //callback function here });
      }
    );
  }

  public getMessages = () => {
    return Observable.create((observer) => {
      this.socket.on("new-message", (message) => {
        observer.next(message);
      });
    });
  };

  connect(): Subject<MessageEvent> {
    this.socket = io(ENV.apiUrl);

    let observable = new Observable((observer) => {
      this.socket.on("error", () => {
        let msg = { msg: "Something went wront, please try again later." };
        observer.next(msg);
      });

      this.socket.on("bookieNotFound", () => {
        let msg = { msg: "Bookie Not Found, please try again later." };
      });

      this.socket.on("businessNotFound", () => {
        let msg = { msg: "Business Not Found, please try again later." };
        observer.next(msg);
      });

      this.socket.on("bookieAdded", () => {
        let msg = { msg: "Bookie Added Successfully.", resetBookieList: true };
        observer.next(msg);
      });

      this.socket.on("addedAsBookie", (business) => {
        let msg = {
          msg: `Added as Bookie to ${business.business.name} by Admin.`,
          business: business.business,
          resetPaymentList: true,
        };
        observer.next(msg);
      });

      this.socket.on("bookieRemoved", () => {
        let msg = {
          msg: "Bookie Removed Successfully.",
          resetBookieList: true,
        };
        observer.next(msg);
      });

      this.socket.on("removedAsBookie", (business) => {
        let msg = {
          msg: `You have been removed as a Bookie from ${business.business.name} by Admin.`,
          business: business.business,
          resetPaymentList: true,
        };
        observer.next(msg);
      });

      this.socket.on("paymentAddedAdmin", () => {
        let msg = { msg: `Payment Added Successfully`, resetPaymentList: true };
        observer.next(msg);
      });

      this.socket.on("newPaymentBookie", (message) => {
        let msg = {
          msg: `New payment added to ${message.businessName} by Admin.`,
          payment: message,
          paymentAdded: true,
        };
        observer.next(msg);
      });

      this.socket.on("paymentRemovedAdmin", () => {
        let msg = {
          msg: `Payment Removed Successfully`,
          resetPaymentList: true,
        };
        observer.next(msg);
      });

      this.socket.on("deletePaymentBookie", (message) => {
        let msg = {
          msg: `Payment removed from ${message.businessName} by Admin.`,
          payment: message.payment,
          deletedPayment: true,
        };
        observer.next(msg);
      });

      this.socket.on("paymentCollectedBookie", (message) => {
        let msg = {
          msg: `Collection successfully added.`,
          payment: message,
          collectionAdded: true,
        };
        observer.next(msg);
      });

      this.socket.on("paymentCollectedAdmin", (message) => {
        let msg = {
          msg: `Payment collected from ${message.name} by ${message.bookieName} for ${message.businessName}.`,
          payment: message,
          collectionAdded: true,
        };
        observer.next(msg);
      });

      return () => {
        this.socket.disconnect();
      };
    });

    let observer = {
      next: (data: any) => {
        let socketName = data.socketName;
        this.socket.emit(socketName, JSON.stringify(data));
      },
    };

    return Subject.create(observer, observable);
  }
}

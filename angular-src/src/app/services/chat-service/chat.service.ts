import { Injectable } from "@angular/core";
import { SocketService } from "../socket/socket.service";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ChatService {
  messages: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: SocketService) {}

  alreadyConnected() {
    return this.messages;
  }

  connectToSocket() {
    this.messages = <Subject<any>>this.wsService.connect().pipe(
      map((response: any): any => {
        return response;
      })
    );
  }

  // Our simplified interface for sending
  // messages back to our socket.io server
  sendMsg(msg) {
    this.messages.next(msg);
  }
}

import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat-service/chat.service';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: String;
  password: String;
  invalidUsername: Boolean = true;
  invalidPassword: Boolean = true;
  invalidCred: Boolean = false;
  formEmpty: Boolean = false;
  response: String;


  constructor(
    private chat: ChatService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.chat.connectToSocket();
  }

  login() {
    let user = {
      username: this.username,
      password: this.password
    }
    if (!user.username || !user.password) {
      this.formEmpty = true;
      return;
    }
    else {
      this.formEmpty = false;
    }
    this.authService.authenticateUser(user).subscribe(profile => {
      if (profile.success) {
        this.authService.storeUserData(profile.token, profile.user);
        if (profile.user.admin) {
          console.log("Admin");
          let obj = {
            socketName: 'admin-joined',
            user: profile.user
          }
          this.chat.sendMsg(obj);
          this.router.navigate(['/admin-home']);
        }
        else if (profile.user.bookie) {
          console.log("Bookie");
          let obj = {
            socketName: 'bookie-joined',
            user: profile.user
          }
          this.chat.sendMsg(obj);
          this.router.navigate(['/bookie-home']);
          //location.reload();
        }
        console.log(profile.token);
      }
      else {
        this.response = profile.msg;
        this.invalidCred = true;
      }
    });
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatButtonModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatIconModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule
} from '@angular/material';

// Components
import { LoginComponent } from './components/login/login.component';
import { BookieHomeComponent } from './components/bookie-home/bookie-home.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
// -- Components

// Services
import { SocketService } from './services/socket/socket.service'
import { ChatService } from './services/chat-service/chat.service';
import { AuthService } from './services/auth-service/auth.service';
import { LoaderService } from './services/loader-service/loader.service';
import { DataService } from './services/message-passer/passer.service';
// -- Services

// Inceptors
import { LoaderInterceptor } from './services/loader-service/loaderInterceptor.interceptor';
// -- Inceptors

// Guards
import { ProfileGuard } from './guards/profile-guard/profile.guard';
import { LoggedInGuard } from './guards/logged-in-guard/logged-in.guard';
import { AdminGuard } from './guards/admin-guard/admin.guard';
import { BookieGuard } from './guards/bookie-guard/bookie.guard';
import { LoaderComponent } from './components/loader/loader.component';
import { BusinessComponent } from './components/business/business.component';
import { CollectionsComponent } from './components/collections/collections.component';
// -- Guards


const appRoutes: Routes = [

  { path: '', component: LoginComponent, canActivate: [LoggedInGuard] },
  { path: 'admin-home', component: AdminHomeComponent, canActivate: [AdminGuard] },
  { path: 'bookie-home', component: BookieHomeComponent, canActivate: [BookieGuard] },
  { path: '**', redirectTo: '/' },
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BookieHomeComponent,
    AdminHomeComponent,
    LoaderComponent,
    BusinessComponent,
    CollectionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  providers: [AuthService, LoaderService, SocketService, ChatService, DataService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }

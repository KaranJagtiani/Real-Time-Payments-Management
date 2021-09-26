import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { JwtHelperService } from "@auth0/angular-jwt";
import { environment as ENV } from "src/environments/environment";

interface data {
  success: Boolean;
  msg: string;
  invalidPass: Boolean;
  categoryReq: Boolean;
  countryReq: Boolean;
  stateReq: Boolean;
  cityReq: Boolean;
  regSuccess: Boolean;
  alreadyReg: Boolean;
  usernameTaken: Boolean;
  emailExists: Boolean;
  token: String;
  user: any;
  bookiesToBeAdded: any;
  businessBookies: any;
  businesses: any;
  business: any;
  payments: any;
  collections: any;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  authTokenUser: any;
  user: any;

  constructor(private http: HttpClient) {}

  getApprovedPaymentsForBusiness(businessName) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("businessName", businessName);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-approved-payments", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  addApprovedPayment(approvedPayment) {
    console.log("In Auth Service");
    console.log(approvedPayment);
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/add-approved-payment", approvedPayment, {
        headers: headers,
      })
      .pipe(map((res) => res));
  }

  getCollectionsForBusiness(businessName) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("businessName", businessName);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-collections-of-business", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getCollectionsForBookie(bookieUsername) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("bookieUsername", bookieUsername);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-collections-of-bookie", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getPaymentsForBookie(username) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("username", username);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-payments-bookie", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getPayments(businessName) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("businessName", businessName);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-payments-busiess", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getBookiesList() {
    return this.http
      .get<data>(ENV.apiUrl + "users/get-bookies")
      .pipe(map((res) => res));
  }

  getBookiesListForBusiness(businessName) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("businessName", businessName);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-bookies-for-business", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getBusinessByName(businessName) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let params = new HttpParams().set("businessName", businessName);
    return this.http
      .get<data>(ENV.apiUrl + "users/get-business-by-name", {
        headers: headers,
        params: params,
      })
      .pipe(map((res) => res));
  }

  getBusinesses() {
    return this.http
      .get<data>(ENV.apiUrl + "users/get-businesses")
      .pipe(map((res) => res));
  }

  removeBusiness(business) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/remove_business", business, { headers: headers })
      .pipe(map((res) => res));
  }

  addNewBusiness(business) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/add_business", business, { headers: headers })
      .pipe(map((res) => res));
  }

  authenticateAccount(userObj) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/admin/authenticate_user", userObj, {
        headers: headers,
      })
      .pipe(map((res) => res));
  }

  deleteAccount(userObj) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/admin/delete_user", userObj, {
        headers: headers,
      })
      .pipe(map((res) => res));
  }

  getUsers(username) {
    let param: any = {
      username: username,
    };
    return this.http
      .get<data>(ENV.apiUrl + "users/admin/get-users", { params: param })
      .pipe(map((res) => res));
  }

  updatePassword(username, currentPassword, newPassword, newConfirmPassword) {
    let newUser: Object;
    newUser = {
      username: username,
      currentPassword: currentPassword,
      newPassword: newPassword,
      newConfirmPassword: newConfirmPassword,
    };
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/update_password", newUser, { headers: headers })
      .pipe(map((res) => res));
  }

  checkCurrentPassword(username, password) {
    let newUser: Object;
    newUser = {
      username: username,
      password: password,
    };
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/check_current_password", newUser, {
        headers: headers,
      })
      .pipe(map((res) => res));
  }

  registerBookie(user) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/register", user, { headers: headers })
      .pipe(map((res) => res));
  }

  authenticateUser(user) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    return this.http
      .post<data>(ENV.apiUrl + "users/authenticate", user, { headers: headers })
      .pipe(map((res) => res));
  }

  getUserProfile() {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: this.loadToken(),
        "Content-Type": "application/json",
      }),
    };
    return this.http
      .get<data>(ENV.apiUrl + "users/profile", httpOptions)
      .pipe(map((res) => res));
  }

  storeUserData(userToken, user) {
    localStorage.setItem("id_token", userToken);
    localStorage.setItem("user", JSON.stringify(user));
    this.authTokenUser = userToken;
    this.user = user;
  }

  loadToken() {
    const userToken = localStorage.getItem("id_token");
    return userToken;
  }

  isAdmin() {
    let userObj: any = JSON.parse(localStorage.getItem("user"));
    if (userObj) {
      return userObj.admin;
    }
    return false;
  }

  isBookie() {
    let userObj: any = JSON.parse(localStorage.getItem("user"));
    if (userObj) {
      return userObj.bookie;
    }
    return false;
  }

  loggedIn() {
    const helper = new JwtHelperService();
    var isExpired = helper.isTokenExpired(this.loadToken());
    return isExpired;
  }

  logout() {
    this.authTokenUser = null;
    this.user = null;
    window.localStorage.clear();
  }
}

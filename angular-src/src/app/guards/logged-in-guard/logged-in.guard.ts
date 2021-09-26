import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth-service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
  constructor (private authService: AuthService, private router: Router) {};
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin-home']);
        return false;
      } else if(this.authService.isBookie()){
        this.router.navigate(['/bookie-home']);
        return false;
      }
      return true;
      
  }
   
}
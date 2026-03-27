import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../../interfaces/user';
import { Auth } from '../../classes/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthGaurd implements CanActivate {
  user: User
  isLoggedIn: any
  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.auth.user().subscribe(
      user => {
        Auth.userEmitter.emit(user);
        Auth.user = user;
        this.user = user;
      },
      () => {
        this.router.navigate(['/sessions/login'], { queryParams: { returnUrl: state.url.toString() }});
    
         return false; 
      }
    );
    return true;

  }
}

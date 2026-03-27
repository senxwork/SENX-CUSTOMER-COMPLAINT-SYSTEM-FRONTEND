import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { ClickOutsideDirective } from "../../../directives/outside.directive";
import { AuthService } from "src/app/shared/services/auth.service";
import { UserService } from "src/app/shared/services/user.service";
import { Auth } from "src/app/classes/auth";

@Component({
  selector: "app-profile",
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: "./profile.html",
  styleUrl: "./profile.scss",
})
export class Profile {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  endpointProfileImage: any;
  user: any;

  public profile: boolean = false;
  private router = inject(Router);
  ngOnInit() {
    this.endpointProfileImage = this.userService.endpointProfileImage;
    const user = Auth.user;
    this.user = user;
    Auth.userEmitter.subscribe((res: any) => {
      this.authService.user;
      this.user = res;
    });
  }
  open() {
    this.profile = !this.profile;
  }

  clickOutside(): void {
    this.profile = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/sessions/login']).then(() => {
          window.location.reload();
        });
      },
      error: () => {
        // Even if API fails, still logout locally
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/sessions/login']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}

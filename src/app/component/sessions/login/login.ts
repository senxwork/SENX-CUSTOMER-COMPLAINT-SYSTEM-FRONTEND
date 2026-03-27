import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";

import { ActivatedRoute, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule } from "@angular/router";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-login",
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule,
      ],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
})
export class LoginComponent {
  loading: boolean;
  loadingText: string;
  signinForm: UntypedFormGroup;
  errorRes: string;
  returnUrl: string;
 show: boolean = false;
  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
        this.loadingText = "ลงชื่อเข้าใช้งาน...";

        this.loading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.loading = false;
      }
    });

    this.signinForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  signin() {
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
    this.loading = true;
    this.loadingText = "ลงชื่อเข้าใช้งาน...";

    this.auth.login(this.signinForm.value).subscribe({
      next: (login) => {

        return login.status;
      },
      error: (e) => {
        console.log(e.error.message);
        this.errorRes = e.error.message;
        this.loading = false;
        if (!e.error.message) {
          this.toastr.error("ไม่สามารถติดต่อ API ได้ กรุณาติดต่อผู้ดูแลระบบ", "แจ้งเตือน", { timeOut: 5000, closeButton: true, progressBar: true });
        } else {
          this.toastr.error(e.error.message, "แจ้งเตือน", { timeOut: 5000, closeButton: true, progressBar: true });
        }
      },
      complete: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
    });
  }

  forgotPassword() {
    this.toastr.warning("กรุณาติดต่อ ADMIN", "แจ้งเตือน", { timeOut: 5000, closeButton: true, progressBar: true });
  }
   showPassword() {
    this.show = !this.show;
  }

}

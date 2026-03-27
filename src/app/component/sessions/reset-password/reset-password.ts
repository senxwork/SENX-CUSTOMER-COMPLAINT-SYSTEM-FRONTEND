import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent {
  resetForm: UntypedFormGroup;
  loading = false;
  resetSuccess = false;
  tokenInvalid = false;
  token = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.tokenInvalid = true;
    }

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      password_confirm: ['', [Validators.required]],
    });
  }

  get passwordMismatch(): boolean {
    const pw = this.resetForm.get('password')?.value;
    const confirm = this.resetForm.get('password_confirm')?.value;
    return confirm && pw !== confirm;
  }

  submit() {
    if (!this.resetForm.valid || this.passwordMismatch) return;

    this.loading = true;
    this.authService.resetPassword(this.token, this.resetForm.value).subscribe({
      next: () => {
        this.resetSuccess = true;
        this.loading = false;
        this.toastr.success('รีเซ็ตรหัสผ่านสำเร็จ', 'สำเร็จ', {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
      },
      error: (e: any) => {
        this.loading = false;
        const msg = e.error?.message || 'ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอรีเซ็ตรหัสผ่านใหม่';
        this.toastr.error(msg, 'แจ้งเตือน', {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

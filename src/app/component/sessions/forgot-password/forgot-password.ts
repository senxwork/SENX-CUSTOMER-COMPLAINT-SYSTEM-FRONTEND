import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  forgotForm: UntypedFormGroup;
  loading = false;
  emailSent = false;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (!this.forgotForm.valid) return;

    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.emailSent = true;
        this.loading = false;
        this.toastr.success('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล์ของคุณแล้ว', 'สำเร็จ', {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
      },
      error: (e: any) => {
        this.loading = false;
        this.toastr.error(e.error?.message || 'ไม่พบอีเมล์นี้ในระบบ', 'แจ้งเตือน', {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });
      },
    });
  }
}

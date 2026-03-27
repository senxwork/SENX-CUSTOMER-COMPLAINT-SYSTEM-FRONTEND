import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';

@Component({
  selector: 'app-contact-channel-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact-channel-create.html',
  styleUrl: './contact-channel-create.scss'
})
export class ContactChannelCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private contactChannelService: ContactChannelService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      channel_name: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.loading = true;
    this.contactChannelService.createContactChannel(this.form.value).subscribe({
      next: () => {
        this.toastr.success('สร้างสำเร็จ');
        this.router.navigate(['/pages/settings/contact-channel']);
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/settings/contact-channel']);
  }
}

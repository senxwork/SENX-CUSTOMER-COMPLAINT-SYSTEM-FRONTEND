import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';

@Component({
  selector: 'app-contact-channel-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact-channel-edit.html',
  styleUrl: './contact-channel-edit.scss'
})
export class ContactChannelEditComponent implements OnInit {
  id!: string;
  form!: FormGroup;
  loading = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private contactChannelService: ContactChannelService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.form = this.fb.group({
      channel_name: ['', Validators.required]
    });

    this.loadData();
  }

  loadData(): void {
    this.contactChannelService.getAll().subscribe({
      next: (data) => {
        const item = data?.find((d: any) => d.id === this.id);
        if (item) {
          this.form.patchValue({ channel_name: item.channel_name });
        }
        this.loadingData = false;
      },
      error: (err) => {
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
        this.router.navigate(['/pages/settings/contact-channel']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.loading = true;
    this.contactChannelService.editContactChannel(this.id, this.form.value).subscribe({
      next: () => {
        this.toastr.success('บันทึกสำเร็จ');
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

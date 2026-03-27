import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';

@Component({
  selector: 'app-ticket-sub-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ticket-sub-category-create.html'
})
export class TicketSubCategoryCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private ticketSubCategoryService: TicketSubCategoryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sub_category_name: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกชื่อเรื่อง');
      return;
    }

    this.loading = true;
    this.ticketSubCategoryService.create(this.form.value).subscribe({
      next: () => {
        this.toastr.success('สร้างเรื่องสำเร็จ');
        this.router.navigate(['/pages/settings/ticket-sub-category']);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/settings/ticket-sub-category']);
  }
}

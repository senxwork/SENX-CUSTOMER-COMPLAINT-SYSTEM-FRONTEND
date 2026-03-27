import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';

@Component({
  selector: 'app-ticket-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ticket-category-create.html'
})
export class TicketCategoryCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private ticketCategoryService: TicketCategoryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      category_name: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    this.loading = true;
    this.ticketCategoryService.create(this.form.value).subscribe({
      next: () => {
        this.toastr.success('สร้างหมวดหมู่สำเร็จ');
        this.router.navigate(['/pages/settings/ticket-category']);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/settings/ticket-category']);
  }
}

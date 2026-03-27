import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';

@Component({
  selector: 'app-ticket-sub-category-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ticket-sub-category-edit.html'
})
export class TicketSubCategoryEditComponent implements OnInit {
  id!: string;
  form!: FormGroup;
  loading = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ticketSubCategoryService: TicketSubCategoryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.form = this.fb.group({
      sub_category_name: ['', Validators.required],
      description: ['']
    });
    this.loadData();
  }

  loadData(): void {
    this.ticketSubCategoryService.getById(this.id).subscribe({
      next: (item) => {
        if (item) {
          this.form.patchValue({
            sub_category_name: item.sub_category_name,
            description: item.description
          });
        }
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        this.router.navigate(['/pages/settings/ticket-sub-category']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกชื่อเรื่อง');
      return;
    }

    this.loading = true;
    this.ticketSubCategoryService.update(this.id, this.form.value).subscribe({
      next: () => {
        this.toastr.success('บันทึกสำเร็จ');
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

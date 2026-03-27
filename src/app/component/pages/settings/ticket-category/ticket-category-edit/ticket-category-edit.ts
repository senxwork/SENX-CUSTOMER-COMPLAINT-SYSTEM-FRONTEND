import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';

@Component({
  selector: 'app-ticket-category-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ticket-category-edit.html'
})
export class TicketCategoryEditComponent implements OnInit {
  id!: string;
  form!: FormGroup;
  loading = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ticketCategoryService: TicketCategoryService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.form = this.fb.group({
      category_name: ['', Validators.required],
      description: ['']
    });
    this.loadData();
  }

  loadData(): void {
    this.ticketCategoryService.getById(this.id).subscribe({
      next: (item) => {
        if (item) {
          this.form.patchValue({
            category_name: item.category_name,
            description: item.description
          });
        }
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        this.router.navigate(['/pages/settings/ticket-category']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    this.loading = true;
    this.ticketCategoryService.update(this.id, this.form.value).subscribe({
      next: () => {
        this.toastr.success('บันทึกสำเร็จ');
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

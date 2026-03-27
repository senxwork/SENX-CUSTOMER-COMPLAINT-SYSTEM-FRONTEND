import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-update-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">เลือกหมวดหมู่ Ticket</h5>
      <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      @if (loadingCategories) {
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span class="ms-2">กำลังโหลด...</span>
      </div>
      } @else {
      <div class="mb-3">
        <label class="form-label">หมวดหมู่</label>
        <select class="form-select" [(ngModel)]="selectedCategoryId">
          <option value="">-- ไม่ระบุ --</option>
          @for (cat of categories; track cat.id) {
          <option [value]="cat.id">{{ cat.category_name }}</option>
          }
        </select>
      </div>
      }
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">ยกเลิก</button>
      <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving">
        @if (saving) {
        <span class="spinner-border spinner-border-sm me-2"></span>
        }
        บันทึก
      </button>
    </div>
  `
})
export class UpdateCategoryModalComponent implements OnInit {
  @Input() subTask: any;

  categories: any[] = [];
  selectedCategoryId: string = '';
  loadingCategories = true;
  saving = false;

  constructor(
    public modal: NgbActiveModal,
    private ticketCategoryService: TicketCategoryService,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    if (this.subTask?.ticketCategory?.id) {
      this.selectedCategoryId = this.subTask.ticketCategory.id;
    }
  }

  loadCategories(): void {
    this.ticketCategoryService.getAll().subscribe({
      next: (res) => {
        this.categories = Array.isArray(res) ? res : (res?.data || []);
        this.loadingCategories = false;
      },
      error: () => {
        this.toastr.error('ไม่สามารถโหลดหมวดหมู่ได้');
        this.loadingCategories = false;
      }
    });
  }

  save(): void {
    this.saving = true;
    this.complaintService.updateSubTaskCategory(this.subTask.id, this.selectedCategoryId || null, (Auth.user as any)?.first_name_last_name).subscribe({
      next: () => {
        this.toastr.success('บันทึกหมวดหมู่สำเร็จ');
        this.modal.close('updated');
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.saving = false;
      }
    });
  }
}

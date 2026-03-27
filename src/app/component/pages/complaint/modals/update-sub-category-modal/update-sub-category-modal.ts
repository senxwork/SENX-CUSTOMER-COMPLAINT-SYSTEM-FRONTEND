import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-update-sub-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">เลือกเรื่อง Ticket</h5>
      <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      @if (loading) {
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span class="ms-2">กำลังโหลด...</span>
      </div>
      } @else {
      <div class="mb-3">
        <label class="form-label">เรื่อง</label>
        <select class="form-select" [(ngModel)]="selectedId">
          <option value="">-- ไม่ระบุ --</option>
          @for (item of subCategories; track item.id) {
          <option [value]="item.id">{{ item.sub_category_name }}</option>
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
export class UpdateSubCategoryModalComponent implements OnInit {
  @Input() subTask: any;

  subCategories: any[] = [];
  selectedId: string = '';
  loading = true;
  saving = false;

  constructor(
    public modal: NgbActiveModal,
    private ticketSubCategoryService: TicketSubCategoryService,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubCategories();
    if (this.subTask?.ticketSubCategory?.id) {
      this.selectedId = this.subTask.ticketSubCategory.id;
    }
  }

  loadSubCategories(): void {
    this.ticketSubCategoryService.getAll().subscribe({
      next: (res) => {
        this.subCategories = Array.isArray(res) ? res : (res?.data || []);
        this.loading = false;
      },
      error: () => {
        this.toastr.error('ไม่สามารถโหลดรายการเรื่องได้');
        this.loading = false;
      }
    });
  }

  save(): void {
    this.saving = true;
    this.complaintService.updateSubTaskSubCategory(this.subTask.id, this.selectedId || null, (Auth.user as any)?.first_name_last_name).subscribe({
      next: () => {
        this.toastr.success('บันทึกเรื่องสำเร็จ');
        this.modal.close('updated');
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.saving = false;
      }
    });
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';

@Component({
  selector: 'app-ticket-sub-category-delete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">ยืนยันการลบ</h5>
      <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>คุณต้องการลบเรื่อง "<strong>{{ item?.sub_category_name }}</strong>" ใช่หรือไม่?</p>
      <p class="text-muted small">การลบข้อมูลนี้ไม่สามารถกู้คืนได้</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">ยกเลิก</button>
      <button type="button" class="btn btn-danger" (click)="confirm()" [disabled]="loading">
        @if (loading) {
          <span class="spinner-border spinner-border-sm me-2"></span>
        }
        ลบ
      </button>
    </div>
  `
})
export class TicketSubCategoryDeleteComponent {
  @Input() item: any;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private ticketSubCategoryService: TicketSubCategoryService,
    private toastr: ToastrService
  ) {}

  confirm(): void {
    this.loading = true;
    this.ticketSubCategoryService.delete(this.item.id).subscribe({
      next: () => {
        this.toastr.success('ลบสำเร็จ');
        this.modal.close('deleted');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }
}

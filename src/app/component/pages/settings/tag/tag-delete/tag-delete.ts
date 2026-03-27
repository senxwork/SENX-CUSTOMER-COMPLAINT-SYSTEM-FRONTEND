import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TagService } from 'src/app/shared/services/tag.service';

@Component({
  selector: 'app-tag-delete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">ยืนยันการลบ</h5>
      <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>คุณต้องการลบ "{{ item?.tag_name }}" ใช่หรือไม่?</p>
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
export class TagDeleteComponent {
  @Input() item: any;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private tagService: TagService,
    private toastr: ToastrService
  ) {}

  confirm(): void {
    this.loading = true;
    this.tagService.deleteTag(this.item.id).subscribe({
      next: () => {
        this.toastr.success('ลบสำเร็จ');
        this.modal.close('deleted');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }
}

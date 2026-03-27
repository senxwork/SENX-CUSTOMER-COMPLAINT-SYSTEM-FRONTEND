import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/shared/services/department.service';

@Component({
  selector: 'app-department-delete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">ยืนยันการลบ</h5>
      <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>คุณต้องการลบ "{{ item?.department_name }}" ใช่หรือไม่?</p>
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
export class DepartmentDeleteComponent {
  @Input() item: any;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private departmentService: DepartmentService,
    private toastr: ToastrService
  ) {}

  confirm(): void {
    this.loading = true;
    this.departmentService.deleteDepartment(this.item.id).subscribe({
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

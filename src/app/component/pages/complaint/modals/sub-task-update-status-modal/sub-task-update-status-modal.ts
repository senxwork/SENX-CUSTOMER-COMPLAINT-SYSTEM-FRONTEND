import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-sub-task-update-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sub-task-update-status-modal.html',
  styleUrl: './sub-task-update-status-modal.scss'
})
export class SubTaskUpdateStatusModalComponent implements OnInit {
  @Input() subTask!: any;

  selectedStatus = '';
  loading = false;

  statuses = [
    { value: 'open', label: 'Open', class: 'bg-primary' },
    { value: 'inprogress', label: 'In Progress', class: 'bg-warning' },
    { value: 'completed', label: 'Completed', class: 'bg-success' },
    { value: 'cancelled', label: 'Cancelled', class: 'bg-secondary' }
  ];

  constructor(
    public modal: NgbActiveModal,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.selectedStatus = this.subTask?.status || 'open';
  }

  onSubmit(): void {
    if (!this.selectedStatus) {
      this.toastr.warning('กรุณาเลือกสถานะ');
      return;
    }

    this.loading = true;
    const data = { status: this.selectedStatus, performed_by: (Auth.user as any)?.first_name_last_name };

    this.complaintService.updateSubTask(this.subTask.id, data).subscribe({
      next: () => {
        this.toastr.success('อัพเดทสถานะสำเร็จ');
        this.modal.close('updated');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return this.statuses.find(s => s.value === status)?.class || 'bg-secondary';
  }
}

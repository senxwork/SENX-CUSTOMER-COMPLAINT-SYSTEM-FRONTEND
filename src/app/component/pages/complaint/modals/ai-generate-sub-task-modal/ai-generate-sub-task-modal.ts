import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ai-generate-sub-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-generate-sub-task-modal.html',
  styleUrls: ['./ai-generate-sub-task-modal.scss']
})
export class AiGenerateSubTaskModalComponent implements OnInit {
  @Input() parentComplaint: any;

  loading = false;
  createdCount = 0;
  step = 1; // 1: Confirm, 2: Loading, 3: Done

  constructor(
    public activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  generateAndCreate(): void {
    this.loading = true;
    this.step = 2;
    this.complaintService.aiGenerate(
      this.parentComplaint.complaint_id,
      this.parentComplaint.case_number,
      this.parentComplaint.job_detail
    ).subscribe({
      next: (res) => {
        this.createdCount = res.created_count || 0;
        this.loading = false;
        this.step = 3;

        if (this.createdCount > 0) {
          this.toastr.success(`AI สร้าง Ticket สำเร็จ ${this.createdCount} รายการ`);
        } else {
          this.toastr.warning('AI ไม่พบรายการที่ต้องสร้าง');
        }

        // แจ้ง error แจ้งซ่อม (ถ้ามี)
        if (res.repair_errors?.length > 0) {
          this.toastr.warning(
            `แจ้งซ่อมไม่สำเร็จ: ${res.repair_errors.join(', ')}`,
            'Repair Request Error',
            { timeOut: 10000 }
          );
        }

        // ปิด modal อัตโนมัติหลังเสร็จ
        setTimeout(() => {
          this.close();
        }, 1500);
      },
      error: (err) => {
        this.toastr.error('AI Generation Failed');
        console.error(err);
        this.loading = false;
        this.activeModal.dismiss();
      }
    });
  }

  close(): void {
    this.activeModal.close(this.createdCount > 0 ? 'success' : null);
  }
}

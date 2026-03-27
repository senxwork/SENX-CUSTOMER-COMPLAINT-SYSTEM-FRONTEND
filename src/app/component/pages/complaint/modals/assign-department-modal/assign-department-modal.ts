import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { DepartmentService } from 'src/app/shared/services/department.service';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-assign-department-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-department-modal.html',
  styleUrls: ['./assign-department-modal.scss']
})
export class AssignDepartmentModalComponent implements OnInit {
  @Input() subTask: any;

  departments: any[] = [];
  selectedDepartmentId: string = '';
  loading = false;

  constructor(
    public activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private departmentService: DepartmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    if (this.subTask?.department?.id) {
      this.selectedDepartmentId = this.subTask.department.id;
    }
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => {
        this.departments = res.data || res;
      },
      error: () => {
        this.toastr.error('ไม่สามารถโหลดรายการหน่วยงานได้');
      }
    });
  }

  assign(): void {
    if (!this.selectedDepartmentId) {
      this.toastr.warning('กรุณาเลือกหน่วยงาน');
      return;
    }

    this.loading = true;
    this.complaintService.updateSubTaskDepartment(this.subTask.id, this.selectedDepartmentId, (Auth.user as any)?.first_name_last_name).subscribe({
      next: () => {
        this.toastr.success('มอบหมายหน่วยงานสำเร็จ');
        this.activeModal.close('assigned');
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }
}

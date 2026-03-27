import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-assign-work-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-work-modal.html',
  styleUrl: './assign-work-modal.scss'
})
export class AssignWorkModalComponent implements OnInit {
  @Input() complaint_id!: string;
  @Input() currentResponsible: any[] = [];

  users: any[] = [];
  selectedUserIds: string[] = [];
  loading = false;
  loadingUsers = false;

  constructor(
    public modal: NgbActiveModal,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Pre-select current responsible persons
    this.selectedUserIds = this.currentResponsible?.map(p => p.user_id) || [];
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    const user: any = Auth.user;
    const filterData = {
      job_departments_id: user?.jobDepartment?.job_departments_id
    };

    this.complaintService.getUserByDepartment(filterData).subscribe({
      next: (data: any) => {
        this.users = data || [];
        this.loadingUsers = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingUsers = false;
      }
    });
  }

  toggleUser(userId: string): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUserIds.includes(userId);
  }

  onSubmit(): void {
    if (this.selectedUserIds.length === 0) {
      this.toastr.warning('กรุณาเลือกผู้รับผิดชอบอย่างน้อย 1 คน');
      return;
    }

    this.loading = true;
    const data = {
      responsible_person_ids: this.selectedUserIds,
      performed_by: (Auth.user as any)?.first_name_last_name
    };

    this.complaintService.assignWork(this.complaint_id, data).subscribe({
      next: () => {
        this.toastr.success('มอบหมายงานสำเร็จ');
        this.modal.close('assigned');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }
}

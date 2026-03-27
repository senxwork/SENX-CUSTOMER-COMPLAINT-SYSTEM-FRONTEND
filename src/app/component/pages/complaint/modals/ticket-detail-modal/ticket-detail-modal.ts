import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';
import { DateThaiPipe } from 'src/app/shared/pipes/date-thai.pipe';
import { OrderByDatePipe } from 'src/app/shared/pipes/order-by-date.pipe';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';
import { AssignDepartmentModalComponent } from '../assign-department-modal/assign-department-modal';
import { UpdateTagsModalComponent } from '../update-tags-modal/update-tags-modal';
import { UpdateCategoryModalComponent } from '../update-category-modal/update-category-modal';
import { UpdateSubCategoryModalComponent } from '../update-sub-category-modal/update-sub-category-modal';
import { UpdateExpenseModalComponent } from '../update-expense-modal/update-expense-modal';

@Component({
  selector: 'app-ticket-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DateThaiPipe, OrderByDatePipe, HasPermissionDirective, NgbDropdownModule],
  templateUrl: './ticket-detail-modal.html',
  styleUrls: ['./ticket-detail-modal.scss']
})
export class TicketDetailModalComponent implements OnInit {
  @Input() ticket: any;
  @Input() parentStatus: string = '';

  user: any;
  loading = false;
  comment = '';
  commentFiles: File[] = [];
  reopening = false;
  hasUpdated = false;

  // Collapsible panels
  expensePanelOpen = true;
  commentsPanelOpen = true;

  // Repair request
  repairDetail: any = null;
  repairPanelOpen = false;
  loadingRepair = false;
  repairTab: 'info' | 'timeline' | 'notes' = 'info';

  // Tag options (static)
  tagOptions = [
    { id: 'senx_office', name: 'สำนักงานใหญ่ Senx' },
    { id: 'sena_office', name: 'สำนักงานใหญ่ เสนา' },
    { id: 'project', name: 'โครงการ' },
    { id: 'person', name: 'บุคคล' },
    { id: 'service', name: 'บริการ' }
  ];

  // Status options
  statusOptions = [
    { value: 'open', label: 'Open', icon: 'fa-folder-open-o', color: '#3b82f6' },
    { value: 'inprogress', label: 'In Progress', icon: 'fa-spinner', color: '#f59e0b' },
    { value: 'completed', label: 'Completed', icon: 'fa-check-circle', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', icon: 'fa-ban', color: '#94a3b8' }
  ];
  changingStatus = false;
  changingUrgent = false;
  changingProcessed = false;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = Auth.user;
    this.loadTicketDetail();
  }

  loadTicketDetail(): void {
    this.complaintService.getSubTask(this.ticket.id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.loadRepairStatus();
      },
      error: () => {}
    });
  }

  loadRepairStatus(): void {
    if (!this.ticket?.repair_request_id || this.repairDetail) return;
    this.complaintService.getRepairRequestDetail(this.ticket.id).subscribe({
      next: (data) => {
        this.repairDetail = data;
        this.repairPanelOpen = true;
      },
      error: () => {}
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'open': return 'badge bg-primary';
      case 'inprogress': return 'badge bg-warning';
      case 'completed': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'Open';
      case 'inprogress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  private repairStatusMap: Record<string, string> = {
    paymentPending: 'รอชำระเงิน',
    technicianDispatchPending: 'รอส่งผู้ให้บริการ',
    serviceInProgress: 'กำลังเข้าให้บริการ',
    completed: 'เสร็จสมบูรณ์',
    cancel: 'ยกเลิก',
    appointmentPending: 'รอนัดหมาย',
    confirmAppointmentPending: 'รอยืนยันนัดหมาย',
    repairInProgress: 'กำลังซ่อม',
    inspectionPending: 'รอตรวจสอบ',
    review: 'รีวิว',
  };

  private repairStatusClassMap: Record<string, string> = {
    paymentPending: 'repair-status-badge--warning',
    technicianDispatchPending: 'repair-status-badge--info',
    serviceInProgress: 'repair-status-badge--primary',
    completed: 'repair-status-badge--success',
    cancel: 'repair-status-badge--danger',
    appointmentPending: 'repair-status-badge--warning',
    confirmAppointmentPending: 'repair-status-badge--warning',
    repairInProgress: 'repair-status-badge--primary',
    inspectionPending: 'repair-status-badge--info',
    review: 'repair-status-badge--info',
  };

  getRepairStatusText(status: string): string {
    if (!status) return '-';
    return this.repairStatusMap[status] || status;
  }

  // แปลง status ที่อาจเป็น comma-separated เช่น "serviceInProgress,appointmentPending"
  getRepairStatusTexts(status: string): string {
    if (!status) return '-';
    return status.split(',')
      .map(s => s.trim())
      .filter(s => s && s !== 'null')
      .map(s => this.repairStatusMap[s] || s)
      .join(', ');
  }

  getRepairStatusClass(status: string): string {
    if (!status) return '';
    // ถ้าเป็น comma-separated ใช้สีของตัวแรก
    const first = status.split(',')[0]?.trim();
    return this.repairStatusClassMap[first] || '';
  }

  getTagName(tagId: string): string {
    return this.tagOptions.find(t => t.id === tagId)?.name || tagId;
  }

  // Action: Change Status
  changeStatus(newStatus: string): void {
    if (this.ticket?.status === newStatus || this.changingStatus) return;

    const statusLabel = this.getStatusOption(newStatus).label;
    if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น "${statusLabel}" ?`)) return;

    this.changingStatus = true;
    const data = { status: newStatus, performed_by: this.user?.first_name_last_name };

    this.complaintService.updateSubTask(this.ticket.id, data).subscribe({
      next: () => {
        this.ticket.status = newStatus;
        this.toastr.success('อัพเดทสถานะสำเร็จ');
        this.hasUpdated = true;
        this.changingStatus = false;
        this.loadTicketDetail();
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.changingStatus = false;
      }
    });
  }

  /** แสดง/ซ่อน confirm ปิดงาน */
  confirmingCloseJob = false;

  showCloseJobConfirm(): void {
    this.confirmingCloseJob = true;
  }

  cancelCloseJob(): void {
    this.confirmingCloseJob = false;
  }

  /** บันทึกปิดงาน: ส่ง comment (ถ้ามี) + เปลี่ยนสถานะเป็น completed */
  closeJob(): void {
    this.confirmingCloseJob = false;
    this.loading = true;
    const commentText = this.comment.trim() || 'บันทึกปิดงาน';

    // 1. บันทึก comment
    const txData = {
      transaction_detail: commentText,
      user_created: this.user?.user_id,
      performed_by: this.user?.first_name_last_name
    };
    this.complaintService.createSubTaskTransaction(this.ticket.id, txData).subscribe({
      next: () => {
        // 2. เปลี่ยนสถานะเป็น completed
        this.complaintService.updateSubTask(this.ticket.id, { status: 'completed', performed_by: this.user?.first_name_last_name }).subscribe({
          next: () => {
            this.ticket.status = 'completed';
            this.toastr.success('บันทึกปิดงานสำเร็จ');
            this.comment = '';
            this.commentFiles = [];
            this.hasUpdated = true;
            this.loading = false;
            this.loadTicketDetail();
          },
          error: () => {
            this.toastr.error('เกิดข้อผิดพลาด');
            this.loading = false;
          }
        });
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  getStatusOption(status: string) {
    return this.statusOptions.find(s => s.value === status) || this.statusOptions[0];
  }

  // Action: Assign Department
  openAssignDepartmentModal(): void {
    const modalRef = this.modalService.open(AssignDepartmentModalComponent, { size: 'md', windowClass: 'modal-over-panel' });
    modalRef.componentInstance.subTask = this.ticket;
    modalRef.result.then((result) => {
      if (result === 'assigned') {
        this.hasUpdated = true;
        this.loadTicketDetail();
      }
    }).catch(() => {});
  }

  // Action: Manage Tags
  openTagsModal(): void {
    const modalRef = this.modalService.open(UpdateTagsModalComponent, { centered: true });
    modalRef.componentInstance.subTask = this.ticket;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.hasUpdated = true;
        this.loadTicketDetail();
      }
    }).catch(() => {});
  }

  // Action: Update Category
  openCategoryModal(): void {
    const modalRef = this.modalService.open(UpdateCategoryModalComponent, { size: 'md', windowClass: 'modal-over-panel' });
    modalRef.componentInstance.subTask = this.ticket;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.hasUpdated = true;
        this.loadTicketDetail();
      }
    }).catch(() => {});
  }

  // Action: Update Sub Category
  openSubCategoryModal(): void {
    const modalRef = this.modalService.open(UpdateSubCategoryModalComponent, { size: 'md', windowClass: 'modal-over-panel' });
    modalRef.componentInstance.subTask = this.ticket;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.hasUpdated = true;
        this.loadTicketDetail();
      }
    }).catch(() => {});
  }

  // Action: Update Expense
  openExpenseModal(): void {
    const modalRef = this.modalService.open(UpdateExpenseModalComponent, { centered: true });
    modalRef.componentInstance.subTask = this.ticket;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.hasUpdated = true;
        this.loadTicketDetail();
      }
    }).catch(() => {});
  }

  // Action: Set Urgent
  setUrgent(value: boolean): void {
    if (this.ticket?.urgent === value || this.changingUrgent) return;

    const label = value ? 'ด่วน' : 'ไม่ด่วน';
    if (!confirm(`ยืนยันเปลี่ยนเป็น "${label}" ?`)) return;

    this.changingUrgent = true;
    this.complaintService.updateSubTask(this.ticket.id, { urgent: value, performed_by: this.user?.first_name_last_name }).subscribe({
      next: () => {
        this.ticket.urgent = value;
        this.toastr.success(value ? 'ตั้งเป็นด่วนแล้ว' : 'ยกเลิกด่วนแล้ว');
        this.hasUpdated = true;
        this.changingUrgent = false;
        this.loadTicketDetail();
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.changingUrgent = false;
      }
    });
  }

  // Action: Set Processed
  setProcessed(value: boolean): void {
    if (this.ticket?.is_processed === value || this.changingProcessed) return;

    const label = value ? 'ดำเนินการ' : 'ไม่ดำเนินการ';
    if (!confirm(`ยืนยันเปลี่ยนเป็น "${label}" ?`)) return;

    this.changingProcessed = true;
    this.complaintService.updateSubTask(this.ticket.id, { is_processed: value, performed_by: this.user?.first_name_last_name }).subscribe({
      next: () => {
        this.ticket.is_processed = value;
        this.toastr.success(value ? 'ดำเนินการแล้ว' : 'ไม่ดำเนินการแล้ว');
        this.hasUpdated = true;
        this.changingProcessed = false;
        this.loadTicketDetail();
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.changingProcessed = false;
      }
    });
  }

  // Action: Reopen Ticket
  reopenTicket(): void {
    if (!confirm('ยืนยันเปิด Ticket ใหม่ ?')) return;

    this.reopening = true;
    this.complaintService.updateSubTask(this.ticket.id, { status: 'inprogress', performed_by: this.user?.first_name_last_name }).subscribe({
      next: () => {
        this.toastr.success('เปิด Ticket ใหม่สำเร็จ');
        this.reopening = false;
        this.hasUpdated = true;
        this.loadTicketDetail();
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.reopening = false;
      }
    });
  }

  // Add Comment
  addComment(): void {
    if (!this.comment.trim()) return;

    this.loading = true;
    const data = {
      transaction_detail: this.comment,
      user_created: this.user?.user_id,
      performed_by: this.user?.first_name_last_name
    };

    this.complaintService.createSubTaskTransaction(this.ticket.id, data).subscribe({
      next: (res: any) => {
        this.autoSetTicketInProgress();
        const transactionId = res?.id;
        if (this.commentFiles.length > 0 && transactionId) {
          this.uploadCommentFiles(transactionId);
        } else {
          this.toastr.success('เพิ่มบันทึกสำเร็จ');
          this.comment = '';
          this.commentFiles = [];
          this.loadTicketDetail();
          this.loading = false;
        }
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  /** ถ้า Ticket ยังเป็น open → เปลี่ยนเป็น inprogress อัตโนมัติ */
  private autoSetTicketInProgress(): void {
    if (this.ticket?.status === 'open') {
      this.complaintService.updateSubTask(this.ticket.id, { status: 'inprogress' }).subscribe({
        next: () => {
          this.ticket.status = 'inprogress';
          this.hasUpdated = true;
        },
        error: () => {}
      });
    }
  }

  uploadCommentFiles(transactionId: string): void {
    let uploaded = 0;
    const total = this.commentFiles.length;

    this.commentFiles.forEach(file => {
      this.complaintService.uploadSubTaskTransactionFile(transactionId, file).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === total) {
            this.toastr.success('เพิ่มบันทึกและไฟล์แนบสำเร็จ');
            this.comment = '';
            this.commentFiles = [];
            this.loadTicketDetail();
            this.loading = false;
          }
        },
        error: () => {
          uploaded++;
          if (uploaded === total) {
            this.toastr.warning('เพิ่มบันทึกสำเร็จ แต่บางไฟล์อัพโหลดไม่สำเร็จ');
            this.comment = '';
            this.commentFiles = [];
            this.loadTicketDetail();
            this.loading = false;
          }
        }
      });
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.commentFiles.push(input.files[i]);
      }
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.commentFiles.splice(index, 1);
  }

  getTransactionFileUrl(filename: string): string {
    return this.complaintService.getSubTaskTransactionFile(filename);
  }

  isImageFile(filename: string): boolean {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  }

  isPdfFile(filename: string): boolean {
    return filename?.split('.').pop()?.toLowerCase() === 'pdf';
  }

  getDueDate(ticket: any): Date {
    if (ticket.due_date) return new Date(ticket.due_date);
    const d = new Date(ticket.created_at);
    d.setDate(d.getDate() + 15);
    return d;
  }

  getAgingDays(createdAt: string | Date, endDate?: string | Date): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  isAgingOverdue(createdAt: string | Date, status: string): boolean {
    if (status === 'completed' || status === 'cancelled') return false;
    return this.getAgingDays(createdAt) > 15;
  }

  // Repair: normalize notes (handle both flat array and Strapi {data:[]} format)
  getRepairNotes(): any[] {
    const note = this.repairDetail?.data?.attributes?.note;
    if (Array.isArray(note)) return note;
    if (note?.data && Array.isArray(note.data)) {
      return note.data.map((n: any) => ({ id: n.id, ...n.attributes }));
    }
    return [];
  }

  // Repair: normalize status logs
  getRepairStatusLogs(): any[] {
    const logs = this.repairDetail?.data?.attributes?.status_logs;
    if (Array.isArray(logs)) return logs;
    if (logs?.data && Array.isArray(logs.data)) return logs.data;
    return [];
  }

  // Repair request detail
  viewRepairDetail(): void {
    if (this.repairPanelOpen) {
      this.repairPanelOpen = false;
      return;
    }
    if (this.repairDetail) {
      this.repairPanelOpen = true;
      return;
    }
    this.loadingRepair = true;
    this.complaintService.getRepairRequestDetail(this.ticket.id).subscribe({
      next: (data) => {
        this.repairDetail = data;
        this.repairPanelOpen = true;
        this.loadingRepair = false;
      },
      error: () => {
        this.toastr.error('ไม่สามารถดึงข้อมูลแจ้งซ่อมได้');
        this.loadingRepair = false;
      }
    });
  }
}

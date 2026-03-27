import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { ComplaintTransactionService } from 'src/app/shared/services/complaint-transaction.service';
import { BusinessUnitService } from 'src/app/shared/services/business-unit.service';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { JobCategoryService } from 'src/app/shared/services/job-category.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { DateThaiPipe } from 'src/app/shared/pipes/date-thai.pipe';
import { OrderByDatePipe } from 'src/app/shared/pipes/order-by-date.pipe';
import { UpdateStatusModalComponent } from '../modals/update-status-modal/update-status-modal';
import { AssignWorkModalComponent } from '../modals/assign-work-modal/assign-work-modal';
import { AiGenerateSubTaskModalComponent } from '../modals/ai-generate-sub-task-modal/ai-generate-sub-task-modal';
import { AssignDepartmentModalComponent } from '../modals/assign-department-modal/assign-department-modal';
import { UpdateTagsModalComponent } from '../modals/update-tags-modal/update-tags-modal';
import { SubTaskUpdateStatusModalComponent } from '../modals/sub-task-update-status-modal/sub-task-update-status-modal';
import { UpdateCategoryModalComponent } from '../modals/update-category-modal/update-category-modal';
import { TicketDetailModalComponent } from '../modals/ticket-detail-modal/ticket-detail-modal';
import { CreateTicketModalComponent } from '../modals/create-ticket-modal/create-ticket-modal';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';
import { ActivityLogService } from 'src/app/shared/services/activity-log.service';


@Component({
  selector: 'app-complaint-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgMultiSelectDropDownModule, DateThaiPipe, OrderByDatePipe, HasPermissionDirective],
  templateUrl: './complaint-view.html',
  styleUrl: './complaint-view.scss'
})
export class ComplaintViewComponent implements OnInit {
  complaint_id!: string;
  complaint: any;
  user: any;
  newComment = '';
  commentFiles: File[] = [];
  loading = false;
  activeTab = 1;

  // Sub-work requests (children)
  children: any[] = [];

  // Edit mode
  checkEdit = false;
  savingEdit = false;

  // Dropdown data for edit mode
  businessUnits: any[] = [];
  contactChannels: any[] = [];
  jobCategories: any[] = [];
  projects: any[] = [];

  // Selected items for dropdowns
  selectedBU: any[] = [];
  selectedChannel: any[] = [];
  selectedCategory: any[] = [];
  selectedProject: any[] = [];
  selectedTags: any[] = [];

  // Tag options (static)
  tagOptions = [
    { id: 'senx_office', name: 'สำนักงานใหญ่ Senx' },
    { id: 'sena_office', name: 'สำนักงานใหญ่ เสนา' },
    { id: 'project', name: 'โครงการ' },
    { id: 'person', name: 'บุคคล' },
    { id: 'service', name: 'บริการ' }
  ];

  // Child detail (expandable)
  selectedChildId: string | null = null;
  selectedChildData: any = null;
  childComment = '';
  childCommentFiles: { [key: string]: File[] } = {};
  childLoading = false;

  // Comments for each sub-task (key = sub-task id)
  childComments: { [key: string]: string } = {};

  // Inline edit for sub-task title
  editingChildId: string | null = null;
  editingChildTitle = '';

  // Re-open ticket
  reopeningTicketId: string | null = null;

  // Ticket unread notification dots
  ticketUnreadMap: Record<string, number> = {};

  // Activity logs
  activityLogs: any[] = [];
  activityLogsLoading = false;
  activityLogSearch = '';
  activityLogTypeFilter = '';

  // Editable fields
  editCustomerName = '';
  editHouseName = '';
  editTelephone = '';
  editEmail = '';
  editJobDetail = '';

  // Dropdown settings
  buDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'bu_name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    searchPlaceholderText: 'ค้นหา...',
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  channelDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'channel_name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    searchPlaceholderText: 'ค้นหา...',
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  categoryDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'catagory_name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    searchPlaceholderText: 'ค้นหา...',
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  projectDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'project_name_th',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    searchPlaceholderText: 'ค้นหา...',
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  tagDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'เลือกทั้งหมด',
    unSelectAllText: 'ยกเลิกทั้งหมด',
    allowSearchFilter: false,
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
    public complaintService: ComplaintService,
    public transactionService: ComplaintTransactionService,
    private businessUnitService: BusinessUnitService,
    private contactChannelService: ContactChannelService,
    private jobCategoryService: JobCategoryService,
    private projectService: ProjectService,
    private activityLogService: ActivityLogService
  ) {}

  private pendingTicketId: string | null = null;

  ngOnInit(): void {
    this.user = Auth.user;
    this.complaint_id = this.route.snapshot.params['complaint_id'];
    this.pendingTicketId = this.route.snapshot.queryParams['ticket'] || null;
    this.loadData();

    // Reload when navigating to different complaint
    this.route.params.subscribe(params => {
      if (params['complaint_id'] !== this.complaint_id) {
        this.complaint_id = params['complaint_id'];
        this.selectedChildId = null;
        this.selectedChildData = null;
        this.activeTab = 1;
        this.pendingTicketId = this.route.snapshot.queryParams['ticket'] || null;
        this.loadData();
      }
    });
    // Open ticket modal when query param changes (same complaint, different ticket from notification)
    this.route.queryParams.subscribe(qp => {
      if (qp['ticket'] && this.children.length > 0) {
        const ticket = this.children.find((c: any) => c.id === qp['ticket']);
        if (ticket) {
          this.pendingTicketId = null;
          setTimeout(() => this.openTicketDetailModal(ticket), 300);
        }
      }
    });
  }

  loadData(): void {
    this.complaintService.getById(this.complaint_id).subscribe({
      next: (data) => {
        this.complaint = data;
        this.loadChildren();
      },
      error: (err) => {
        this.toastr.error('ไม่พบข้อมูล');
        this.router.navigate(['/pages/complaint/list']);
      }
    });
  }

  loadChildren(): void {
    this.complaintService.getSubTasksByParent(this.complaint_id).subscribe({
      next: (data) => {
        this.children = data || [];
        this.loadTicketUnreadMap();
        // Auto-open ticket modal if navigated from notification
        if (this.pendingTicketId) {
          const ticket = this.children.find((c: any) => c.id === this.pendingTicketId);
          if (ticket) {
            setTimeout(() => this.openTicketDetailModal(ticket), 300);
          }
          this.pendingTicketId = null;
        }
      },
      error: () => {
        this.children = [];
      }
    });
  }

  loadTicketUnreadMap(): void {
    if (!this.children.length || !this.user?.department) return;
    const ticketIds = this.children.map((c: any) => c.id);
    this.activityLogService.getTicketUnreadMap(this.user.department, ticketIds).subscribe({
      next: (map) => this.ticketUnreadMap = map || {},
      error: () => this.ticketUnreadMap = {},
    });
  }

  openCreateChild(): void {
    this.router.navigate(['/pages/complaint/create'], {
      queryParams: { parent_id: this.complaint_id }
    });
  }

  openAIGenerateModal(): void {
    const modalRef = this.modalService.open(AiGenerateSubTaskModalComponent, { size: 'lg' });
    modalRef.componentInstance.parentComplaint = this.complaint;
    modalRef.result.then((result) => {
      if (result === 'success') {
        this.loadChildren();
      }
    }).catch(() => {});
  }

  openCreateTicketModal(): void {
    const modalRef = this.modalService.open(CreateTicketModalComponent, { size: 'lg' });
    modalRef.componentInstance.complaintId = this.complaint_id;
    modalRef.result.then((result) => {
      if (result === 'created') {
        this.loadChildren();
      }
    }).catch(() => {});
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    this.loading = true;
    const data = {
      complaint_transaction_detail: this.newComment,
      user_created: this.user?.user_id,
      performed_by: this.user?.first_name_last_name
    };

    this.transactionService.createTransaction(this.complaint_id, data).subscribe({
      next: (res: any) => {
        const transactionId = res?.res?.id || res?.res?.complaint_transaction_id || res?.id || res?.complaint_transaction_id;
        if (this.commentFiles.length > 0 && transactionId) {
          this.uploadCommentFiles(transactionId);
        } else {
          this.toastr.success('เพิ่มความคิดเห็นสำเร็จ');
          this.newComment = '';
          this.commentFiles = [];
          this.loadData();
          this.loading = false;
        }
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  uploadCommentFiles(transactionId: string): void {
    let uploaded = 0;
    const total = this.commentFiles.length;

    this.commentFiles.forEach(file => {
      this.transactionService.uploadAttachFile(transactionId, file).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === total) {
            this.toastr.success('เพิ่มความคิดเห็นและไฟล์แนบสำเร็จ');
            this.newComment = '';
            this.commentFiles = [];
            this.loadData();
            this.loading = false;
          }
        },
        error: () => {
          uploaded++;
          this.toastr.warning('บางไฟล์อัพโหลดไม่สำเร็จ');
          if (uploaded === total) {
            this.newComment = '';
            this.commentFiles = [];
            this.loadData();
            this.loading = false;
          }
        }
      });
    });
  }

  onCommentFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.commentFiles.push(input.files[i]);
      }
    }
    input.value = '';
  }

  removeCommentFile(index: number): void {
    this.commentFiles.splice(index, 1);
  }

  openUpdateStatusModal(): void {
    const modalRef = this.modalService.open(UpdateStatusModalComponent, { size: 'md' });
    modalRef.componentInstance.complaint_id = this.complaint.complaint_id;
    modalRef.componentInstance.currentStatus = this.complaint.status;
    modalRef.result.then((result) => {
      if (result === 'updated') this.loadData();
    }).catch(() => {});
  }

  openAssignWorkModal(): void {
    const modalRef = this.modalService.open(AssignWorkModalComponent, { size: 'lg' });
    modalRef.componentInstance.complaint_id = this.complaint.complaint_id;
    modalRef.componentInstance.currentResponsible = this.complaint.responsible_persons || [];
    modalRef.result.then((result) => {
      if (result === 'assigned') this.loadData();
    }).catch(() => {});
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

  getFileUrl(filename: string): string {
    return this.complaintService.getAttachFile(filename);
  }

  isImageFile(filename: string): boolean {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  }

  isPdfFile(filename: string): boolean {
    return filename?.split('.').pop()?.toLowerCase() === 'pdf';
  }

  getTagName(tagId: string): string {
    return this.tagOptions.find(t => t.id === tagId)?.name || tagId;
  }

  getStatusCount(status: string): number {
    return this.children.filter(c => c.status === status).length;
  }

  getCompletionPercent(): number {
    if (this.children.length === 0) return 0;
    return Math.round((this.getStatusCount('completed') / this.children.length) * 100);
  }

  getCompanyLabel(): string {
    if (!this.children || this.children.length === 0) return 'ยังไม่ระบุเจ้าของงาน';
    const hasDepartment = this.children.some(c => c.department);
    if (!hasDepartment) return 'ยังไม่ระบุเจ้าของงาน';
    const hasSenx = this.children.some(c => c.department?.company === 'SENX');
    return hasSenx ? 'SENX' : 'SENA';
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

  goBack(): void {
    this.router.navigate(['/pages/complaint/list']);
  }

  // Edit mode methods
  enableEditMode(): void {
    this.checkEdit = true;
    this.loadDropdownData();

    // Set editable fields from complaint
    this.editCustomerName = this.complaint?.customer_name || '';
    this.editHouseName = this.complaint?.house_name || '';
    this.editTelephone = this.complaint?.telephone || '';
    this.editEmail = this.complaint?.email || '';
    this.editJobDetail = this.complaint?.job_detail || '';

    // Set selected dropdown values
    if (this.complaint?.businessUnit) {
      this.selectedBU = [this.complaint.businessUnit];
    }
    if (this.complaint?.contactChannel) {
      this.selectedChannel = [this.complaint.contactChannel];
    }
    if (this.complaint?.complaintJobCatagory) {
      this.selectedCategory = [this.complaint.complaintJobCatagory];
    }
    if (this.complaint?.project) {
      this.selectedProject = [this.complaint.project];
    }
    if (this.complaint?.tags && Array.isArray(this.complaint.tags)) {
      this.selectedTags = this.tagOptions.filter(t => this.complaint.tags.includes(t.id));
    }
  }

  cancelEdit(): void {
    this.checkEdit = false;
    this.selectedBU = [];
    this.selectedChannel = [];
    this.selectedCategory = [];
    this.selectedProject = [];
    this.selectedTags = [];
  }

  saveEdit(): void {
    this.savingEdit = true;

    const data = {
      job_catagory_id: this.selectedCategory[0]?.id || this.complaint?.complaintJobCatagory?.id,
      businessUnit_id: this.selectedBU[0]?.id || this.complaint?.businessUnit?.id,
      contactChannel_id: this.selectedChannel[0]?.id || this.complaint?.contactChannel?.id,
      project_id: this.selectedProject[0]?.id || this.complaint?.project?.id,
      customer_name: this.editCustomerName,
      house_name: this.editHouseName,
      telephone: this.editTelephone,
      email: this.editEmail,
      job_detail: this.editJobDetail,
      performed_by: this.user?.first_name_last_name
    };

    this.complaintService.updateCat(this.complaint_id, data).subscribe({
      next: () => {
        this.toastr.success('บันทึกข้อมูลสำเร็จ');
        this.checkEdit = false;
        this.savingEdit = false;
        this.loadData();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'เกิดข้อผิดพลาด');
        this.savingEdit = false;
      }
    });
  }

  // Child expandable methods (for sub-tasks)
  toggleChild(child: any): void {
    if (this.selectedChildId === child.id) {
      this.selectedChildId = null;
      this.selectedChildData = null;
      this.childComment = '';
    } else {
      this.selectedChildId = child.id;
      this.childComment = '';
      this.loadChildDetail(child.id);
    }
  }

  loadChildDetail(subTaskId: string): void {
    this.childLoading = true;
    this.complaintService.getSubTask(subTaskId).subscribe({
      next: (data) => {
        this.selectedChildData = data;
        this.childLoading = false;
      },
      error: () => {
        this.childLoading = false;
      }
    });
  }

  addChildComment(): void {
    if (!this.childComment.trim() || !this.selectedChildId) return;

    this.childLoading = true;
    const data = {
      transaction_detail: this.childComment,
      user_created: this.user?.user_id,
      performed_by: this.user?.first_name_last_name
    };

    const files = this.childCommentFiles[this.selectedChildId] || [];

    this.complaintService.createSubTaskTransaction(this.selectedChildId, data).subscribe({
      next: (res: any) => {
        const transactionId = res?.res?.id || res?.id;
        if (files.length > 0 && transactionId) {
          this.uploadChildCommentFiles(transactionId, this.selectedChildId!);
        } else {
          this.toastr.success('เพิ่มความคิดเห็นสำเร็จ');
          this.childComment = '';
          this.childCommentFiles[this.selectedChildId!] = [];
          this.loadChildDetail(this.selectedChildId!);
          this.childLoading = false;
        }
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.childLoading = false;
      }
    });
  }

  uploadChildCommentFiles(transactionId: string, subTaskId: string): void {
    const files = this.childCommentFiles[subTaskId] || [];
    let uploaded = 0;
    const total = files.length;

    files.forEach(file => {
      this.complaintService.uploadSubTaskTransactionFile(transactionId, file).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === total) {
            this.toastr.success('เพิ่มความคิดเห็นและไฟล์แนบสำเร็จ');
            this.childComment = '';
            this.childCommentFiles[subTaskId] = [];
            this.loadChildDetail(this.selectedChildId!);
            this.childLoading = false;
          }
        },
        error: () => {
          uploaded++;
          this.toastr.warning('บางไฟล์อัพโหลดไม่สำเร็จ');
          if (uploaded === total) {
            this.childComment = '';
            this.childCommentFiles[subTaskId] = [];
            this.loadChildDetail(this.selectedChildId!);
            this.childLoading = false;
          }
        }
      });
    });
  }

  // Add comment to specific sub-task (for full display mode)
  addSubTaskComment(subTask: any): void {
    const comment = this.childComments[subTask.id]?.trim();
    if (!comment) return;

    const data = {
      transaction_detail: comment,
      user_created: this.user?.user_id,
      performed_by: this.user?.first_name_last_name
    };

    this.complaintService.createSubTaskTransaction(subTask.id, data).subscribe({
      next: (response: any) => {
        const transactionId = response?.id;
        const files = this.childCommentFiles[subTask.id] || [];

        if (files.length > 0 && transactionId) {
          this.uploadSubTaskTransactionFiles(transactionId, files, subTask.id);
        } else {
          this.toastr.success('เพิ่มความคิดเห็นสำเร็จ');
          this.childComments[subTask.id] = '';
          this.childCommentFiles[subTask.id] = [];
          this.loadChildren();
        }
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
      }
    });
  }

  private uploadSubTaskTransactionFiles(transactionId: string, files: File[], subTaskId: string): void {
    let completed = 0;
    const total = files.length;

    files.forEach(file => {
      this.complaintService.uploadSubTaskTransactionFile(transactionId, file).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.toastr.success('เพิ่มความคิดเห็นและไฟล์แนบสำเร็จ');
            this.childComments[subTaskId] = '';
            this.childCommentFiles[subTaskId] = [];
            this.loadChildren();
          }
        },
        error: () => {
          completed++;
          if (completed === total) {
            this.toastr.warning('เพิ่มความคิดเห็นสำเร็จ แต่บางไฟล์อัพโหลดไม่สำเร็จ');
            this.childComments[subTaskId] = '';
            this.childCommentFiles[subTaskId] = [];
            this.loadChildren();
          }
        }
      });
    });
  }

  onChildCommentFilesSelected(event: Event, subTaskId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (!this.childCommentFiles[subTaskId]) {
        this.childCommentFiles[subTaskId] = [];
      }
      for (let i = 0; i < input.files.length; i++) {
        this.childCommentFiles[subTaskId].push(input.files[i]);
      }
    }
    input.value = '';
  }

  removeChildCommentFile(subTaskId: string, index: number): void {
    if (this.childCommentFiles[subTaskId]) {
      this.childCommentFiles[subTaskId].splice(index, 1);
    }
  }

  openChildUpdateStatusModal(subTask: any): void {
    const modalRef = this.modalService.open(SubTaskUpdateStatusModalComponent, { size: 'md' });
    modalRef.componentInstance.subTask = subTask;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadChildren();
        if (this.selectedChildId) {
          this.loadChildDetail(this.selectedChildId);
        }
      }
    }).catch(() => {});
  }

  openChildAssignWorkModal(child: any): void {
    const modalRef = this.modalService.open(AssignWorkModalComponent, { size: 'lg' });
    modalRef.componentInstance.complaint_id = child.complaint_id;
    modalRef.componentInstance.currentResponsible = child.responsible_persons || [];
    modalRef.result.then((result) => {
      if (result === 'assigned') {
        this.loadChildren();
        this.loadChildDetail(child.complaint_id);
      }
    }).catch(() => {});
  }

  // Assign department to sub-task
  openAssignDepartmentModal(subTask: any): void {
    const modalRef = this.modalService.open(AssignDepartmentModalComponent, { size: 'md' });
    modalRef.componentInstance.subTask = subTask;
    modalRef.result.then((result) => {
      if (result === 'assigned') {
        this.loadChildren();
        if (this.selectedChildId) {
          this.loadChildDetail(this.selectedChildId);
        }
      }
    }).catch(() => {});
  }

  loadDropdownData(): void {
    // Load Business Units
    this.businessUnitService.getAll().subscribe({
      next: (res) => this.businessUnits = res,
      error: (err) => console.error(err)
    });

    // Load Contact Channels
    this.contactChannelService.getAll().subscribe({
      next: (res) => this.contactChannels = res,
      error: (err) => console.error(err)
    });

    // Load Job Categories
    this.jobCategoryService.getAllCategories().subscribe({
      next: (res) => this.jobCategories = res,
      error: (err) => console.error(err)
    });

    // Load Projects
    this.projectService.getAllProjects().subscribe({
      next: (res) => {
        this.projects = (res.data || res).sort((a: any, b: any) =>
          (a.project_name_th || '').localeCompare(b.project_name_th || '')
        );
      },
      error: (err) => console.error(err)
    });
  }

  // Inline edit sub-task title
  startEditChildTitle(child: any): void {
    this.editingChildId = child.id;
    this.editingChildTitle = child.ticket_detail || '';
  }

  cancelEditChildTitle(): void {
    this.editingChildId = null;
    this.editingChildTitle = '';
  }

  saveChildTitle(child: any): void {
    if (!this.editingChildTitle.trim()) {
      this.toastr.warning('กรุณากรอกหัวข้อ Ticket');
      return;
    }

    this.complaintService.updateSubTask(child.id, { ticket_detail: this.editingChildTitle, performed_by: this.user?.first_name_last_name }).subscribe({
      next: () => {
        this.toastr.success('แก้ไขหัวข้อ Ticket สำเร็จ');
        child.ticket_detail = this.editingChildTitle;
        this.editingChildId = null;
        this.editingChildTitle = '';
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
      }
    });
  }

  // Open Tags Modal for sub-task
  openTagsModal(child: any): void {
    const modalRef = this.modalService.open(UpdateTagsModalComponent, { centered: true });
    modalRef.componentInstance.subTask = child;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadChildren();
      }
    }).catch(() => {});
  }

  // Open Category Modal for sub-task
  openCategoryModal(child: any): void {
    const modalRef = this.modalService.open(UpdateCategoryModalComponent, { size: 'md' });
    modalRef.componentInstance.subTask = child;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadChildren();
      }
    }).catch(() => {});
  }

  // Open Ticket Detail Modal
  openTicketDetailModal(ticket: any): void {
    // Mark ticket as read (per department)
    if (this.ticketUnreadMap[ticket.id] && this.user?.department) {
      this.activityLogService.markTicketAsRead(this.user.department, ticket.id, this.user.user_id).subscribe({
        next: () => {
          delete this.ticketUnreadMap[ticket.id];
          ActivityLogService.triggerRefresh();
        },
      });
    }

    const modalRef = this.modalService.open(TicketDetailModalComponent, { size: 'xl', windowClass: 'modal-right', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.ticket = ticket;
    modalRef.componentInstance.parentStatus = this.complaint?.status;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadChildren();
      }
    }).catch(() => {});
  }

  // Activity log from API
  loadActivityLogs(): void {
    this.activityLogsLoading = true;
    const subTaskIds = this.children.map(c => c.id);
    this.activityLogService.getByComplaint(this.complaint_id, subTaskIds).subscribe({
      next: (logs: any[]) => {
        this.activityLogs = logs.map(log => ({
          ...log,
          ...this.getActionTypeConfig(log.action_type),
        }));
        this.activityLogsLoading = false;
      },
      error: () => {
        this.activityLogs = [];
        this.activityLogsLoading = false;
      }
    });
  }

  getActionTypeConfig(actionType: string): { icon: string; color: string; label: string } {
    const configs: { [key: string]: { icon: string; color: string; label: string } } = {
      CREATE_CASE: { icon: 'fa-plus-circle', color: '#10b981', label: 'สร้าง Case' },
      CREATE_CASE_EXTERNAL: { icon: 'fa-external-link', color: '#10b981', label: 'สร้าง Case (API)' },
      UPDATE_CASE_STATUS: { icon: 'fa-refresh', color: '#3b82f6', label: 'เปลี่ยนสถานะ Case' },
      ASSIGN_OM: { icon: 'fa-user-plus', color: '#6366f1', label: 'มอบหมาย OM' },
      UPDATE_CASE_INFO: { icon: 'fa-edit', color: '#3b82f6', label: 'แก้ไขข้อมูล Case' },
      ASSIGN_WORK: { icon: 'fa-users', color: '#6366f1', label: 'มอบหมายงาน' },
      UPDATE_CASE: { icon: 'fa-pencil', color: '#3b82f6', label: 'อัพเดท Case' },
      AI_GENERATE_TICKETS: { icon: 'fa-magic', color: '#8b5cf6', label: 'AI สร้าง Ticket' },
      CREATE_TICKET: { icon: 'fa-ticket', color: '#10b981', label: 'สร้าง Ticket' },
      ASSIGN_DEPARTMENT: { icon: 'fa-building-o', color: '#f59e0b', label: 'มอบหมายหน่วยงาน' },
      UPDATE_TICKET_CATEGORY: { icon: 'fa-folder-o', color: '#3b82f6', label: 'เปลี่ยนหมวดหมู่' },
      UPDATE_TICKET_SUB_CATEGORY: { icon: 'fa-file-text-o', color: '#3b82f6', label: 'เปลี่ยนประเภทเรื่อง' },
      UPDATE_TICKET_STATUS: { icon: 'fa-refresh', color: '#eab308', label: 'เปลี่ยนสถานะ Ticket' },
      UPDATE_TICKET: { icon: 'fa-pencil', color: '#3b82f6', label: 'อัพเดท Ticket' },
      DELETE_TICKET: { icon: 'fa-trash', color: '#ef4444', label: 'ลบ Ticket' },
      ADD_TICKET_COMMENT: { icon: 'fa-comment-o', color: '#8b5cf6', label: 'บันทึก Ticket' },
      ADD_CASE_COMMENT: { icon: 'fa-comment', color: '#3b82f6', label: 'ความคิดเห็น Case' },
      PUBLIC_ADD_COMMENT: { icon: 'fa-external-link', color: '#f59e0b', label: 'บันทึกจากภายนอก' },
      PUBLIC_UPDATE_STATUS: { icon: 'fa-external-link', color: '#f59e0b', label: 'เปลี่ยนสถานะ (ภายนอก)' },
    };
    return configs[actionType] || { icon: 'fa-circle', color: '#6b7280', label: actionType };
  }

  get filteredActivityLogs(): any[] {
    let logs = this.activityLogs;
    if (this.activityLogTypeFilter) {
      logs = logs.filter(l => l.action_type === this.activityLogTypeFilter);
    }
    if (this.activityLogSearch?.trim()) {
      const keyword = this.activityLogSearch.trim().toLowerCase();
      logs = logs.filter(l =>
        (l.performed_by || '').toLowerCase().includes(keyword) ||
        (l.action_detail || '').toLowerCase().includes(keyword) ||
        (l.ref_number || '').toLowerCase().includes(keyword) ||
        (l.label || '').toLowerCase().includes(keyword)
      );
    }
    return logs;
  }

  get activityLogActionTypes(): { value: string; label: string }[] {
    const seen = new Set<string>();
    return this.activityLogs
      .filter(l => { if (seen.has(l.action_type)) return false; seen.add(l.action_type); return true; })
      .map(l => ({ value: l.action_type, label: l.label }));
  }

  // Re-open ticket (change status to inprogress)
  reopenTicket(child: any): void {
    this.reopeningTicketId = child.id;
    this.complaintService.updateSubTask(child.id, { status: 'inprogress', performed_by: this.user?.first_name_last_name }).subscribe({
      next: () => {
        this.toastr.success('เปิด Ticket ใหม่สำเร็จ');
        this.reopeningTicketId = null;
        this.loadChildren();
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.reopeningTicketId = null;
      }
    });
  }
}

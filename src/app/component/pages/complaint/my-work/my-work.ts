import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { JobCategoryService } from 'src/app/shared/services/job-category.service';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { DepartmentService } from 'src/app/shared/services/department.service';
import { TagService } from 'src/app/shared/services/tag.service';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';
import { TicketDetailModalComponent } from '../modals/ticket-detail-modal/ticket-detail-modal';
import { DateThaiPipe } from 'src/app/shared/pipes/date-thai.pipe';
import { ActivityLogService } from 'src/app/shared/services/activity-log.service';

@Component({
  selector: 'app-my-work',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbPaginationModule, NgMultiSelectDropDownModule, DateThaiPipe],
  templateUrl: './my-work.html',
  styleUrl: './my-work.scss'
})
export class MyWorkComponent implements OnInit, AfterViewInit {
  user: any;
  complaints: any[] = [];
  filteredData: any[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchText = '';
  loading = false;
  expandedId: string | null = null;
  ticketUnreadMap: Record<string, number> = {};

  // Filter values
  statusFilter = '';
  slaFilter = '';
  selectedProjects: any[] = [];
  selectedJobCategories: any[] = [];
  selectedContactChannels: any[] = [];
  selectedTags: any[] = [];
  selectedDepartments: any[] = [];
  selectedTicketCategories: any[] = [];
  selectedTicketSubCategories: any[] = [];

  // Dropdown data
  availableProjects: any[] = [];
  availableJobCategories: any[] = [];
  availableContactChannels: any[] = [];
  availableDepartments: any[] = [];
  availableTicketCategories: any[] = [];
  availableTicketSubCategories: any[] = [];

  // Tag options (static)
  tagOptions: any[] = [];

  // Dropdown settings
  projectDropdownSettings: IDropdownSettings = {};
  jobCategoryDropdownSettings: IDropdownSettings = {};
  contactChannelDropdownSettings: IDropdownSettings = {};
  tagDropdownSettings: IDropdownSettings = {};
  departmentDropdownSettings: IDropdownSettings = {};
  ticketCategoryDropdownSettings: IDropdownSettings = {};
  ticketSubCategoryDropdownSettings: IDropdownSettings = {};

  constructor(
    private router: Router,
    private complaintService: ComplaintService,
    private projectService: ProjectService,
    private jobCategoryService: JobCategoryService,
    private contactChannelService: ContactChannelService,
    private departmentService: DepartmentService,
    private tagService: TagService,
    private ticketCategoryService: TicketCategoryService,
    private ticketSubCategoryService: TicketSubCategoryService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit(): void {
    this.initDropdownSettings();
    this.user = Auth.user;
    Auth.userEmitter.subscribe((res: any) => {
      this.user = res;
      this.loadData();
    });
    this.loadData();
    this.loadFilterOptions();
  }

  ngAfterViewInit(): void {}

  initDropdownSettings(): void {
    const baseSettings: IDropdownSettings = {
      singleSelection: true,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: 'ค้นหา...',
      noDataAvailablePlaceholderText: 'ไม่มีข้อมูล',
      noFilteredDataAvailablePlaceholderText: 'ไม่พบข้อมูลที่ค้นหา'
    };

    this.projectDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'project_display'
    };

    this.jobCategoryDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'catagory_name'
    };

    this.contactChannelDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'channel_name'
    };

    this.tagDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'tag_name'
    };

    this.departmentDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'department_name'
    };

    this.ticketCategoryDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'category_name'
    };

    this.ticketSubCategoryDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'sub_category_name'
    };
  }

  loadFilterOptions(): void {
    this.projectService.getAllProjects().subscribe({
      next: (res: any) => {
        const projects = Array.isArray(res) ? res : (res?.data || []);
        this.availableProjects = projects.map((p: any) => ({
          ...p,
          project_display: p.project_id ? `${p.project_id} - ${p.project_name_th}` : p.project_name_th
        }));
      }
    });
    this.jobCategoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.availableJobCategories = Array.isArray(res) ? res : (res?.data || []);
      }
    });
    this.contactChannelService.getAll().subscribe({
      next: (res: any) => {
        this.availableContactChannels = Array.isArray(res) ? res : (res?.data || []);
      }
    });
    this.departmentService.getAll().subscribe({
      next: (res: any) => {
        this.availableDepartments = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.availableDepartments = [];
      }
    });
    this.tagService.getAll().subscribe({
      next: (res: any) => {
        this.tagOptions = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.tagOptions = [];
      }
    });
    this.ticketCategoryService.getAll().subscribe({
      next: (res: any) => {
        this.availableTicketCategories = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.availableTicketCategories = [];
      }
    });
    this.ticketSubCategoryService.getAll().subscribe({
      next: (res: any) => {
        this.availableTicketSubCategories = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.availableTicketSubCategories = [];
      }
    });
  }

  loadData(): void {
    if (!this.user) return;

    const userDeptId = this.user?.department;
    if (!userDeptId) {
      this.complaints = [];
      this.applyFilters();
      return;
    }

    this.loading = true;

    this.complaintService.getAllWithSubTasks().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.complaints = data.filter((complaint: any) => {
          if (!complaint.subTaskDepartmentIds || !Array.isArray(complaint.subTaskDepartmentIds)) return false;
          return complaint.subTaskDepartmentIds.some((id: any) => String(id) === String(userDeptId));
        }).sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        this.applyFilters();
        this.loadTicketUnreadMap();
        this.loading = false;
      },
      error: (err) => {
        this.complaints = [];
        this.applyFilters();
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.complaints];

    if (this.statusFilter) {
      filtered = filtered.filter(w => w.status === this.statusFilter);
    }

    if (this.selectedProjects.length > 0) {
      const projectId = this.selectedProjects[0].id;
      filtered = filtered.filter(w => w.project?.id === projectId);
    }

    if (this.selectedJobCategories.length > 0) {
      const catId = this.selectedJobCategories[0].id;
      filtered = filtered.filter(w => w.complaintJobCatagory?.id === catId);
    }

    if (this.selectedContactChannels.length > 0) {
      const chId = this.selectedContactChannels[0].id;
      filtered = filtered.filter(w => w.contactChannel?.id === chId);
    }

    if (this.selectedTags.length > 0) {
      const tagId = this.selectedTags[0].id;
      filtered = filtered.filter(w =>
        w.subTaskTags && Array.isArray(w.subTaskTags) && w.subTaskTags.includes(tagId)
      );
    }

    if (this.selectedDepartments.length > 0) {
      const deptId = this.selectedDepartments[0].id;
      filtered = filtered.filter(w => {
        if (!w.subTaskDepartmentIds || !Array.isArray(w.subTaskDepartmentIds)) return false;
        return w.subTaskDepartmentIds.some((id: any) => String(id) === String(deptId));
      });
    }

    if (this.selectedTicketCategories.length > 0) {
      const catId = this.selectedTicketCategories[0].id;
      filtered = filtered.filter(w =>
        w.subTasks?.some((t: any) => t.ticketCategory?.id === catId)
      );
    }

    if (this.selectedTicketSubCategories.length > 0) {
      const subCatId = this.selectedTicketSubCategories[0].id;
      filtered = filtered.filter(w =>
        w.subTasks?.some((t: any) => t.ticketSubCategory?.id === subCatId)
      );
    }

    if (this.slaFilter) {
      filtered = filtered.filter(w => {
        if (!w.subTasks?.length) return this.slaFilter === 'normal';
        const hasOverdue = w.subTasks.some((t: any) =>
          t.status !== 'completed' && t.status !== 'cancelled' && this.getAgingDays(t.created_at) > 15
        );
        return this.slaFilter === 'overdue' ? hasOverdue : !hasOverdue;
      });
    }

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(w =>
        w.case_number?.toLowerCase().includes(search) ||
        w.customer_name?.toLowerCase().includes(search) ||
        w.house_name?.toLowerCase().includes(search) ||
        w.telephone?.toLowerCase().includes(search) ||
        w.job_detail?.toLowerCase().includes(search) ||
        w.description?.toLowerCase().includes(search) ||
        w.detail?.toLowerCase().includes(search) ||
        w.content?.toLowerCase().includes(search) ||
        w.subTasks?.some((t: any) => t.ticket_number?.toLowerCase().includes(search))
      );
    }

    this.filteredData = filtered;
    this.totalItems = filtered.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.selectedProjects = [];
    this.selectedJobCategories = [];
    this.selectedContactChannels = [];
    this.selectedTags = [];
    this.selectedDepartments = [];
    this.selectedTicketCategories = [];
    this.selectedTicketSubCategories = [];
    this.slaFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  viewDetail(complaint_id: string): void {
    window.open('/pages/complaint/view/' + complaint_id, '_blank');
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

  toggleExpand(complaintId: string): void {
    this.expandedId = this.expandedId === complaintId ? null : complaintId;
  }

  getTicketCompletedCount(item: any): number {
    if (!item.subTasks || !Array.isArray(item.subTasks)) return 0;
    return item.subTasks.filter((t: any) => t.status === 'completed').length;
  }

  getTicketProgressPercent(item: any): number {
    if (!item.subTasks?.length) return 0;
    return (this.getTicketCompletedCount(item) / item.subTasks.length) * 100;
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

  getCompanyLabel(item: any): string {
    if (!item.subTasks || item.subTasks.length === 0) return 'ยังไม่ระบุเจ้าของงาน';
    const hasDepartment = item.subTasks.some((t: any) => t.department);
    if (!hasDepartment) return 'ยังไม่ระบุเจ้าของงาน';
    const hasSenx = item.subTasks.some((t: any) => t.department?.company === 'SENX');
    return hasSenx ? 'SENX' : 'SENA';
  }

  getDueDate(ticket: any): Date {
    if (ticket.due_date) return new Date(ticket.due_date);
    const d = new Date(ticket.created_at);
    d.setDate(d.getDate() + 15);
    return d;
  }

  hasCaseUnread(item: any): boolean {
    if (!item.subTasks?.length) return false;
    return item.subTasks.some((t: any) => this.ticketUnreadMap[t.id]);
  }

  loadTicketUnreadMap(): void {
    if (!this.user?.department) return;
    const allTicketIds = this.complaints
      .flatMap((c: any) => (c.subTasks || []).map((t: any) => t.id))
      .filter(Boolean);
    if (!allTicketIds.length) return;
    this.activityLogService.getTicketUnreadMap(this.user.department, allTicketIds).subscribe({
      next: (map) => this.ticketUnreadMap = map || {},
      error: () => this.ticketUnreadMap = {},
    });
  }

  openTicketModal(ticket: any, parentStatus: string): void {
    // Mark ticket as read
    if (this.ticketUnreadMap[ticket.id] && this.user?.department) {
      this.activityLogService.markTicketAsRead(this.user.department, ticket.id, this.user.user_id).subscribe({
        next: () => {
          delete this.ticketUnreadMap[ticket.id];
          ActivityLogService.triggerRefresh();
        },
      });
    }
    const modalRef = this.modalService.open(TicketDetailModalComponent, {
      size: 'xl',
      windowClass: 'modal-right',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.ticket = ticket;
    modalRef.componentInstance.parentStatus = parentStatus;
    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadData();
      }
    }).catch(() => {});
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }
}

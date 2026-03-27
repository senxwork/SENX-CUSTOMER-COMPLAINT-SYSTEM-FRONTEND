import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbDatepickerModule, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { DepartmentService } from 'src/app/shared/services/department.service';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { DateThaiPipe } from 'src/app/shared/pipes/date-thai.pipe';
import { ActivityLogService } from 'src/app/shared/services/activity-log.service';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

@Injectable()
export class ThaiDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        return {
          day: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10),
          year: parseInt(parts[2], 10) - 543
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (date) {
      const day = String(date.day).padStart(2, '0');
      const month = String(date.month).padStart(2, '0');
      const year = date.year + 543;
      return `${day}/${month}/${year}`;
    }
    return '';
  }
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule, NgbDatepickerModule, NgMultiSelectDropDownModule, DateThaiPipe, HasPermissionDirective],
  templateUrl: './report.html',
  styleUrl: './report.scss',
  providers: [{ provide: NgbDateParserFormatter, useClass: ThaiDateParserFormatter }]
})
export class ReportComponent implements OnInit {
  user: any;
  reportData: any[] = [];
  filteredData: any[] = [];

  // Date filters
  startDate: any;
  endDate: any;

  // Other filters
  statusFilter = '';
  searchText = '';
  selectedProjects: any[] = [];
  selectedContactChannels: any[] = [];
  selectedDepartments: any[] = [];
  selectedTicketCategories: any[] = [];
  selectedTicketSubCategories: any[] = [];

  // Dropdown data
  availableProjects: any[] = [];
  availableContactChannels: any[] = [];
  availableDepartments: any[] = [];
  availableTicketCategories: any[] = [];
  availableTicketSubCategories: any[] = [];

  // Dropdown settings
  projectDropdownSettings: IDropdownSettings = {};
  contactChannelDropdownSettings: IDropdownSettings = {};
  departmentDropdownSettings: IDropdownSettings = {};
  ticketCategoryDropdownSettings: IDropdownSettings = {};
  ticketSubCategoryDropdownSettings: IDropdownSettings = {};

  // Ticket unread notification
  ticketUnreadMap: Record<string, number> = {};

  // Expandable rows
  expandedId: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  loading = false;
  dataLoaded = false;

  constructor(
    private complaintService: ComplaintService,
    private projectService: ProjectService,
    private contactChannelService: ContactChannelService,
    private departmentService: DepartmentService,
    private ticketCategoryService: TicketCategoryService,
    private ticketSubCategoryService: TicketSubCategoryService,
    private excelService: ExcelExportService,
    private toastr: ToastrService,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit(): void {
    this.initDropdownSettings();
    this.user = Auth.user;

    // Set default date range (last 30 days)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);

    this.startDate = {
      year: lastMonth.getFullYear(),
      month: lastMonth.getMonth() + 1,
      day: lastMonth.getDate()
    };
    this.endDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };

    Auth.userEmitter.subscribe((res: any) => {
      this.user = res;
    });

    this.loadFilterOptions();
  }

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
      textField: 'project_name_th'
    };

    this.contactChannelDropdownSettings = {
      ...baseSettings,
      idField: 'id',
      textField: 'channel_name'
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
        this.availableProjects = Array.isArray(res) ? res : (res?.data || []);
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

  loadReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    this.loading = true;
    this.dataLoaded = false;

    const filterData = {
      job_departments_id: this.user?.jobDepartment?.job_departments_id,
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate)
    };

    this.complaintService.getReport(this.currentPage, filterData).subscribe({
      next: (res: any) => {
        this.reportData = Array.isArray(res) ? res : (res?.data || []);
        this.applyFilters();
        this.loadTicketUnreadMap();
        this.loading = false;
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error(err);
        this.reportData = [];
        this.applyFilters();
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        this.loading = false;
        this.dataLoaded = true;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reportData];

    if (this.statusFilter) {
      filtered = filtered.filter(w => w.status === this.statusFilter);
    }

    if (this.selectedProjects.length > 0) {
      const projectId = this.selectedProjects[0].id;
      filtered = filtered.filter(w => w.project?.id === projectId);
    }

    if (this.selectedContactChannels.length > 0) {
      const chId = this.selectedContactChannels[0].id;
      filtered = filtered.filter(w => w.contactChannel?.id === chId);
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

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(w =>
        w.case_number?.toLowerCase().includes(search) ||
        w.customer_name?.toLowerCase().includes(search) ||
        w.house_name?.toLowerCase().includes(search) ||
        w.telephone?.includes(search) ||
        w.job_detail?.toLowerCase().includes(search)
      );
    }

    this.filteredData = filtered;
    this.totalItems = filtered.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.searchText = '';
    this.selectedProjects = [];
    this.selectedContactChannels = [];
    this.selectedDepartments = [];
    this.selectedTicketCategories = [];
    this.selectedTicketSubCategories = [];
    this.currentPage = 1;
    this.applyFilters();
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  exportExcel(): void {
    if (this.filteredData.length === 0) {
      this.toastr.warning('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    const headers = [
      'ลำดับ', 'เลขที่ Case', 'ลูกค้า', 'โครงการ', 'ประเภท',
      'ช่องทาง', 'ผู้สร้าง', 'รายละเอียด Case', 'สถานะ Case', 'วันที่สร้าง Case',
      'OWNER',
      'เลขที่ Ticket', 'รายละเอียด Ticket', 'หน่วยงาน', 'สถานะ Ticket', 'วันที่สร้าง Ticket', 'จำนวนวัน (SLA)', 'วันที่ปิด Ticket'
    ];

    const data: any[][] = [];
    let rowNum = 1;

    for (const item of this.filteredData) {
      const caseColumns = [
        rowNum++,
        item.case_number || '-',
        item.customer_name || '-',
        item.project?.project_name_th || '-',
        item.complaintJobCatagory?.catagory_name || '-',
        item.contactChannel?.channel_name || '-',
        item.user_created?.first_name_last_name || '-',
        item.job_detail || '-',
        this.getStatusText(item.status),
        item.created_at ? this.formatDateForExcel(item.created_at) : '-',
        this.getCompanyLabel(item),
      ];

      const tickets = item.subTasks || [];
      if (tickets.length === 0) {
        data.push([...caseColumns, '-', '-', '-', '-', '-', '-', '-']);
      } else {
        for (const t of tickets) {
          const isDone = t.status === 'completed' || t.status === 'cancelled';
          const days = isDone
            ? this.getAgingDays(t.created_at, t.completed_at || t.updated_at)
            : this.getAgingDays(t.created_at);
          const overdue = this.isAgingOverdue(t.created_at, t.status);
          const slaText = isDone
            ? `${days} วัน`
            : overdue ? `เกินกำหนด ${days} วัน` : `${days} วัน`;
          const closedDate = isDone && (t.completed_at || t.updated_at)
            ? this.formatDateForExcel(t.completed_at || t.updated_at)
            : '-';
          data.push([
            ...caseColumns,
            t.ticket_number || '-',
            t.ticket_detail || '-',
            t.department?.department_name || '-',
            this.getStatusText(t.status),
            t.created_at ? this.formatDateForExcel(t.created_at) : '-',
            slaText,
            closedDate
          ]);
        }
      }
    }

    const startStr = this.startDate ? `${this.startDate.day}/${this.startDate.month}/${this.startDate.year + 543}` : '';
    const endStr = this.endDate ? `${this.endDate.day}/${this.endDate.month}/${this.endDate.year + 543}` : '';

    this.excelService.exportStyledReport({
      title: 'รายงานเรื่องร้องเรียน',
      dateRange: `วันที่ ${startStr} - ${endStr}`,
      headers,
      data,
      fileName: 'Complaint_Report'
    });
    this.toastr.success('Export สำเร็จ');
  }

  private formatDate(date: any): string {
    if (!date) return '';
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  private formatDateForExcel(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'Open';
      case 'inprogress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status || '-';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'open': return 'badge bg-primary';
      case 'inprogress': return 'badge bg-warning';
      case 'completed': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalOpen(): number {
    return this.filteredData.filter(w => w.status === 'open').length;
  }

  get totalInProgress(): number {
    return this.filteredData.filter(w => w.status === 'inprogress').length;
  }

  get totalCompleted(): number {
    return this.filteredData.filter(w => w.status === 'completed').length;
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

  getCompanyLabel(item: any): string {
    if (!item.subTasks || item.subTasks.length === 0) return 'ยังไม่ระบุเจ้าของงาน';
    const hasDepartment = item.subTasks.some((t: any) => t.department);
    if (!hasDepartment) return 'ยังไม่ระบุเจ้าของงาน';
    const hasSenx = item.subTasks.some((t: any) => t.department?.company === 'SENX');
    return hasSenx ? 'SENX' : 'SENA';
  }

  loadTicketUnreadMap(): void {
    if (!this.user?.department) return;
    const allTicketIds = this.reportData
      .flatMap((c: any) => (c.subTasks || []).map((t: any) => t.id))
      .filter(Boolean);
    if (!allTicketIds.length) return;
    this.activityLogService.getTicketUnreadMap(this.user.department, allTicketIds).subscribe({
      next: (map) => this.ticketUnreadMap = map || {},
      error: () => this.ticketUnreadMap = {},
    });
  }

  viewDetail(complaint_id: string): void {
    window.open('/pages/complaint/view/' + complaint_id, '_blank');
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { Auth } from 'src/app/classes/auth';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { JobDepartmentService } from 'src/app/shared/services/job-department.service';
import { JobCategoryService } from 'src/app/shared/services/job-category.service';
import { BusinessUnitService } from 'src/app/shared/services/business-unit.service';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'app-complaint-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgMultiSelectDropDownModule],
  templateUrl: './complaint-create.html',
  styleUrl: './complaint-create.scss'
})
export class ComplaintCreateComponent implements OnInit {
  createForm!: FormGroup;
  user: any;

  departments: any[] = [];
  categories: any[] = [];
  projects: any[] = [];
  businessUnits: any[] = [];
  contactChannels: any[] = [];

  // Selected items for dropdowns
  selectedBU: any[] = [];
  selectedProject: any[] = [];
  selectedChannel: any[] = [];
  selectedTags: any[] = [];

  // Tag options (static)
  tagOptions = [
    { id: 'senx_office', name: 'สำนักงานใหญ่ Senx' },
    { id: 'sena_office', name: 'สำนักงานใหญ่ เสนา' },
    { id: 'project', name: 'โครงการ' },
    { id: 'person', name: 'บุคคล' },
    { id: 'service', name: 'บริการ' }
  ];

  selectedFiles: File[] = [];
  loading = false;

  // Parent work request (for sub-task creation)
  parentId: string | null = null;
  parentData: any = null;

  // Dropdown settings for single select
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    searchPlaceholderText: 'ค้นหา...',
    noDataAvailablePlaceholderText: 'ไม่พบข้อมูล'
  };

  buDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'bu_name',
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

  channelDropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'channel_name',
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
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private complaintService: ComplaintService,
    private jobDepartmentService: JobDepartmentService,
    private jobCategoryService: JobCategoryService,
    private businessUnitService: BusinessUnitService,
    private contactChannelService: ContactChannelService,
    private projectService: ProjectService
  ) {}

  // Default department ID for Customer Service
  readonly DEFAULT_DEPARTMENT_ID = '372f2a72-4d41-499d-afd8-4e7b1c6bf986';

  ngOnInit(): void {
    this.user = Auth.user;
    this.initForm();
    this.loadDropdowns();
    this.loadJobCategories();

    // Check for parent_id query param (creating sub-task)
    this.parentId = this.route.snapshot.queryParams['parent_id'] || null;
    if (this.parentId) {
      this.complaintService.getById(this.parentId).subscribe({
        next: (data) => { this.parentData = data; },
        error: () => { this.parentId = null; }
      });
    }
  }

  initForm(): void {
    this.createForm = this.fb.group({
      job_departments_id: [this.DEFAULT_DEPARTMENT_ID],
      job_catagory_id: [''],
      project_id: ['', Validators.required],
      business_unit_id: [''],
      contact_channel_id: ['', Validators.required],
      customer_name: ['', Validators.required],
      house_name: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      job_detail: ['', Validators.required]
    });
  }

  loadDropdowns(): void {
    this.jobDepartmentService.getAll().subscribe((data: any) => this.departments = data || []);
    this.businessUnitService.getAll().subscribe((data: any) => this.businessUnits = data || []);
    this.contactChannelService.getAll().subscribe((data: any) => this.contactChannels = data || []);
    this.projectService.getAllProjects().subscribe((data: any) => this.projects = data?.data || data || []);
  }

  loadJobCategories(): void {
    this.jobCategoryService.getAllCategories().subscribe({
      next: (data: any) => {
        this.categories = data || [];
        console.log('Loaded categories:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onDepartmentChange(): void {
    this.createForm.patchValue({ job_catagory_id: '' });
  }

  // Dropdown event handlers
  onBUSelect(item: any): void {
    this.createForm.patchValue({ business_unit_id: item.id });
  }

  onBUDeselect(): void {
    this.createForm.patchValue({ business_unit_id: '' });
  }

  onProjectSelect(item: any): void {
    this.createForm.patchValue({ project_id: item.id });
  }

  onProjectDeselect(): void {
    this.createForm.patchValue({ project_id: '' });
  }

  onChannelSelect(item: any): void {
    this.createForm.patchValue({ contact_channel_id: item.id });
  }

  onChannelDeselect(): void {
    this.createForm.patchValue({ contact_channel_id: '' });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      if (this.selectedFiles.length < 3) {
        if (files[i].size <= 15 * 1024 * 1024) {
          this.selectedFiles.push(files[i]);
        } else {
          this.toastr.warning('ไฟล์มีขนาดเกิน 15MB');
        }
      } else {
        this.toastr.warning('สามารถแนบได้สูงสุด 3 ไฟล์');
        break;
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      const errors: string[] = [];
      if (this.createForm.get('project_id')?.hasError('required')) errors.push('โครงการ/สถานที่');
      if (this.createForm.get('contact_channel_id')?.hasError('required')) errors.push('ช่องทางการติดต่อ');
      if (this.createForm.get('customer_name')?.hasError('required')) errors.push('ชื่อ-สกุล ลูกค้า');
      if (this.createForm.get('house_name')?.hasError('required')) errors.push('บ้านเลขที่');
      if (this.createForm.get('telephone')?.hasError('required')) errors.push('เบอร์ติดต่อลูกค้า');
      if (this.createForm.get('email')?.hasError('required')) errors.push('อีเมล์ลูกค้า');
      if (this.createForm.get('job_detail')?.hasError('required')) errors.push('รายละเอียดการร้องเรียน');
      if (this.createForm.get('email')?.hasError('email')) {
        this.toastr.error('รูปแบบอีเมล์ไม่ถูกต้อง');
      }
      if (errors.length > 0) {
        this.toastr.error('กรุณากรอก: ' + errors.join(', '));
      }
      this.createForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData: any = {
      ...this.createForm.value,
      user_created: this.user?.user_id,
      job_catagory_id: this.createForm.value.job_catagory_id || null,
      project_id: this.createForm.value.project_id || null,
      business_unit_id: this.createForm.value.business_unit_id || null,
      contact_channel_id: this.createForm.value.contact_channel_id || null
    };
    if (this.parentId) {
      formData.parent_id = this.parentId;
    }

    const successRoute = this.parentId
      ? ['/pages/complaint/view', this.parentId]
      : ['/pages/complaint/list'];

    this.complaintService.createComplaint(formData).subscribe({
      next: (res: any) => {
        if (this.selectedFiles.length > 0 && res?.complaint_id) {
          this.uploadFiles(res.complaint_id);
        } else {
          this.toastr.success(this.parentId ? 'สร้างงานย่อยสำเร็จ' : 'สร้างเรื่องร้องเรียนสำเร็จ');
          this.router.navigate(successRoute);
        }
      },
      error: (err: any) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
        console.error(err);
      }
    });
  }

  uploadFiles(complaintId: string): void {
    let uploadCount = 0;
    const successRoute = this.parentId
      ? ['/pages/complaint/view', this.parentId]
      : ['/pages/complaint/list'];

    this.selectedFiles.forEach(file => {
      this.complaintService.uploadAttachFile(complaintId, file).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === this.selectedFiles.length) {
            this.toastr.success(this.parentId ? 'สร้างงานย่อยสำเร็จ' : 'สร้างเรื่องร้องเรียนสำเร็จ');
            this.router.navigate(successRoute);
          }
        },
        error: () => {
          this.toastr.warning('อัพโหลดไฟล์บางไฟล์ไม่สำเร็จ');
        }
      });
    });
  }

  cancel(): void {
    if (this.parentId) {
      this.router.navigate(['/pages/complaint/view', this.parentId]);
    } else {
      this.router.navigate(['/pages/complaint/list']);
    }
  }
}

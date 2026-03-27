import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { JobDepartmentService } from 'src/app/shared/services/job-department.service';
import { JobCategoryService } from 'src/app/shared/services/job-category.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { BusinessUnitService } from 'src/app/shared/services/business-unit.service';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-complaint-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgMultiSelectDropDownModule],
  templateUrl: './complaint-edit.html',
  styleUrl: './complaint-edit.scss'
})
export class ComplaintEditComponent implements OnInit {
  complaint_id!: string;
  editForm!: FormGroup;
  loading = false;
  loadingData = true;

  departments: any[] = [];
  categories: any[] = [];
  projects: any[] = [];
  businessUnits: any[] = [];
  contactChannels: any[] = [];

  selectedTags: any[] = [];

  // Tag options (static)
  tagOptions = [
    { id: 'senx_office', name: 'สำนักงานใหญ่ Senx' },
    { id: 'sena_office', name: 'สำนักงานใหญ่ เสนา' },
    { id: 'project', name: 'โครงการ' },
    { id: 'person', name: 'บุคคล' },
    { id: 'service', name: 'บริการ' }
  ];

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
    private router: Router,
    private route: ActivatedRoute,
    private complaintService: ComplaintService,
    private jobDepartmentService: JobDepartmentService,
    private jobCategoryService: JobCategoryService,
    private projectService: ProjectService,
    private businessUnitService: BusinessUnitService,
    private contactChannelService: ContactChannelService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.complaint_id = this.route.snapshot.params['complaint_id'];

    this.editForm = this.fb.group({
      job_departments_id: [''],
      job_catagory_id: [''],
      project_id: [''],
      business_unit_id: [''],
      contact_channel_id: [''],
      customer_name: [''],
      house_name: [''],
      telephone: [''],
      email: ['', Validators.email],
      job_detail: ['', Validators.required]
    });

    this.loadMasterData();
    this.loadComplaint();
  }

  loadMasterData(): void {
    // Load departments
    this.jobDepartmentService.getAll().subscribe({
      next: (data: any) => this.departments = data || []
    });

    // Load projects
    this.projectService.getProjectsByFilterData(1, {}).subscribe({
      next: (res: any) => this.projects = res.data || res || []
    });

    // Load business units
    this.businessUnitService.getAll().subscribe({
      next: (data: any) => this.businessUnits = data || []
    });

    // Load contact channels
    this.contactChannelService.getAll().subscribe({
      next: (data: any) => this.contactChannels = data || []
    });
  }

  loadComplaint(): void {
    this.complaintService.getById(this.complaint_id).subscribe({
      next: (data: any) => {
        this.editForm.patchValue({
          job_departments_id: data.jobDepartment?.job_departments_id || '',
          job_catagory_id: data.complaintJobCatagory?.id || '',
          project_id: data.project?.id || '',
          business_unit_id: data.businessUnit?.id || '',
          contact_channel_id: data.contactChannel?.id || '',
          customer_name: data.customer_name || '',
          house_name: data.house_name || '',
          telephone: data.telephone || '',
          email: data.email || '',
          job_detail: data.job_detail || ''
        });

        // Load all categories
        this.loadCategories();

        // Set selected tags
        if (data.tags && Array.isArray(data.tags)) {
          this.selectedTags = this.tagOptions.filter(t => data.tags.includes(t.id));
        }

        this.loadingData = false;
      },
      error: (err: any) => {
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
        this.router.navigate(['/pages/complaint/list']);
      }
    });
  }

  onDepartmentChange(): void {
    this.editForm.patchValue({ job_catagory_id: '' });
    this.categories = [];
    this.loadCategories();
  }

  loadCategories(): void {
    this.jobCategoryService.getAllCategories().subscribe({
      next: (data: any) => this.categories = data || []
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.loading = true;
    const formData = {
      ...this.editForm.value,
      performed_by: (Auth.user as any)?.first_name_last_name
    };

    this.complaintService.updateCat(this.complaint_id, formData).subscribe({
      next: () => {
        this.toastr.success('บันทึกสำเร็จ');
        this.router.navigate(['/pages/complaint/view', this.complaint_id]);
      },
      error: (err: any) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/complaint/view', this.complaint_id]);
  }
}

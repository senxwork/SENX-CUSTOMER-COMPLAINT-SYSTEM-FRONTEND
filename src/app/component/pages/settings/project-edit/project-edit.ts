import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'app-project-edit',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './project-edit.html',
  styleUrl: './project-edit.scss'
})
export class ProjectEditComponent implements OnInit {
  projectForm!: FormGroup;
  loading: boolean = false;
  loadingData: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentImage: string | null = null;
  submitted: boolean = false;
  projectId: string = '';
  endpointProjectLogo: string = '';
  currentProjectStatus: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.endpointProjectLogo = this.projectService.endpointProjectLogo;
    this.projectId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.projectId) {
      this.toastr.error('ไม่พบรหัสโครงการ', 'ข้อผิดพลาด');
      this.router.navigate(['/pages/settings/project-list']);
      return;
    }

    this.initForm();
    this.loadProjectData();
  }

  initForm(): void {
    this.projectForm = this.formBuilder.group({
      project_id: [''],
      project_name_th: ['', [Validators.required, Validators.minLength(3)]],
      project_email: ['', [Validators.required, Validators.email]],
      project_type: [''],
      is_managed: [false]
    });
  }

  loadProjectData(): void {
    this.loadingData = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project: any) => {
        console.log('Project loaded:', project);

        this.projectForm.patchValue({
          project_id: project.project_id,
          project_name_th: project.project_name_th,
          project_email: project.project_email,
          project_type: project.project_type || '',
          is_managed: project.is_managed || false
        });

        // Store current project status
        this.currentProjectStatus = project.project_status ?? true;

        if (project.project_logo_image) {
          this.currentImage = project.project_logo_image;
        }

        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.toastr.error('ไม่สามารถโหลดข้อมูลโครงการได้', 'ข้อผิดพลาด');
        this.loadingData = false;
        this.router.navigate(['/pages/settings/project-list']);
      }
    });
  }

  get f() {
    return this.projectForm.controls;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)', 'ข้อผิดพลาด');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('ขนาดไฟล์ต้องไม่เกิน 5MB', 'ข้อผิดพลาด');
        return;
      }

      this.selectedFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  removeCurrentImage(): void {
    this.currentImage = null;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.projectForm.invalid) {
      this.toastr.error('กรุณากรอกข้อมูลให้ครบถ้วน', 'ข้อผิดพลาด');
      return;
    }

    this.loading = true;

    const projectData = {
      ...this.projectForm.value,
      project_status: this.currentProjectStatus
    };

    this.projectService.updateProject(this.projectId, projectData).subscribe({
      next: (response: any) => {
        console.log('Project updated:', response);

        // If there's a new image to upload
        if (this.selectedFile) {
          this.uploadImage(this.projectId);
        } else {
          this.toastr.success('แก้ไขโครงการเรียบร้อยแล้ว', 'สำเร็จ');
          this.loading = false;
          this.router.navigate(['/pages/settings/project-list']);
        }
      },
      error: (error) => {
        console.error('Error updating project:', error);
        this.toastr.error(error.error?.message || 'ไม่สามารถแก้ไขโครงการได้', 'ข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

 uploadImage(projectId: string): void {
  if (!this.selectedFile) {
    this.loading = false;
    return;
  }

  this.projectService.uploadProjectImage(projectId, this.selectedFile).subscribe({
    next: (response) => {
      console.log('Image uploaded:', response);
      this.toastr.success('แก้ไขโครงการและอัพโหลดรูปภาพเรียบร้อยแล้ว', 'สำเร็จ');
      this.loading = false;
      this.router.navigate(['/pages/settings/project-list']);
    },
    error: (error) => {
      console.error('Full error:', error);
      
      if (error.status === 0) {
        this.toastr.error('ไม่สามารถเชื่อมต่อกับ Server ได้ (CORS Error)', 'ข้อผิดพลาด');
      } else if (error.status === 413) {
        this.toastr.error('ไฟล์มีขนาดใหญ่เกินไป', 'ข้อผิดพลาด');
      } else if (error.status === 415) {
        this.toastr.error('ประเภทไฟล์ไม่ถูกต้อง', 'ข้อผิดพลาด');
      } else {
        this.toastr.error(`เกิดข้อผิดพลาด: ${error.message}`, 'ข้อผิดพลาด');
      }
      
      this.loading = false;
    }
  });
}

  cancel(): void {
    this.router.navigate(['/pages/settings/project-list']);
  }
}

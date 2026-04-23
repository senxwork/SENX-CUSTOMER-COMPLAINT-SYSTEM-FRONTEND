import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'app-project-create',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './project-create.html',
  styleUrl: './project-create.scss'
})
export class ProjectCreateComponent implements OnInit {
  projectForm!: FormGroup;
  loading: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.projectForm = this.formBuilder.group({
      project_id: [''],
      project_name_th: ['', [Validators.required, Validators.minLength(3)]],
      project_email: ['', [Validators.required, Validators.email]],
      project_type: [''],
      is_managed: [false],
      is_sena: [false]
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

  onSubmit(): void {
    this.submitted = true;

    if (this.projectForm.invalid) {
      this.toastr.error('กรุณากรอกข้อมูลให้ครบถ้วน', 'ข้อผิดพลาด');
      return;
    }

    this.loading = true;

    const projectData = {
      ...this.projectForm.value,
      project_status: true
    };

    this.projectService.createProject(projectData).subscribe({
      next: (response: any) => {
        console.log('Project created:', response);

        // If there's an image to upload
        if (this.selectedFile && response.data?.id) {
          this.uploadImage(response.data.id);
        } else {
          this.toastr.success('สร้างโครงการเรียบร้อยแล้ว', 'สำเร็จ');
          this.loading = false;
          this.router.navigate(['/pages/settings/project-list']);
        }
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.toastr.error(error.error?.message || 'ไม่สามารถสร้างโครงการได้', 'ข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  uploadImage(projectId: string): void {
    if (!this.selectedFile) {
      this.loading = false;
      return;
    }

    console.log('Starting image upload for project:', projectId);
    console.log('Selected file:', this.selectedFile);

    this.projectService.uploadProjectImage(projectId, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully:', response);
        this.toastr.success('สร้างโครงการและอัพโหลดรูปภาพเรียบร้อยแล้ว', 'สำเร็จ');
        this.loading = false;
        this.router.navigate(['/pages/settings/project-list']);
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        // ถ้าเป็น network error (status 0) ให้แจ้งแบบอื่น
        if (error.status === 0) {
          this.toastr.error('ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบ backend', 'ข้อผิดพลาด');
        } else {
          this.toastr.warning('สร้างโครงการสำเร็จ แต่ไม่สามารถอัพโหลดรูปภาพได้', 'แจ้งเตือน');
        }

        this.loading = false;
        this.router.navigate(['/pages/settings/project-list']);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pages/settings/project-list']);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-upload-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-image-modal.html',
  styleUrl: './upload-image-modal.scss'
})
export class UploadImageModalComponent {
  @Input() userId!: string;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('กรุณาเลือกไฟล์รูปภาพ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  upload(): void {
    if (!this.selectedFile) {
      this.toastr.warning('กรุณาเลือกไฟล์');
      return;
    }

    this.loading = true;
    this.userService.uploadImageFileProfile(this.userId, this.selectedFile).subscribe({
      next: () => {
        this.toastr.success('อัพโหลดสำเร็จ');
        this.modal.close('success');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  removePreview(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }
}

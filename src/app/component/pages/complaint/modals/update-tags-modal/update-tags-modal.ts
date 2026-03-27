import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { TagService } from 'src/app/shared/services/tag.service';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-update-tags-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-tags-modal.html',
  styleUrls: ['./update-tags-modal.scss']
})
export class UpdateTagsModalComponent implements OnInit {
  @Input() subTask: any;

  selectedTags: string[] = [];
  loading = false;
  loadingTags = true;

  tagOptions: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private tagService: TagService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.selectedTags = [...(this.subTask?.tags || [])];
    this.loadTags();
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (data) => {
        this.tagOptions = (data || []).map((tag: any) => ({
          id: tag.id,
          name: tag.tag_name
        }));
        this.loadingTags = false;
      },
      error: () => {
        this.tagOptions = [];
        this.loadingTags = false;
      }
    });
  }

  isSelected(tagId: string): boolean {
    return this.selectedTags.includes(tagId);
  }

  toggleTag(tagId: string): void {
    const idx = this.selectedTags.indexOf(tagId);
    if (idx >= 0) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tagId);
    }
  }

  save(): void {
    this.loading = true;
    this.complaintService.updateSubTask(this.subTask.id, { tags: this.selectedTags, performed_by: (Auth.user as any)?.first_name_last_name }).subscribe({
      next: () => {
        this.toastr.success('บันทึก Tag สำเร็จ');
        this.activeModal.close('updated');
      },
      error: () => {
        this.toastr.error('เกิดข้อผิดพลาด');
        this.loading = false;
      }
    });
  }
}

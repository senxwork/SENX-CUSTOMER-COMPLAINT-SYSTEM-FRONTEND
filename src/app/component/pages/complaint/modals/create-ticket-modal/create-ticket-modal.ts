import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { DepartmentService } from 'src/app/shared/services/department.service';
import { TicketCategoryService } from 'src/app/shared/services/ticket-category.service';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';
import { ToastrService } from 'ngx-toastr';
import { Auth } from 'src/app/classes/auth';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket-modal.html',
  styleUrls: ['./create-ticket-modal.scss']
})
export class CreateTicketModalComponent implements OnInit {
  @Input() complaintId!: string;

  ticketDetail = '';
  selectedDepartmentId = '';
  selectedCategoryId = '';
  selectedSubCategoryId = '';
  urgent = false;
  isProcessed = true;

  departments: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  loading = false;

  constructor(
    public activeModal: NgbActiveModal,
    private complaintService: ComplaintService,
    private departmentService: DepartmentService,
    private categoryService: TicketCategoryService,
    private subCategoryService: TicketSubCategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.getAll(),
      categories: this.categoryService.getAll(),
      subCategories: this.subCategoryService.getAll(),
    }).subscribe({
      next: (res) => {
        this.departments = res.departments.data || res.departments;
        this.categories = res.categories.data || res.categories;
        this.subCategories = res.subCategories.data || res.subCategories;
      },
    });
  }

  create(): void {
    if (!this.ticketDetail.trim()) return;

    this.loading = true;
    const data: any = {
      ticket_detail: this.ticketDetail.trim(),
      complaint_list_id: this.complaintId,
    };

    this.complaintService.createSubTask(data).subscribe({
      next: (res: any) => {
        const ticketId = res?.res?.id || res?.id;
        if (!ticketId) {
          this.toastr.success('สร้าง Ticket สำเร็จ');
          this.loading = false;
          this.activeModal.close('created');
          return;
        }

        const performedBy = (Auth.user as any)?.first_name_last_name;
        const updates: any[] = [];

        if (this.selectedDepartmentId) {
          updates.push(this.complaintService.updateSubTaskDepartment(ticketId, this.selectedDepartmentId, performedBy));
        }
        if (this.selectedCategoryId) {
          updates.push(this.complaintService.updateSubTaskCategory(ticketId, this.selectedCategoryId, performedBy));
        }
        if (this.selectedSubCategoryId) {
          updates.push(this.complaintService.updateSubTaskSubCategory(ticketId, this.selectedSubCategoryId, performedBy));
        }
        if (this.urgent) {
          updates.push(this.complaintService.updateSubTask(ticketId, { urgent: true }));
        }
        updates.push(this.complaintService.updateSubTask(ticketId, { is_processed: this.isProcessed }));

        if (updates.length > 0) {
          forkJoin(updates).subscribe({
            next: () => {
              this.toastr.success('สร้าง Ticket สำเร็จ');
              this.loading = false;
              this.activeModal.close('created');
            },
            error: () => {
              this.toastr.success('สร้าง Ticket สำเร็จ (บางรายการอัพเดตไม่สำเร็จ)');
              this.loading = false;
              this.activeModal.close('created');
            }
          });
        } else {
          this.toastr.success('สร้าง Ticket สำเร็จ');
          this.loading = false;
          this.activeModal.close('created');
        }
      },
      error: (err) => {
        this.toastr.error('ไม่สามารถสร้าง Ticket ได้');
        console.error(err);
        this.loading = false;
      }
    });
  }
}

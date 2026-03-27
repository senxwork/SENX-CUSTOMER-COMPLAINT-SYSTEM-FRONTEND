import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { OmPersonsService } from 'src/app/shared/services/om-persons.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-assign-om-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-om-modal.html',
  styleUrl: './assign-om-modal.scss'
})
export class AssignOmModalComponent implements OnInit {
  @Input() complaint_id!: string;
  @Input() currentOmId: string | null = null;

  omPersons: any[] = [];
  selectedOmId: string | null = null;
  loading = false;
  loadingOm = false;

  constructor(
    public modal: NgbActiveModal,
    private complaintService: ComplaintService,
    private omPersonsService: OmPersonsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.selectedOmId = this.currentOmId;
    this.loadOmPersons();
  }

  loadOmPersons(): void {
    this.loadingOm = true;
    this.omPersonsService.getAll().subscribe({
      next: (data) => {
        this.omPersons = data || [];
        this.loadingOm = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingOm = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    const data = {
      omPersons_id: this.selectedOmId,
      performed_by: (Auth.user as any)?.first_name_last_name
    };

    this.complaintService.updateOM(this.complaint_id, data).subscribe({
      next: () => {
        this.toastr.success('อัพเดทหน่วยงานสำเร็จ');
        this.modal.close('updated');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }
}

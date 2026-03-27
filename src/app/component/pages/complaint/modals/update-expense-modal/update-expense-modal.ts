import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService } from 'src/app/shared/services/complaint.service';
import { Auth } from 'src/app/classes/auth';

@Component({
  selector: 'app-update-expense-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-expense-modal.html',
  styleUrl: './update-expense-modal.scss'
})
export class UpdateExpenseModalComponent implements OnInit {
  @Input() subTask!: any;

  expenseAmount: number | null = null;
  expenseDescription = '';
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.subTask?.expense_amount) {
      this.expenseAmount = Number(this.subTask.expense_amount);
    }
    if (this.subTask?.expense_description) {
      this.expenseDescription = this.subTask.expense_description;
    }
  }

  onSubmit(): void {
    if (!this.expenseAmount || this.expenseAmount <= 0) {
      this.toastr.warning('กรุณากรอกจำนวนเงิน');
      return;
    }

    this.loading = true;
    const data = {
      expense_amount: this.expenseAmount,
      expense_description: this.expenseDescription || '',
      performed_by: (Auth.user as any)?.first_name_last_name,
    };

    this.complaintService.updateSubTaskExpense(this.subTask.id, data).subscribe({
      next: () => {
        this.toastr.success('บันทึกค่าใช้จ่ายสำเร็จ');
        this.modal.close('updated');
      },
      error: (err) => {
        this.toastr.error('เกิดข้อผิดพลาด');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onClearExpense(): void {
    if (!confirm('ยืนยันว่าไม่มีค่าใช้จ่าย?')) {
      return;
    }

    this.loading = true;
    const data = {
      expense_amount: 0,
      expense_description: '',
      performed_by: (Auth.user as any)?.first_name_last_name,
    };

    this.complaintService.updateSubTaskExpense(this.subTask.id, data).subscribe({
      next: () => {
        this.toastr.success('ลบค่าใช้จ่ายสำเร็จ');
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

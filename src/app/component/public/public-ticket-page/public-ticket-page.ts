import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicTicketService } from 'src/app/shared/services/public-ticket.service';
import { DateThaiPipe } from 'src/app/shared/pipes/date-thai.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-public-ticket-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DateThaiPipe],
  templateUrl: './public-ticket-page.html',
  styleUrls: ['./public-ticket-page.scss'],
})
export class PublicTicketPageComponent implements OnInit {
  token = '';
  ticket: any = null;
  contactName = '';
  contactEmail = '';
  loading = true;
  error = false;

  comment = '';
  commentFiles: File[] = [];
  submitting = false;
  statusUpdating = false;
  statusDropdownOpen = false;

  @ViewChild('statusDropdownRef') statusDropdownRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.statusDropdownOpen && this.statusDropdownRef && !this.statusDropdownRef.nativeElement.contains(target)) {
      this.statusDropdownOpen = false;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private publicTicketService: PublicTicketService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.loadTicket();
  }

  loadTicket(): void {
    this.loading = true;
    this.error = false;
    this.publicTicketService.getByToken(this.token).subscribe({
      next: (data: any) => {
        this.ticket = data.ticket;
        this.contactName = data.contact_name;
        this.contactEmail = data.contact_email;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  getStatusText(status: string): string {
    const map: any = {
      open: 'OPEN',
      inprogress: 'IN PROGRESS',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    return 'status-' + (status || 'open');
  }

  addComment(): void {
    if (!this.comment.trim() || this.submitting) return;

    this.submitting = true;
    this.publicTicketService
      .addComment(this.token, this.comment.trim())
      .subscribe({
        next: (transaction: any) => {
          if (this.commentFiles.length > 0) {
            this.uploadFiles(transaction.id);
          } else {
            this.comment = '';
            this.submitting = false;
            this.loadTicket();
          }
        },
        error: () => {
          this.submitting = false;
          alert('ไม่สามารถส่งบันทึกได้ กรุณาลองอีกครั้ง');
        },
      });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.commentFiles.push(files[i]);
    }
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.commentFiles.splice(index, 1);
  }

  private uploadFiles(transactionId: string): void {
    this.publicTicketService
      .uploadFiles(transactionId, this.commentFiles)
      .subscribe({
        next: () => {
          this.comment = '';
          this.commentFiles = [];
          this.submitting = false;
          this.loadTicket();
        },
        error: () => {
          this.comment = '';
          this.commentFiles = [];
          this.submitting = false;
          this.loadTicket();
        },
      });
  }

  onStatusSelect(status: string): void {
    this.statusDropdownOpen = false;
    if (status === this.ticket.status) return;
    this.updateStatus(status);
  }

  updateStatus(status: string): void {
    if (this.statusUpdating) return;

    const labels: any = {
      inprogress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
    };

    if (!confirm(`ต้องการเปลี่ยนสถานะเป็น "${labels[status]}" ใช่หรือไม่?`)) {
      return;
    }

    this.statusUpdating = true;
    this.publicTicketService.updateStatus(this.token, status).subscribe({
      next: () => {
        this.statusUpdating = false;
        this.loadTicket();
      },
      error: () => {
        this.statusUpdating = false;
        alert('ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองอีกครั้ง');
      },
    });
  }

  getDueDate(): Date {
    if (this.ticket?.due_date) return new Date(this.ticket.due_date);
    const d = new Date(this.ticket?.created_at);
    d.setDate(d.getDate() + 15);
    return d;
  }

  getDurationDays(): number {
    if (!this.ticket?.created_at) return 0;
    const created = new Date(this.ticket.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    if (!this.ticket) return false;
    if (this.ticket.status === 'completed' || this.ticket.status === 'cancelled') return false;
    return this.getDurationDays() > 15;
  }

  getTransactionFileUrl(filename: string): string {
    return `${environment.api}/complaint-sub-task-transection-file/file/${filename}`;
  }

  isImageFile(name: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  isPdfFile(name: string): boolean {
    return /\.pdf$/i.test(name);
  }

  sortTransactions(transactions: any[]): any[] {
    if (!transactions) return [];
    return [...transactions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContactChannelService } from 'src/app/shared/services/contact-channel.service';
import { ContactChannelDeleteComponent } from '../contact-channel-delete/contact-channel-delete';

@Component({
  selector: 'app-contact-channel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbPaginationModule],
  templateUrl: './contact-channel-list.html',
  styleUrl: './contact-channel-list.scss'
})
export class ContactChannelListComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  searchText = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  loading = false;

  constructor(
    private contactChannelService: ContactChannelService,
    private modalService: NgbModal,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.contactChannelService.getAll().subscribe({
      next: (data) => {
        this.items = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('ไม่สามารถโหลดข้อมูลได้');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      this.filteredItems = this.items.filter(item =>
        item.channel_name?.toLowerCase().includes(search)
      );
    } else {
      this.filteredItems = [...this.items];
    }
    this.totalItems = this.filteredItems.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  create(): void {
    this.router.navigate(['/pages/settings/contact-channel/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/pages/settings/contact-channel/edit', id]);
  }

  delete(item: any): void {
    const modalRef = this.modalService.open(ContactChannelDeleteComponent);
    modalRef.componentInstance.item = item;
    modalRef.result.then(
      (result) => {
        if (result === 'deleted') {
          this.loadData();
        }
      },
      () => {}
    );
  }

  clearFilters(): void {
    this.searchText = '';
    this.currentPage = 1;
    this.applyFilter();
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(start, start + this.itemsPerPage);
  }
}

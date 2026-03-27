import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TicketSubCategoryService } from 'src/app/shared/services/ticket-sub-category.service';
import { TicketSubCategoryDeleteComponent } from '../ticket-sub-category-delete/ticket-sub-category-delete';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

@Component({
  selector: 'app-ticket-sub-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbPaginationModule, HasPermissionDirective],
  templateUrl: './ticket-sub-category-list.html'
})
export class TicketSubCategoryListComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  searchText = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  loading = false;

  constructor(
    private ticketSubCategoryService: TicketSubCategoryService,
    private modalService: NgbModal,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.ticketSubCategoryService.getAll().subscribe({
      next: (res) => {
        this.items = Array.isArray(res) ? res : (res?.data || []);
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
    let filtered = [...this.items];
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.sub_category_name?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }
    this.filteredItems = filtered;
    this.totalItems = filtered.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchText = '';
    this.currentPage = 1;
    this.applyFilter();
  }

  create(): void {
    this.router.navigate(['/pages/settings/ticket-sub-category/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/pages/settings/ticket-sub-category/edit', id]);
  }

  delete(item: any): void {
    const modalRef = this.modalService.open(TicketSubCategoryDeleteComponent);
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

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(start, start + this.itemsPerPage);
  }
}

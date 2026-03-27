import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { JobCategoryService } from 'src/app/shared/services/job-category.service';
import { JobCategoryDeleteComponent } from '../job-category-delete/job-category-delete';

@Component({
  selector: 'app-job-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbPaginationModule],
  templateUrl: './job-category-list.html',
  styleUrl: './job-category-list.scss'
})
export class JobCategoryListComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];

  searchText = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  loading = false;

  constructor(
    private jobCategoryService: JobCategoryService,
    private modalService: NgbModal,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.jobCategoryService.getAllCategories().subscribe({
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
        item.catagory_name?.toLowerCase().includes(search)
      );
    }

    this.filteredItems = filtered;
    this.totalItems = filtered.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  create(): void {
    this.router.navigate(['/pages/settings/job-category/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/pages/settings/job-category/edit', id]);
  }

  delete(item: any): void {
    const modalRef = this.modalService.open(JobCategoryDeleteComponent);
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

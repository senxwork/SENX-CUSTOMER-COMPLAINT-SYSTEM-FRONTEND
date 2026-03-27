import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { ToastrService } from "ngx-toastr";
import { ProjectService } from "src/app/shared/services/project.service";
import { RoleService } from "src/app/shared/services/role.service";

export interface Project {
  id: string;
  project_id: string;
  project_name_en: string;
  project_name_th: string;
  project_logo_image: string | null;
  project_status: boolean;
  project_email: string;
  project_type: string | null;
  is_managed: boolean;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Component({
  selector: "app-project-list",
  imports: [CommonModule, FormsModule],
  templateUrl: "./project-list.html",
  styleUrl: "./project-list.scss",
})
export class ProjectListComponent implements OnInit {
  searchProject: string = "";
  searchStatus: string = "";

  allProjects: any[] = [];
  filteredProjectList: Project[] = [];
  paginatedProjectList: Project[] = [];
  paginationRange: number[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  loading: boolean = false;

  endpointProjectLogo: string = "";

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.endpointProjectLogo = this.projectService.endpointProjectLogo;
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getAllProjects().subscribe({
      next: (response) => {
        this.allProjects = response.data;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading Projects:", error);
        this.toastr.error("ไม่สามารถโหลดข้อมูลโครงการได้", "ข้อผิดพลาด");
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.allProjects];

    if (this.searchProject) {
      const search = this.searchProject.toLowerCase();
      filtered = filtered.filter(item =>
        item.project_name_th?.toLowerCase().includes(search) ||
        item.project_name_en?.toLowerCase().includes(search) ||
        item.project_id?.toLowerCase().includes(search)
      );
    }

    if (this.searchStatus !== "") {
      const statusBool = this.searchStatus === "true";
      filtered = filtered.filter(item => item.project_status === statusBool);
    }

    this.filteredProjectList = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProjectList = this.filteredProjectList.slice(start, start + this.itemsPerPage);
    this.updatePaginationRange();
  }

  clearFilters(): void {
    this.searchProject = "";
    this.searchStatus = "";
    this.currentPage = 1;
    this.applyFilter();
  }

  updatePaginationRange(): void {
    const range: number[] = [];
    const maxPages = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    this.paginationRange = range;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  getStatusClass(active: boolean): string {
    return active ? "badge bg-success" : "badge bg-danger";
  }

  getStatusText(active: boolean): string {
    return active ? "ใช้งาน" : "ไม่ใช้งาน";
  }

  formatDate(dateString: string): string {
    if (!dateString) return "ไม่ระบุ";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  viewProject(Project: Project): void {
    /*  this.router.navigate(['/pages/settings/view-Project', Project.Project_id]); */
  }

  editProject(project: Project): void {
    this.router.navigate(['/pages/settings/project-edit', project.id]);
  }

  deleteProject(Project: Project): void {
    /*     if (confirm(`คุณต้องการลบผู้ใช้ "${Project.first_name_last_name}" หรือไม่?`)) {
      this.loading = true;
      // Assuming there's a delete method in ProjectService
      // this.ProjectService.deleteProject(Project.id).subscribe({
      //   next: (response) => {
      //     this.toastr.success('ลบผู้ใช้เรียบร้อยแล้ว', 'สำเร็จ');
      //     this.loadProjects();
      //   },
      //   error: (error) => {
      //     console.error('Error deleting Project:', error);
      //     this.toastr.error('ไม่สามารถลบผู้ใช้ได้', 'ข้อผิดพลาด');
      //     this.loading = false;
      //   }
      // });
      this.toastr.warning('ฟังก์ชันลบผู้ใช้ยังไม่ได้เปิดใช้งาน', 'แจ้งเตือน');
      this.loading = false;
    } */
  }

  createNewProject(): void {
    this.router.navigate(["/pages/settings/project-create"]);
  }
}

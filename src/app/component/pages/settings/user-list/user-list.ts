import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/shared/services/role.service';
import { DepartmentService } from 'src/app/shared/services/department.service';

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  username: string;
  first_name_last_name: string;
  email: string;
  mobile: string | null;
  role: Role;
  department?: string;
  active: boolean;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit {
  searchName: string = '';
  searchEmail: string = '';
  searchRole: string = '';
  searchStatus: string = '';

  userList: User[] = [];
  availableRoles: any[] = [];
  availableDepartments: any[] = [];
  filteredUserList: User[] = [];
  paginatedUserList: User[] = [];

  paginationRange: number[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  loading: boolean = false;

  // Reset Password Modal variables
  showResetPasswordModal: boolean = false;
  selectedUser: User | null = null;
  newPassword: string = '';
  confirmNewPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;
  resetPasswordLoading: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadDepartments();
  }

  loadUsers(): void {
    this.loading = true;

    const filter: any = {};
    if (this.searchName) filter.first_name_last_name = this.searchName;
    if (this.searchEmail) filter.email = this.searchEmail;
    if (this.searchRole) filter.role = this.searchRole;
    if (this.searchStatus !== '') filter.active = this.searchStatus === 'true';

    this.userService.getUser(this.currentPage, filter).subscribe({
      next: (response) => {
        this.userList = response.data;
        this.filteredUserList = [...response.data];
        this.totalItems = response.meta?.total || response.data.length;
        this.totalPages = response.meta?.last_page || 1;
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastr.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้', 'ข้อผิดพลาด');
        this.loading = false;
      }
    });
  }

  searchUsers(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  hasFilters(): boolean {
    return !!(this.searchName || this.searchEmail || this.searchRole || this.searchStatus);
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchEmail = '';
    this.searchRole = '';
    this.searchStatus = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  updatePagination(): void {
    this.paginatedUserList = [...this.filteredUserList];
    this.updatePaginationRange();
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
      this.loadUsers();
    }
  }

  getPaginationRange(): number[] {
    return this.paginationRange;
  }

  getStatusClass(active: boolean): string {
    return active ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatusText(active: boolean): string {
    return active ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  getRoleClass(role: Role): string {
    if (!role || !role.name) {
      return 'badge bg-secondary';
    }
    return 'badge bg-primary';
  }

  getRoleText(role: Role): string {
    if (!role || !role.name) {
      return 'ไม่ระบุ';
    }
    return role.name;
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  editUser(user: User): void {
    this.router.navigate(['/pages/settings/edit-user', user.user_id]);
  }

  deleteUser(user: User): void {
    if (confirm(`คุณต้องการลบผู้ใช้ "${user.first_name_last_name}" หรือไม่?`)) {
      this.loading = true;
      this.toastr.warning('ฟังก์ชันลบผู้ใช้ยังไม่ได้เปิดใช้งาน', 'แจ้งเตือน');
      this.loading = false;
    }
  }

  createNewUser(): void {
    this.router.navigate(['/pages/settings/create-user']);
  }

  // Reset Password Methods
  openResetPasswordModal(user: User): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.passwordTouched = false;
    this.confirmPasswordTouched = false;
    this.resetPasswordLoading = false;
    this.showResetPasswordModal = true;
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal = false;
    this.selectedUser = null;
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isPasswordValid(): boolean {
    return this.newPassword.length >= 6 &&
           this.confirmNewPassword.length >= 6 &&
           this.newPassword === this.confirmNewPassword;
  }

  confirmResetPassword(): void {
    if (!this.isPasswordValid()) {
      this.toastr.error('กรุณากรอกรหัสผ่านให้ถูกต้องและตรงกัน', 'ข้อผิดพลาด');
      return;
    }

    if (!this.selectedUser) {
      this.toastr.error('ไม่พบข้อมูลผู้ใช้', 'ข้อผิดพลาด');
      return;
    }

    this.resetPasswordLoading = true;

    const payload = {
      password: this.newPassword,
      password_confirm: this.confirmNewPassword
    };

    this.authService.changePassword(this.selectedUser.user_id, payload).subscribe({
      next: (response) => {
        this.resetPasswordLoading = false;
        this.closeResetPasswordModal();
        this.toastr.success('รีเซ็ตรหัสผ่านเสร็จสิ้น', 'สำเร็จ', {
          timeOut: 1000,
          closeButton: true,
          progressBar: true
        });
      },
      error: (error) => {
        console.error('Error resetting password:', error);
        this.resetPasswordLoading = false;

        if (error?.error?.statusCode === 500) {
          this.toastr.error('มีข้อผิดพลาดโปรดลองอีกครั้ง', 'แจ้งเตือน', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        } else {
          const errorMessage = error?.error?.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้';
          this.toastr.error(errorMessage, 'ข้อผิดพลาด', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        }
      }
    });
  }

  loadRoles(): void {
    this.roleService.all().subscribe({
      next: (response) => {
        this.availableRoles = Array.isArray(response) ? response : (response.data || []);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (response) => {
        this.availableDepartments = Array.isArray(response) ? response : (response.data || []);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  getDepartmentName(departmentId: string | undefined): string {
    if (!departmentId) return '-';
    const dept = this.availableDepartments.find(d => d.id === departmentId);
    return dept?.department_name || '-';
  }
}

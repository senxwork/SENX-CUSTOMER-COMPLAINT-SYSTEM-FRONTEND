import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { DepartmentService } from 'src/app/shared/services/department.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserDto {
  first_name_last_name: string;
  username: string;
  email: string;
  password: string;
  mobile?: string;
  role_id: string;
  job_departments_id?: string;
  active: boolean;
}

@Component({
  selector: 'app-user-create',
  imports: [CommonModule, FormsModule, NgMultiSelectDropDownModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreateComponent implements OnInit {
  user: CreateUserDto = {
    first_name_last_name: '',
    username: '',
    email: '',
    password: '',
    mobile: '',
    role_id: '',
    active: true
  };

  confirmPassword: string = '';
  loading: boolean = false;
  availableRoles: Role[] = [];
  availableJobDepartments: any[] = [];

  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

  // Password validation flags
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;
  emailTouched: boolean = false;

  // Multiselect dropdown settings
  roleDropdownSettings: IDropdownSettings = {};
  jobDepartmentDropdownSettings: IDropdownSettings = {};
  selectedRoles: any[] = [];
  selectedJobDepartments: any[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadJobDepartments();
    this.initializeDropdownSettings();
  }

  initializeDropdownSettings(): void {
    // Role dropdown settings (single-select)
    this.roleDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: 'ค้นหาสิทธิ์...',
      noDataAvailablePlaceholderText: 'ไม่มีข้อมูลสิทธิ์',
      noFilteredDataAvailablePlaceholderText: 'ไม่พบสิทธิ์ที่ค้นหา'
    };

    // Department dropdown settings (single-select)
    this.jobDepartmentDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'department_name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: 'ค้นหาหน่วยงาน...',
      noDataAvailablePlaceholderText: 'ไม่มีข้อมูลหน่วยงาน',
      noFilteredDataAvailablePlaceholderText: 'ไม่พบหน่วยงานที่ค้นหา'
    };
  }

  loadRoles(): void {
    this.roleService.all().subscribe({
      next: (response) => {
        console.log('Roles loaded:', response);
        // API returns array directly, not wrapped in {data: [...]}
        this.availableRoles = Array.isArray(response) ? response : (response.data || []);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.toastr.error('ไม่สามารถโหลดข้อมูลสิทธิ์การเข้าใช้งานได้', 'ข้อผิดพลาด');
      }
    });
  }

  loadJobDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (response) => {
        console.log('Departments loaded:', response);
        this.availableJobDepartments = Array.isArray(response) ? response : (response.data || []);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.availableJobDepartments = [];
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }

  onRoleSelect(item: any): void {
    this.user.role_id = this.selectedRoles.length > 0 ? this.selectedRoles[0].id : '';
  }

  onRoleDeselect(item: any): void {
    this.user.role_id = this.selectedRoles.length > 0 ? this.selectedRoles[0].id : '';
  }

  onJobDepartmentSelect(item: any): void {
    this.user.job_departments_id = this.selectedJobDepartments.length > 0 ? this.selectedJobDepartments[0].id : '';
  }

  onJobDepartmentDeselect(item: any): void {
    this.user.job_departments_id = this.selectedJobDepartments.length > 0 ? this.selectedJobDepartments[0].id : '';
  }

  // Email validation methods
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.user.email);
  }

  isEmailInvalid(): boolean {
    return this.emailTouched && this.user.email.length > 0 && !this.isEmailValid();
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  // Password validation methods
  isPasswordValid(): boolean {
    return this.user.password.length >= 6;
  }

  isPasswordInvalid(): boolean {
    return this.passwordTouched && this.user.password.length > 0 && !this.isPasswordValid();
  }

  isConfirmPasswordInvalid(): boolean {
    return this.confirmPasswordTouched && this.confirmPassword.length > 0 && this.user.password !== this.confirmPassword;
  }

  isPasswordMatch(): boolean {
    return this.user.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  onConfirmPasswordBlur(): void {
    this.confirmPasswordTouched = true;
  }

  validateForm(): boolean {
    if (!this.user.first_name_last_name) {
      this.toastr.error('กรุณากรอกชื่อ-นามสกุล', 'ข้อผิดพลาด');
      return false;
    }

    if (!this.user.username) {
      this.toastr.error('กรุณากรอก Username', 'ข้อผิดพลาด');
      return false;
    }

    if (!this.user.email) {
      this.toastr.error('กรุณากรอกอีเมล', 'ข้อผิดพลาด');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.toastr.error('รูปแบบอีเมลไม่ถูกต้อง', 'ข้อผิดพลาด');
      return false;
    }

    if (!this.user.password) {
      this.toastr.error('กรุณากรอกรหัสผ่าน', 'ข้อผิดพลาด');
      return false;
    }

    if (this.user.password.length < 6) {
      this.toastr.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'ข้อผิดพลาด');
      return false;
    }

    if (this.user.password !== this.confirmPassword) {
      this.toastr.error('รหัสผ่านไม่ตรงกัน', 'ข้อผิดพลาด');
      return false;
    }

    if (!this.user.role_id) {
      this.toastr.error('กรุณาเลือกสิทธิ์การเข้าใช้งาน', 'ข้อผิดพลาด');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Prepare user data for API
    const userCreate = {
      role_id: this.selectedRoles[0].id,
      department: this.selectedJobDepartments.length > 0 ? this.selectedJobDepartments[0].id : null,
      first_name_last_name: this.user.first_name_last_name,
      username: this.user.username,
      mobile: this.user.mobile || '',
      email: this.user.email,
      password: this.user.password,
      password_confirm: this.confirmPassword,
      active: true
    };

    console.log('Creating user with data:', userCreate);

    this.authService.register(userCreate).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.toastr.success('เพิ่มผู้ใช้งานเรียบร้อยแล้ว', 'สำเร็จ', {
          timeOut: 1000,
          closeButton: true,
          progressBar: true
        });
        this.router.navigate(['/pages/settings/user-list']);
      },
      error: (error) => {
        console.error('Error creating user:', error);

        if (error?.error?.statusCode === 500) {
          this.toastr.error('อีเมลนี้มีการสร้างผู้ใช้งานแล้ว', 'แจ้งเตือน', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        } else {
          const errorMessage = error?.error?.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้';
          this.toastr.error(errorMessage, 'ข้อผิดพลาด', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        }

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    if (confirm('คุณต้องการยกเลิกการเพิ่มผู้ใช้งานหรือไม่?')) {
      this.router.navigate(['/pages/settings/user-list']);
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from "src/app/shared/services/user.service";
import { RoleService } from "src/app/shared/services/role.service";
import { DepartmentService } from "src/app/shared/services/department.service";
import { ToastrService } from "ngx-toastr";
import { NgMultiSelectDropDownModule, IDropdownSettings } from "ng-multiselect-dropdown";

export interface Role {
  id: string;
  name: string;
}

export interface UpdateUserDto {
  first_name_last_name: string;
  email: string;
  password?: string;
  mobile?: string;
  role_id: string;
  job_departments_id?: string;
  active: boolean;
}

@Component({
  selector: "app-user-edit",
  imports: [CommonModule, FormsModule, NgMultiSelectDropDownModule],
  templateUrl: "./user-edit.html",
  styleUrl: "./user-edit.scss",
})
export class UserEditComponent implements OnInit {
  user: UpdateUserDto = {
    first_name_last_name: "",
    email: "",
    mobile: "",
    role_id: "",
    active: true,
  };

  loading: boolean = false;
  availableRoles: Role[] = [];
  availableJobDepartments: any[] = [];

  emailTouched: boolean = false;

  // Multiselect dropdown settings
  roleDropdownSettings: IDropdownSettings = {};
  jobDepartmentDropdownSettings: IDropdownSettings = {};
  selectedRoles: any[] = [];
  selectedJobDepartments: any[] = [];
  userId: any;
  originalData: any = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log("Route params:", params);
      this.userId = params["id"];
      console.log("Editing user with ID:", this.userId);
      this.initializeDropdownSettings();
      this.loadRoles();
      this.loadJobDepartments();

      if (this.userId) {
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.get(this.userId).subscribe({
      next: (response) => {
        this.originalData = response;
        const data = response;
        console.log("User data from API:", response);
        // Map user data
        this.user = {
          first_name_last_name: data.first_name_last_name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          role_id: data.role?.id || "",
          job_departments_id: data.department || "",
          active: data.active !== undefined ? data.active : true,
        };

        // Set selected role for dropdown
        if (data.role) {
          this.selectedRoles = [data.role];
        }

        // Set selected department for dropdown (find from availableJobDepartments by ID)
        if (data.department && this.availableJobDepartments.length > 0) {
          const dept = this.availableJobDepartments.find((d: any) => d.id === data.department);
          if (dept) {
            this.selectedJobDepartments = [dept];
          }
        }

        console.log("User data loaded:", this.user);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading user data:", error);
        this.toastr.error(error, "ข้อผิดพลาด");
        this.loading = false;
      },
    });
  }

  initializeDropdownSettings(): void {
    // Role dropdown settings (single-select)
    this.roleDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: "ค้นหาสิทธิ์...",
      noDataAvailablePlaceholderText: "ไม่มีข้อมูลสิทธิ์",
      noFilteredDataAvailablePlaceholderText: "ไม่พบสิทธิ์ที่ค้นหา",
    };

    // Department dropdown settings (single-select)
    this.jobDepartmentDropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "department_name",
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: "ค้นหาหน่วยงาน...",
      noDataAvailablePlaceholderText: "ไม่มีข้อมูลหน่วยงาน",
      noFilteredDataAvailablePlaceholderText: "ไม่พบหน่วยงานที่ค้นหา",
    };
  }

  loadRoles(): void {
    this.roleService.all().subscribe({
      next: (response) => {
        console.log("Roles loaded:", response);
        // API returns array directly, not wrapped in {data: [...]}
        this.availableRoles = Array.isArray(response) ? response : response.data || [];
      },
      error: (error) => {
        console.error("Error loading roles:", error);
        this.toastr.error("ไม่สามารถโหลดข้อมูลสิทธิ์การเข้าใช้งานได้", "ข้อผิดพลาด");
      },
    });
  }

  loadJobDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (response) => {
        console.log("Departments loaded:", response);
        this.availableJobDepartments = Array.isArray(response) ? response : response.data || [];
        // Set selected department if user data is already loaded
        if (this.user.job_departments_id && this.availableJobDepartments.length > 0) {
          const dept = this.availableJobDepartments.find((d: any) => d.id === this.user.job_departments_id);
          if (dept) {
            this.selectedJobDepartments = [dept];
          }
        }
      },
      error: (error) => {
        console.error("Error loading departments:", error);
        this.availableJobDepartments = [];
      },
    });
  }

  onRoleSelect(item: any): void {
    this.updateRoleId();
  }

  onRoleDeselect(item: any): void {
    this.updateRoleId();
  }

  updateRoleId(): void {
    this.user.role_id = this.selectedRoles.length > 0 ? this.selectedRoles[0].id : "";
  }

  onJobDepartmentSelect(item: any): void {
    this.updateJobDepartmentId();
  }

  onJobDepartmentDeselect(item: any): void {
    this.updateJobDepartmentId();
  }

  updateJobDepartmentId(): void {
    this.user.job_departments_id = this.selectedJobDepartments.length > 0 ? this.selectedJobDepartments[0].id : "";
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

  validateForm(): boolean {
    if (!this.user.first_name_last_name) {
      this.toastr.error("กรุณากรอกชื่อ-นามสกุล", "ข้อผิดพลาด");
      return false;
    }

    if (!this.user.email) {
      this.toastr.error("กรุณากรอกอีเมล", "ข้อผิดพลาด");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.toastr.error("รูปแบบอีเมลไม่ถูกต้อง", "ข้อผิดพลาด");
      return false;
    }

  
    if (!this.user.role_id && (!this.selectedRoles || this.selectedRoles.length === 0)) {
      this.toastr.error("กรุณาเลือกสิทธิ์การเข้าใช้งาน", "ข้อผิดพลาด");
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
    const userEdit: any = {
      role_id: this.selectedRoles[0].id,
      department: this.selectedJobDepartments.length > 0 ? this.selectedJobDepartments[0].id : null,
      first_name_last_name: this.user.first_name_last_name,
      mobile: this.user.mobile || "",
      email: this.user.email,
      active: this.user.active,
      assign_permission: this.originalData?.assign_permission || false,
    };


    console.log("Edit user with data:", userEdit);

    this.userService.update(this.userId, userEdit).subscribe({
      next: (response) => {
        console.log("User updated successfully:", response);
        this.toastr.success("แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว", "สำเร็จ", {
          timeOut: 1000,
          closeButton: true,
          progressBar: true,
        });
        this.router.navigate(["/pages/settings/user-list"]);
      },
      error: (error) => {
        console.error("Error updating user:", error);

        if (error?.error?.statusCode === 500) {
          this.toastr.error("อีเมลนี้มีการใช้งานแล้ว", "แจ้งเตือน", {
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
          });
        } else {
          const errorMessage = error?.error?.message || "ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้";
          this.toastr.error(errorMessage, "ข้อผิดพลาด", {
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
          });
        }

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    if (confirm("คุณต้องการยกเลิกการแก้ไขข้อมูลผู้ใช้งานหรือไม่?")) {
      this.router.navigate(["/pages/settings/user-list"]);
    }
  }
}

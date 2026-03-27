import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/services/user.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { PermissionCategoryService } from 'src/app/shared/services/permission-category.service';
import { FeatureService } from 'src/app/shared/services/feature.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Role } from 'src/app/interfaces/role';
import { Permission } from 'src/app/interfaces/permission';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-permission',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbNavModule],
  templateUrl: './permission.html',
  styleUrl: './permission.scss'
})
export class PermissionComponent implements OnInit {
  enable = false;
  loading: boolean = false;
  loadingText: string = '';
  users: any[] = [];
  lastPage: number = 0;
  pages: any[] = [];
  page: any = 1;
  roles: Role[] = [];
  form!: FormGroup;
  permissions: Permission[] = [];
  permissionsData: any[] = [];
  permissionCategory: any[] = [];
  role_name: any;
  role_nameData: any;
  userChangePasswordForm!: FormGroup;
  clickSubmit = false;
  features: any[] = [];
  password = 'password';
  show = false;
  user_id: any;
  modalReference: any;
  userData: any;
  activeId: any = 1;
  role_id: any;
  searchTerm = '';
  rule: any;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private formBuilder: FormBuilder,
    private permissionService: PermissionService,
    private permissionCategoryService: PermissionCategoryService,
    private featureService: FeatureService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private auth: AuthService,
    private toastr: ToastrService,  private changeDetectorRef: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.getRoleData();
  }

  get permissionArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  getRoleData(): void {
    this.roleService.all().subscribe((res: any) => {
      this.roles = res;
    });
  }

  editRoleData(id: any, role_name: any) {
    this.role_name = role_name;
    this.role_id = id;
    this.enable = true;
    console.log(`Editing Role ID: ${id}, Name: ${role_name}`);
    // Reset permissionsData first
    this.permissionsData = [];
    
    // สร้าง FormGroup
    this.form = this.formBuilder.group({
      name: '',
      permissions: this.formBuilder.array([])
    });

    // Load permissions first, then load role data
    this.permissionService.all().subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
      
      // Clear FormArray
      while (this.permissionArray.length !== 0) {
        this.permissionArray.removeAt(0);
      }

      // สร้าง FormArray สำหรับทุก permission
      this.permissions.forEach((p: Permission) => {
        this.permissionArray.push(
          this.formBuilder.group({
            value: false,
            id: p.id,
            no_config: p.no_config,
            name_config: p.name_config,
            permissionCategoryId: p.permissionCategoryId,
            status: p.status
          })
        );
      });

      // After permissions are loaded, then load role data
      this.roleService.get(id).subscribe((role: Role) => {
        // สร้าง permissionsData พร้อมค่า value ที่ถูกต้อง
        const tempPermissionsData = this.permissions.map((p, index) => {
        console.log(`ROLE`, role)
          const hasPermission = role.permissions?.some(r => r.id === p.id) || false;
          console.log(`Permission ID ${p.id} assigned to role:`, hasPermission);
          // อัพเดท FormArray ด้วย
          this.permissionArray.at(index).patchValue({
            value: hasPermission
          });
          
          return {
            value: hasPermission,  // ค่านี้สำคัญ! ต้องเป็น boolean ที่ถูกต้อง
            id: p.id,
            no_config: p.no_config,
            permissionCategoryId: p.permissionCategoryId,
            name_config: p.name_config,
            status: p.status
          };
        });
        
        // Set permissionsData และบังคับ change detection
        this.permissionsData = [...tempPermissionsData];
        this.role_nameData = role.name;
        
        console.log('Loaded Role Permissions:', this.permissionsData);
        console.log('Sample permission value:', this.permissionsData[0]);
        
        // Force change detection
        this.changeDetectorRef.detectChanges();
      });
    });

    // Load permission categories
    this.permissionCategoryService.all().subscribe((permissionCategory: any) => {
      this.permissionCategory = permissionCategory;
    });

    // Load features
    this.featureService.all().subscribe((features: any) => {
      this.features = features;
    });
  }

  submit(): void {
    // ใช้ข้อมูลจาก permissionsData ที่ถูก update จาก ngModel
    const data = {
      name: this.role_nameData,
      permissions: this.permissionsData
        .filter((p: any) => p.value === true)
        .map((p: any) => p.id)
    };

    console.log('Submitting data:', data);

    this.roleService.update(this.role_id, data).subscribe({
      next: (user: any) => {
        this.toastr.success('บันทึกแก้ไขการตั้งค่าสิทธิ์การเข้าใช้งาน เสร็จสิ้น', 'แจ้งเตือน', {
          timeOut: 1000,
          closeButton: true,
          progressBar: true
        });
        this.clearForm();
        return user;
      },
      error: (e: any) => {
        console.log(e);
        if (e.error.statusCode === 500) {
          this.toastr.error(e.error, 'แจ้งเตือน', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        } else {
          this.toastr.error(e.error.message, 'แจ้งเตือน', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.clearForm();
      }
    });
  }

  openModalConfirm(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then(
        (result: any) => {
          if (result === 'Ok') {
            this.submit();
          }
        },
        (reason: any) => {
          console.log(reason);
        }
      );
  }

  openModalAddRule(content: any) {
    this.modalReference = this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'none',
        centered: false,
        backdrop: 'static',
        keyboard: false
      })
      .result.then(
        (result: any) => {
          if (result === 'Ok') {
          }
        },
        (reason: any) => {}
      );
  }

  addRule() {
    if (this.rule) {
      const rule_name = { name: this.rule };
      this.roleService.create(rule_name).subscribe({
        next: (rule: any) => {
          this.toastr.success('บันทึกข้อมูล เสร็จสิ้น', 'แจ้งเตือน', {
            timeOut: 1000,
            closeButton: true,
            progressBar: true
          });
          this.modalService.dismissAll();
          this.getRoleData();
          this.rule = '';
          return rule;
        },
        error: (e: any) => {
          console.log(e);
          this.toastr.error(e.error.message, 'แจ้งเตือน', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
          });
          this.loading = false;
        }
      });
    }
  }

  // Helper methods for template
  getSortedFeatures() {
    return this.features.sort((a, b) => (a.tab_config || 0) - (b.tab_config || 0));
  }

  getPermissionsByCategory(categoryId: string) {
    // ไม่ใช้ method นี้แล้วใน template ปัจจุบัน
    const filtered = this.permissions
      .map((p: Permission, index: number) => ({
        ...p,
        globalIndex: index,
        value: this.permissionArray.at(index)?.get('value')?.value ?? false
      }))
      .filter((p: any) => p.permissionCategoryId === categoryId)
      .sort((a, b) => (a.no_config || 0) - (b.no_config || 0));

    return filtered;
  }

  filterPermissionsByCategory(categoryId: string) {
    // Method นี้ใช้ใน template - return จาก permissionsData
    return this.permissionsData
      .filter((p: any) => p.permissionCategoryId === categoryId)
      .sort((a, b) => (a.no_config || 0) - (b.no_config || 0));
  }

  clearForm() {
    this.enable = false;
    this.role_name = '';
    this.role_id = null;
    this.permissionsData = [];
    this.permissionCategory = [];
    this.features = [];
  }

  cancelEdit() {
    this.clearForm();
  }
}

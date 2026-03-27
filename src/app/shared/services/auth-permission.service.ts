import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth } from '../../classes/auth';
import { Permission } from '../../interfaces/permission';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthPermissionService {
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();
  private loadedSubject = new BehaviorSubject<boolean>(false);
  public loaded$ = this.loadedSubject.asObservable();
  private user: any = null;

  constructor() {
    // โหลด user ครั้งแรก
    this.user = Auth.user;
    this.loadPermissions();

    // Subscribe to user changes เพื่อให้แน่ใจว่าจะโหลดได้แม้ user โหลดช้า
    Auth.userEmitter.subscribe((res: any) => {
      this.user = res;
      this.loadPermissions();
    });
  }

  /**
   * โหลด permissions จาก user
   */
  private loadPermissions(): void {
    if (this.user) {
      this.permissionsSubject.next(this.user.role?.permissions || []);
      this.loadedSubject.next(true);
    }
  }

  /**
   * ตรวจว่า permissions โหลดเสร็จหรือยัง
   */
  isLoaded(): boolean {
    return this.loadedSubject.value;
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์หรือไม่ โดยใช้ name_config
   * @param permissionName - name_config เช่น 'view_plan', 'create_assets'
   * @returns true ถ้ามีสิทธิ์, false ถ้าไม่มี
   */
  hasPermission(permissionName: string): boolean {
    const permissions = this.permissionsSubject.value;
    return permissions.some(p => p.name_config === permissionName);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์อย่างใดอย่างหนึ่งหรือไม่
   * @param permissionNames - array ของ name_config
   * @returns true ถ้ามีสิทธิ์อย่างใดอย่างหนึ่ง
   */
  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(name => this.hasPermission(name));
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์ทั้งหมดหรือไม่
   * @param permissionNames - array ของ name_config
   * @returns true ถ้ามีสิทธิ์ทั้งหมด
   */
  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every(name => this.hasPermission(name));
  }

  /**
   * ดึง permissions ทั้งหมด
   */
  getAllPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  /**
   * ดึง permissions ตาม category
   */
  getPermissionsByCategory(categoryId: string): Permission[] {
    return this.permissionsSubject.value.filter(
      p => p.permissionCategoryId === categoryId
    );
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์ดู (view) หรือไม่
   */
  canView(module: string): boolean {
    return this.hasPermission(`view_${module}`);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์สร้าง (create) หรือไม่
   */
  canCreate(module: string): boolean {
    return this.hasPermission(`create_${module}`);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์แก้ไข (edit) หรือไม่
   */
  canEdit(module: string): boolean {
    return this.hasPermission(`edit_${module}`);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์ลบ (delete) หรือไม่
   */
  canDelete(module: string): boolean {
    return this.hasPermission(`delete_${module}`);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์อนุมัติ (approve) หรือไม่
   */
  canApprove(module: string): boolean {
    return this.hasPermission(`approved_${module}`);
  }

  /**
   * ตรวจสอบว่ามีสิทธิ์พิมพ์ (print) หรือไม่
   */
  canPrint(module: string): boolean {
    return this.hasPermission(`print_${module}`);
  }

  /**
   * ดึงชื่อ Role ของ user
   */
  getRoleName(): string {
    return this.user?.role?.name || 'ไม่ระบุ';
  }

  /**
   * ดึงข้อมูล user ปัจจุบัน
   */
  getCurrentUser(): any {
    return this.user;
  }
}

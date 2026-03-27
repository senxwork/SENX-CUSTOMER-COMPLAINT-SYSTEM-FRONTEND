import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthPermissionService } from '../services/auth-permission.service';

/**
 * Directive สำหรับซ่อน/แสดง element ตามสิทธิ์
 *
 * วิธีใช้:
 * 1. ตรวจสอบสิทธิ์เดียว:
 *    <button *hasPermission="'create_plan'">สร้างแผน</button>
 *
 * 2. ตรวจสอบหลายสิทธิ์ (มีอย่างใดอย่างหนึ่ง):
 *    <button *hasPermission="['create_plan', 'edit_plan']">แก้ไข</button>
 *
 * 3. ตรวจสอบหลายสิทธิ์ (ต้องมีทั้งหมด):
 *    <button *hasPermission="['create_plan', 'edit_plan']; requireAll: true">แก้ไข</button>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() hasPermission: string | string[] = '';
  @Input() hasPermissionRequireAll: boolean = false;

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authPermissionService: AuthPermissionService
  ) {}

  ngOnInit(): void {
    // Subscribe to permission changes
    this.authPermissionService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    // Initial check
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasAccess = this.checkPermission();

    if (hasAccess) {
      // แสดง element - สร้างเฉพาะเมื่อยังไม่มี view
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      // ซ่อน element - clear เฉพาะเมื่อมี view อยู่
      if (this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    }
  }

  private checkPermission(): boolean {
    if (!this.hasPermission) {
      return true; // ถ้าไม่ระบุสิทธิ์ให้แสดง
    }

    if (typeof this.hasPermission === 'string') {
      // ตรวจสอบสิทธิ์เดียว
      return this.authPermissionService.hasPermission(this.hasPermission);
    }

    if (Array.isArray(this.hasPermission)) {
      // ตรวจสอบหลายสิทธิ์
      if (this.hasPermissionRequireAll) {
        // ต้องมีทั้งหมด
        return this.authPermissionService.hasAllPermissions(this.hasPermission);
      } else {
        // มีอย่างใดอย่างหนึ่ง
        return this.authPermissionService.hasAnyPermission(this.hasPermission);
      }
    }

    return false;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AuthPermissionService } from '../services/auth-permission.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Guard สำหรับป้องกันการเข้าถึง route ตามสิทธิ์
 *
 * วิธีใช้ใน routing:
 * {
 *   path: 'create-plan',
 *   component: CreatePlanComponent,
 *   canActivate: [PermissionGuard],
 *   data: {
 *     permission: 'create_plan'  // หรือ ['create_plan', 'edit_plan']
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authPermissionService: AuthPermissionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const requiredPermission = route.data['permission'];

    if (!requiredPermission) {
      return true;
    }

    // ถ้า permissions โหลดเสร็จแล้ว ตรวจสอบทันที
    if (this.authPermissionService.isLoaded()) {
      return this.checkAccess(requiredPermission);
    }

    // ถ้ายังโหลดไม่เสร็จ รอให้โหลดเสร็จก่อนแล้วค่อยตรวจสอบ
    return this.authPermissionService.loaded$.pipe(
      filter(loaded => loaded),
      first(),
      map(() => this.checkAccess(requiredPermission))
    );
  }

  private checkAccess(requiredPermission: string | string[]): boolean | UrlTree {
    let hasAccess = false;

    if (typeof requiredPermission === 'string') {
      hasAccess = this.authPermissionService.hasPermission(requiredPermission);
    } else if (Array.isArray(requiredPermission)) {
      hasAccess = this.authPermissionService.hasAnyPermission(requiredPermission);
    }

    if (!hasAccess) {
      this.toastr.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'ไม่มีสิทธิ์');
      return this.router.createUrlTree(['/pages/complaint/list']);
    }

    return true;
  }
}

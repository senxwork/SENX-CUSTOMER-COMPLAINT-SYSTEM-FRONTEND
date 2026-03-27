# คู่มือการใช้งานระบบกำหนดสิทธิ์ (Permission System)

## ภาพรวม

ระบบกำหนดสิทธิ์ใช้ `name_config` จาก permissions ของ user เพื่อควบคุมการเข้าถึงหน้าต่างๆ และ element ต่างๆ ในระบบ

ตัวอย่าง permission structure:
```json
{
  "id": "8a64ca88-e0a5-47be-ba53-8f5bee67b01a",
  "name": "วิศวกรส่วนกลาง",
  "permissions": [
    {
      "id": "53138259-4595-4edb-b604-53959aadeee4",
      "name": "แผนงานบำรุงรักษา",
      "name_config": "view_plan",
      "no_config": "1",
      "status": true
    },
    {
      "name_config": "create_plan"
    },
    {
      "name_config": "edit_assets"
    }
  ]
}
```

## 1. การใช้งานใน Component (TypeScript)

### Import Service
```typescript
import { AuthPermissionService } from 'src/app/shared/services/auth-permission.service';

export class YourComponent {
  constructor(public permissionService: AuthPermissionService) {}
}
```

### ตรวจสอบสิทธิ์ในโค้ด

```typescript
// ตรวจสอบสิทธิ์เดียว
if (this.permissionService.hasPermission('create_plan')) {
  // มีสิทธิ์สร้างแผน
}

// ตรวจสอบหลายสิทธิ์ (มีอย่างใดอย่างหนึ่ง)
if (this.permissionService.hasAnyPermission(['create_plan', 'edit_plan'])) {
  // มีสิทธิ์สร้างหรือแก้ไข
}

// ตรวจสอบหลายสิทธิ์ (ต้องมีทั้งหมด)
if (this.permissionService.hasAllPermissions(['view_plan', 'print_plan'])) {
  // มีสิทธิ์ทั้งดูและพิมพ์
}

// ใช้ helper methods
if (this.permissionService.canView('plan')) {
  // มีสิทธิ์ดูแผน (view_plan)
}

if (this.permissionService.canCreate('assets')) {
  // มีสิทธิ์สร้างอุปกรณ์ (create_assets)
}

if (this.permissionService.canEdit('checksheet')) {
  // มีสิทธิ์แก้ไขเช็คชีท (edit_checksheet)
}

if (this.permissionService.canDelete('plan')) {
  // มีสิทธิ์ลบแผน (delete_plan)
}

if (this.permissionService.canApprove('plan')) {
  // มีสิทธิ์อนุมัติแผน (approved_plan)
}

if (this.permissionService.canPrint('plan')) {
  // มีสิทธิ์พิมพ์แผน (print_plan)
}
```

## 2. การใช้งานใน Template (HTML)

### Import Directive
```typescript
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

@Component({
  imports: [CommonModule, HasPermissionDirective]
})
```

### ซ่อน/แสดง Element

```html
<!-- ตรวจสอบสิทธิ์เดียว -->
<button *hasPermission="'create_plan'">
  <i class="fas fa-plus"></i> สร้างแผน
</button>

<!-- ตรวจสอบหลายสิทธิ์ (มีอย่างใดอย่างหนึ่ง) -->
<button *hasPermission="['create_plan', 'edit_plan']">
  <i class="fas fa-edit"></i> จัดการแผน
</button>

<!-- ตรวจสอบหลายสิทธิ์ (ต้องมีทั้งหมด) -->
<button *hasPermission="['view_plan', 'print_plan']; requireAll: true">
  <i class="fas fa-print"></i> พิมพ์แผน
</button>

<!-- ปุ่มแก้ไข -->
<button

  class="btn btn-warning"
  (click)="editAsset(asset)">
  แก้ไข
</button>

<!-- ปุ่มลบ -->
<button
  *hasPermission="'delete_assets'"
  class="btn btn-danger"
  (click)="deleteAsset(asset)">
  ลบ
</button>

<!-- ซ่อน section ทั้งหมด -->
<div *hasPermission="'view_plan'">
  <h3>แผนงานบำรุงรักษา</h3>
  <table>...</table>
</div>

<!-- Dropdown menu item -->
<li *hasPermission="'create_checksheet'">
  <a routerLink="/pages/create-checksheet">สร้างเช็คชีท</a>
</li>
```

## 3. การใช้งานใน Routes (Routing)

### เพิ่ม Guard ใน routes
```typescript
import { PermissionGuard } from 'src/app/shared/guards/permission.guard';

const routes: Routes = [
  {
    path: 'maintenance-plan-list',
    component: MaintenancePlanListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'view_plan'  // ต้องมีสิทธิ์ดูแผน
    }
  },
  {
    path: 'create-plan',
    component: CreateMaintenancePlanComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'create_plan'  // ต้องมีสิทธิ์สร้างแผน
    }
  },
  {
    path: 'edit-plan/:id',
    component: EditMaintenancePlanComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['edit_plan', 'create_plan']  // มีสิทธิ์อย่างใดอย่างหนึ่ง
    }
  },
  {
    path: 'assets-list',
    component: AssetsListComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'view_assets'
    }
  }
];
```

## 4. ตัวอย่างการใช้งานในหน้าจริง

### ตัวอย่าง: หน้ารายการแผนงานบำรุงรักษา

**maintenance-plan-list.ts:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthPermissionService } from 'src/app/shared/services/auth-permission.service';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

@Component({
  selector: 'app-maintenance-plan-list',
  imports: [CommonModule, HasPermissionDirective],
  templateUrl: './maintenance-plan-list.html'
})
export class MaintenancePlanListComponent {
  constructor(public permissionService: AuthPermissionService) {}

  canEditPlan(): boolean {
    return this.permissionService.canEdit('plan');
  }

  canDeletePlan(): boolean {
    return this.permissionService.canDelete('plan');
  }

  canApprovePlan(): boolean {
    return this.permissionService.canApprove('plan');
  }
}
```

**maintenance-plan-list.html:**
```html
<div class="card">
  <div class="card-header d-flex justify-content-between">
    <h5>รายการแผนงานบำรุงรักษา</h5>

    <!-- ปุ่มสร้างแผนใหม่ - แสดงเฉพาะคนที่มีสิทธิ์ create_plan -->
    <button
      *hasPermission="'create_plan'"
      class="btn btn-primary"
      routerLink="/pages/create-maintenance-plan">
      <i class="fas fa-plus"></i> สร้างแผนใหม่
    </button>
  </div>

  <div class="card-body">
    <table class="table">
      <thead>
        <tr>
          <th>เลขที่แผน</th>
          <th>ชื่อแผน</th>
          <th>สถานะ</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let plan of plans">
          <td>{{ plan.planNumber }}</td>
          <td>{{ plan.planName }}</td>
          <td>{{ plan.status }}</td>
          <td>
            <!-- ปุ่มดู - แสดงเสมอ เพราะเข้าหน้านี้ได้แสดงว่ามีสิทธิ์ view_plan -->
            <button
              class="btn btn-sm btn-info me-2"
              (click)="viewPlan(plan)">
              <i class="fas fa-eye"></i>
            </button>

            <!-- ปุ่มแก้ไข - แสดงเฉพาะคนที่มีสิทธิ์ edit_plan -->
            <button
              *hasPermission="'edit_plan'"
              class="btn btn-sm btn-warning me-2"
              (click)="editPlan(plan)">
              <i class="fas fa-edit"></i>
            </button>

            <!-- ปุ่มอนุมัติ - แสดงเฉพาะคนที่มีสิทธิ์ approved_plan -->
            <button
              *hasPermission="'approved_plan'"
              class="btn btn-sm btn-success me-2"
              (click)="approvePlan(plan)"
              [disabled]="plan.status === 'approved'">
              <i class="fas fa-check"></i>
            </button>

            <!-- ปุ่มพิมพ์ - แสดงเฉพาะคนที่มีสิทธิ์ print_plan -->
            <button
              *hasPermission="'print_plan'"
              class="btn btn-sm btn-secondary me-2"
              (click)="printPlan(plan)">
              <i class="fas fa-print"></i>
            </button>

            <!-- ปุ่มลบ - แสดงเฉพาะคนที่มีสิทธิ์ delete_plan -->
            <button
              *hasPermission="'delete_plan'"
              class="btn btn-sm btn-danger"
              (click)="deletePlan(plan)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### ตัวอย่าง: หน้ารายการอุปกรณ์

**assets-list.html:**
```html
<div class="container-fluid">
  <div class="row mb-3">
    <div class="col-md-12 d-flex justify-content-between">
      <h4>รายการอุปกรณ์/เครื่องจักร</h4>

      <!-- ปุ่มสร้างอุปกรณ์ใหม่ -->
      <button
        *hasPermission="'create_assets'"
        class="btn btn-primary"
        routerLink="/pages/create-assets">
        <i class="fas fa-plus"></i> สร้างอุปกรณ์ใหม่
      </button>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-body">
          <table class="table">
            <tbody>
              <tr *ngFor="let asset of assets">
                <td>
                  <!-- ปุ่มแก้ไข -->
                  <button
                    *hasPermission="'edit_assets'"
                    class="btn btn-sm btn-warning me-2"
                    [routerLink]="['/pages/edit-assets', asset.id]">
                    <i class="fas fa-edit"></i> แก้ไข
                  </button>

                  <!-- ปุ่มลบ -->
                  <button
                    *hasPermission="'delete_assets'"
                    class="btn btn-sm btn-danger"
                    (click)="deleteAsset(asset)">
                    <i class="fas fa-trash"></i> ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. รายการ Permission ที่ใช้ในระบบ

### แผนงานบำรุงรักษา (Maintenance Plan)
- `view_plan` - ดูรายการแผน
- `create_plan` - สร้างแผนใหม่
- `edit_plan` - แก้ไขแผน
- `approved_plan` - อนุมัติแผน
- `print_plan` - พิมพ์แผน
- `delete_plan` - ลบแผน

### เช็คชีท (Checksheet)
- `view_checksheet` - ดูรายการเช็คชีท
- `create_checksheet` - สร้างเช็คชีทใหม่
- `edit_checksheet` - แก้ไขเช็คชีท
- `delete_checksheet` - ลบเช็คชีท

### อุปกรณ์/เครื่องจักร (Assets)
- `view_assets` - ดูรายการอุปกรณ์
- `create_assets` - สร้างอุปกรณ์ใหม่
- `edit_assets` - แก้ไขอุปกรณ์
- `delete_assets` - ลบอุปกรณ์

## 6. Best Practices

1. **ใช้ Directive ใน Template**: สำหรับซ่อน/แสดง element
2. **ใช้ Service ใน Component**: สำหรับ logic ที่ซับซ้อน
3. **ใช้ Guard ใน Routes**: สำหรับป้องกันการเข้าถึงหน้า
4. **ตั้งชื่อ permission ให้สื่อความหมาย**: `{action}_{module}` เช่น `create_plan`, `edit_assets`
5. **ตรวจสอบสิทธิ์ทั้งใน Frontend และ Backend**: Frontend เพื่อ UX, Backend เพื่อความปลอดภัย

## 7. Troubleshooting

### Element ไม่หาย แม้ไม่มีสิทธิ์
- ตรวจสอบว่า import `HasPermissionDirective` แล้ว
- ตรวจสอบว่า user มี role และ permissions ใน Auth.user

### Route Guard ไม่ทำงาน
- ตรวจสอบว่าเพิ่ม `canActivate: [PermissionGuard]` ใน route
- ตรวจสอบว่ามี `data: { permission: 'xxx' }` ใน route

### Permission ไม่อัพเดท
- Permission จะอัพเดทอัตโนมัติเมื่อ Auth.user เปลี่ยน
- ลอง refresh หน้าเว็บ

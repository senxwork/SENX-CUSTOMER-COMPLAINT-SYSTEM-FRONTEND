import { Routes } from '@angular/router';
import { PermissionGuard } from '../../shared/guards/permission.guard';

export const pages: Routes = [
  {
    path: '',
    children: [
     /*  // Dashboard (ไม่ใส่ guard - เป็นหน้า default redirect)
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
        data: { title: 'แดชบอร์ด', breadcrumb: 'แดชบอร์ด' }
      },
 */
      // Complaint
      {
        path: 'complaint/list',
        loadComponent: () => import('./complaint/complaint-list/complaint-list').then(m => m.ComplaintListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'รายการเรื่องร้องเรียน', breadcrumb: 'รายการเรื่องร้องเรียน', permission: 'view_complaint' }
      },
      {
        path: 'complaint/create',
        loadComponent: () => import('./complaint/complaint-create/complaint-create').then(m => m.ComplaintCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'สร้างเรื่องร้องเรียน', breadcrumb: 'สร้างเรื่องร้องเรียน', permission: 'create_complaint' }
      },
      {
        path: 'complaint/view/:complaint_id',
        loadComponent: () => import('./complaint/complaint-view/complaint-view').then(m => m.ComplaintViewComponent),
        canActivate: [PermissionGuard],
        data: { title: 'รายละเอียด', breadcrumb: 'รายละเอียด', permission: 'view_complaint' }
      },
      {
        path: 'complaint/edit/:complaint_id',
        loadComponent: () => import('./complaint/complaint-edit/complaint-edit').then(m => m.ComplaintEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไข', breadcrumb: 'แก้ไข', permission: 'edit_complaint' }
      },
      {
        path: 'complaint/my-work',
        loadComponent: () => import('./complaint/my-work/my-work').then(m => m.MyWorkComponent),
        canActivate: [PermissionGuard],
        data: { title: 'งานที่ได้รับมอมหมายของหน่วยงานฉัน', breadcrumb: 'งานที่ได้รับมอมหมายของหน่วยงานฉัน', permission: 'view_complaint' }
      },
      {
        path: 'complaint/work-of-me',
        loadComponent: () => import('./complaint/work-of-me/work-of-me').then(m => m.WorkOfMeComponent),
        canActivate: [PermissionGuard],
        data: { title: 'งานที่ฉันสร้าง', breadcrumb: 'งานที่ฉันสร้าง', permission: 'view_complaint' }
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./reports/report/report').then(m => m.ReportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'รายงาน', breadcrumb: 'รายงาน', permission: 'view_report' }
      },

      // Settings - Business Unit
      {
        path: 'settings/business-unit',
        loadComponent: () => import('./settings/business-unit/business-unit-list/business-unit-list').then(m => m.BusinessUnitListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการ Business Unit', breadcrumb: 'Business Unit', permission: 'view_businessunit' }
      },
      {
        path: 'settings/business-unit/create',
        loadComponent: () => import('./settings/business-unit/business-unit-create/business-unit-create').then(m => m.BusinessUnitCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่ม Business Unit', breadcrumb: 'เพิ่ม Business Unit', permission: 'create_businessunit' }
      },
      {
        path: 'settings/business-unit/edit/:id',
        loadComponent: () => import('./settings/business-unit/business-unit-edit/business-unit-edit').then(m => m.BusinessUnitEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไข Business Unit', breadcrumb: 'แก้ไข Business Unit', permission: 'edit_businessunit' }
      },

      // Settings - Contact Channel
      {
        path: 'settings/contact-channel',
        loadComponent: () => import('./settings/contact-channel/contact-channel-list/contact-channel-list').then(m => m.ContactChannelListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการช่องทางติดต่อ', breadcrumb: 'ช่องทางติดต่อ', permission: 'view_contact_channel' }
      },
      {
        path: 'settings/contact-channel/create',
        loadComponent: () => import('./settings/contact-channel/contact-channel-create/contact-channel-create').then(m => m.ContactChannelCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มช่องทางติดต่อ', breadcrumb: 'เพิ่มช่องทางติดต่อ', permission: 'create_contact_channel' }
      },
      {
        path: 'settings/contact-channel/edit/:id',
        loadComponent: () => import('./settings/contact-channel/contact-channel-edit/contact-channel-edit').then(m => m.ContactChannelEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขช่องทางติดต่อ', breadcrumb: 'แก้ไขช่องทางติดต่อ', permission: 'edit_contact_channel' }
      },

      // Settings - Job Category
      {
        path: 'settings/job-category',
        loadComponent: () => import('./settings/job-category/job-category-list/job-category-list').then(m => m.JobCategoryListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการประเภทงาน', breadcrumb: 'ประเภทงาน', permission: 'view_jobcatagory' }
      },
      {
        path: 'settings/job-category/create',
        loadComponent: () => import('./settings/job-category/job-category-create/job-category-create').then(m => m.JobCategoryCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มประเภทงาน', breadcrumb: 'เพิ่มประเภทงาน', permission: 'create_jobcatagory' }
      },
      {
        path: 'settings/job-category/edit/:id',
        loadComponent: () => import('./settings/job-category/job-category-edit/job-category-edit').then(m => m.JobCategoryEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขประเภทงาน', breadcrumb: 'แก้ไขประเภทงาน', permission: 'edit_jobcatagory' }
      },

      // Settings - OM List (หน่วยงาน)
      {
        path: 'settings/om-list',
        loadComponent: () => import('./settings/om-list/om-list-component/om-list').then(m => m.OmListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการหน่วยงาน', breadcrumb: 'หน่วยงาน', permission: 'view_om_list' }
      },
      {
        path: 'settings/om-list/create',
        loadComponent: () => import('./settings/om-list/om-create/om-create').then(m => m.OmCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มหน่วยงาน', breadcrumb: 'เพิ่มหน่วยงาน', permission: 'create_om_list' }
      },
      {
        path: 'settings/om-list/edit/:id',
        loadComponent: () => import('./settings/om-list/om-edit/om-edit').then(m => m.OmEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขหน่วยงาน', breadcrumb: 'แก้ไขหน่วยงาน', permission: 'edit_om_list' }
      },

      // Settings - Department List (แผนก)
      {
        path: 'settings/department-list',
        loadComponent: () => import('./settings/department-list/department-list-component/department-list').then(m => m.DepartmentListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการหน่วยงาน', breadcrumb: 'หน่วยงาน', permission: 'view_department' }
      },
      {
        path: 'settings/department-list/create',
        loadComponent: () => import('./settings/department-list/department-create/department-create').then(m => m.DepartmentCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มหน่วยงาน', breadcrumb: 'เพิ่มหน่วยงาน', permission: 'create_department' }
      },
      {
        path: 'settings/department-list/edit/:id',
        loadComponent: () => import('./settings/department-list/department-edit/department-edit').then(m => m.DepartmentEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขหน่วยงาน', breadcrumb: 'แก้ไขหน่วยงาน', permission: 'edit_department' }
      },

      // User Profile (ไม่ใส่ guard - ทุกคนเข้าถึงโปรไฟล์ตัวเองได้)
      {
        path: 'user-profile',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfile),
        data: { title: 'โปรไฟล์ผู้ใช้', breadcrumb: 'โปรไฟล์ผู้ใช้' }
      },

      // Settings - User Management
      {
        path: 'settings/user-list',
        loadComponent: () => import('./settings/user-list/user-list').then(m => m.UserListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการผู้ใช้', breadcrumb: 'จัดการผู้ใช้', permission: 'view_users' }
      },
      {
        path: 'settings/create-user',
        loadComponent: () => import('./settings/user-create/user-create').then(m => m.UserCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มผู้ใช้งาน', breadcrumb: 'เพิ่มผู้ใช้งาน', permission: 'create_users' }
      },
      {
        path: 'settings/edit-user/:id',
        loadComponent: () => import('./settings/user-edit/user-edit').then(m => m.UserEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขข้อมูลผู้ใช้งาน', breadcrumb: 'แก้ไขข้อมูลผู้ใช้งาน', permission: 'edit_users' }
      },
      {
        path: 'settings/permission',
        loadComponent: () => import('./settings/permission/permission').then(m => m.PermissionComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการสิทธิ์การเข้าใช้งาน', breadcrumb: 'จัดการสิทธิ์', permission: 'view_roles' }
      },
      {
        path: 'settings/project-list',
        loadComponent: () => import('./settings/project-list/project-list').then(m => m.ProjectListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการโครงการ', breadcrumb: 'จัดการโครงการ', permission: 'view_project' }
      },
      {
        path: 'settings/project-create',
        loadComponent: () => import('./settings/project-create/project-create').then(m => m.ProjectCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'สร้างโครงการใหม่', breadcrumb: 'สร้างโครงการใหม่', permission: 'create_project' }
      },
      {
        path: 'settings/project-edit/:id',
        loadComponent: () => import('./settings/project-edit/project-edit').then(m => m.ProjectEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขโครงการ', breadcrumb: 'แก้ไขโครงการ', permission: 'edit_project' }
      },

      // Settings - Tag
      {
        path: 'settings/tag',
        loadComponent: () => import('./settings/tag/tag-list/tag-list').then(m => m.TagListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการ Tag', breadcrumb: 'Tag', permission: 'view_tag' }
      },
      {
        path: 'settings/tag/create',
        loadComponent: () => import('./settings/tag/tag-create/tag-create').then(m => m.TagCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่ม Tag', breadcrumb: 'เพิ่ม Tag', permission: 'create_tag' }
      },
      {
        path: 'settings/tag/edit/:id',
        loadComponent: () => import('./settings/tag/tag-edit/tag-edit').then(m => m.TagEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไข Tag', breadcrumb: 'แก้ไข Tag', permission: 'edit_tag' }
      },

      // Settings - Ticket Category
      {
        path: 'settings/ticket-category',
        loadComponent: () => import('./settings/ticket-category/ticket-category-list/ticket-category-list').then(m => m.TicketCategoryListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการหมวดหมู่ Ticket', breadcrumb: 'หมวดหมู่ Ticket', permission: 'view_ticket_category' }
      },
      {
        path: 'settings/ticket-category/create',
        loadComponent: () => import('./settings/ticket-category/ticket-category-create/ticket-category-create').then(m => m.TicketCategoryCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มหมวดหมู่ Ticket', breadcrumb: 'เพิ่มหมวดหมู่ Ticket', permission: 'create_ticket_category' }
      },
      {
        path: 'settings/ticket-category/edit/:id',
        loadComponent: () => import('./settings/ticket-category/ticket-category-edit/ticket-category-edit').then(m => m.TicketCategoryEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขหมวดหมู่ Ticket', breadcrumb: 'แก้ไขหมวดหมู่ Ticket', permission: 'edit_ticket_category' }
      },

      // Settings - System Settings
      {
        path: 'settings/system-settings',
        loadComponent: () => import('./settings/system-settings/system-settings').then(m => m.SystemSettingsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'ตั้งค่าระบบ', breadcrumb: 'ตั้งค่าระบบ', permission: 'view_system_settings' }
      },

      // Settings - Ticket Sub Category
      {
        path: 'settings/ticket-sub-category',
        loadComponent: () => import('./settings/ticket-sub-category/ticket-sub-category-list/ticket-sub-category-list').then(m => m.TicketSubCategoryListComponent),
        canActivate: [PermissionGuard],
        data: { title: 'จัดการประเภทเรื่อง Ticket', breadcrumb: 'ประเภทเรื่อง Ticket', permission: 'view_ticket_sub_category' }
      },
      {
        path: 'settings/ticket-sub-category/create',
        loadComponent: () => import('./settings/ticket-sub-category/ticket-sub-category-create/ticket-sub-category-create').then(m => m.TicketSubCategoryCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'เพิ่มประเภทเรื่อง Ticket', breadcrumb: 'เพิ่มประเภทเรื่อง Ticket', permission: 'create_ticket_sub_category' }
      },
      {
        path: 'settings/ticket-sub-category/edit/:id',
        loadComponent: () => import('./settings/ticket-sub-category/ticket-sub-category-edit/ticket-sub-category-edit').then(m => m.TicketSubCategoryEditComponent),
        canActivate: [PermissionGuard],
        data: { title: 'แก้ไขประเภทเรื่อง Ticket', breadcrumb: 'แก้ไขประเภทเรื่อง Ticket', permission: 'edit_ticket_sub_category' }
      }
    ]
  }
];

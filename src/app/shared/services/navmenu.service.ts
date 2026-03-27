import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

export interface Menu {
  headTitle1?: string;
  level?: number;
  badge?: boolean;
  path?: string;
  des?: boolean;
  color?: string;
  line?: boolean;
  title?: string;
  icon?: string;
  type?: string;
  active?: boolean;
  id?: number;
  bookmark?: boolean;
  children?: Menu[];
  horizontalList?: boolean;
  items?: Menu[];
  permission?: string | string[];
}

@Injectable({
  providedIn: "root",
})
export class NavmenuService {
  public language: boolean = false;
  public isShow: boolean = false;
  public closeSidebar: boolean = false;
  public fullScreen: boolean;

  MENUITEMS: Menu[] = [
    {
      headTitle1: "CUSTOMER COMPLAINT SYSTEM ",
    },
    /* {
      id: 1,
      level: 1,
      path: "/pages/dashboard",
      title: "แดชบอร์ด",
      icon: "home",
      active: true,
      type: "link",
    }, */
    {
      id: 2,
      level: 1,
      path: "/pages/complaint/list",
      title: "รายการเรื่องร้องเรียนทั้งหมด",
      icon: "file-text",
      active: false,
      type: "link",
      permission: "view_complaint",
    },

    {
      id: 4,
      level: 1,
      path: "/pages/complaint/my-work",
      title: "งานที่ได้รับมอมหมายของหน่วยงานฉัน",
      icon: "briefcase",
      active: false,
      type: "link",
      permission: "view_complaint",
    },
    {
      id: 5,
      level: 1,
      path: "/pages/complaint/work-of-me",
      title: "งานที่ฉันสร้าง",
      icon: "clipboard",
      active: false,
      type: "link",
      permission: "view_complaint",
    },
    {
      id: 6,
      level: 1,
      path: "/pages/reports",
      title: "รายงาน",
      icon: "bar-chart-2",
      active: false,
      type: "link",
      permission: "view_report",
    },
    {
      id: 7,
      level: 1,
      title: "จัดการข้อมูลหลัก",
      icon: "database",
      type: "sub",
      active: false,
      children: [
        { path: "/pages/settings/project-list", title: "จัดการโครงการ", type: "link", permission: "view_project" },
        { path: "/pages/settings/business-unit", title: "จัดการ Business Unit", type: "link", permission: "view_businessunit" },
        { path: "/pages/settings/contact-channel", title: "จัดการช่องทางติดต่อ", type: "link", permission: "view_contact_channel" },
        /*  { path: "/pages/settings/job-category", title: "จัดการประเภทงาน", type: "link", permission: "view_jobcatagory" }, */
        { path: "/pages/settings/tag", title: "จัดการ Tag", type: "link", permission: "view_tag" },
        { path: "/pages/settings/ticket-category", title: "หมวดหมู่ Ticket", type: "link", permission: "view_ticket_category" },
        { path: "/pages/settings/ticket-sub-category", title: "จัดการประเภทเรื่อง Ticket", type: "link", permission: "view_ticket_sub_category" },
        { path: "/pages/settings/om-list", title: "จัดการหน่วยงาน", type: "link", permission: "view_om_list" },
        { path: "/pages/settings/department-list", title: "จัดการหน่วยงาน", type: "link", permission: "view_department" },
      ],
    },
    {
      id: 8,
      level: 1,
      title: "ตั้งค่าระบบ",
      icon: "settings",
      type: "sub",
      active: false,
      children: [
        { path: "/pages/settings/user-list", title: "จัดการผู้ใช้", type: "link", permission: "view_users" },
        { path: "/pages/settings/permission", title: "จัดการสิทธิ์", type: "link", permission: "view_roles" },
        { path: "/pages/settings/system-settings", title: "ตั้งค่าระบบ", type: "link", permission: "view_system_settings" },
      ],
    },
  ];

  item = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}

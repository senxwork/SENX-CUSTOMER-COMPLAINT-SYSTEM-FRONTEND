import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { ActivityLogService } from '../../../services/activity-log.service';
import { Auth } from '../../../../classes/auth';

@Component({
  selector: 'app-notification',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification implements OnInit, OnDestroy {
  isOpen = false;
  logs: any[] = [];
  unreadCount = 0;
  loading = false;

  private pollingTimer: any;
  private subs: Subscription[] = [];
  private userId: string = '';
  private departmentId: string = '';

  constructor(
    private activityLogService: ActivityLogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initUser();
    this.subs.push(Auth.userEmitter.subscribe(() => this.initUser()));

    // Refresh เมื่อมี event จาก ActivityLogService.triggerRefresh()
    this.subs.push(
      ActivityLogService.refresh$.subscribe(() => this.fetchUnreadCount()),
    );

    // Refresh เมื่อ navigate ไปหน้าอื่น
    this.subs.push(
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
      ).subscribe(() => this.fetchUnreadCount()),
    );
  }

  private initUser(): void {
    const user = Auth.user as any;
    console.log('[Notification] initUser:', { user_id: user?.user_id, department: user?.department });
    if (user?.user_id && user?.department) {
      this.userId = user.user_id;
      this.departmentId = user.department;
      this.fetchUnreadCount();
      this.startPolling();
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollingTimer = setInterval(() => this.fetchUnreadCount(), 60000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private fetchUnreadCount(): void {
    if (!this.departmentId || !this.userId) return;
    console.log('[Notification] fetchUnreadCount:', { departmentId: this.departmentId, userId: this.userId });
    this.activityLogService.getUnreadCount(this.departmentId, this.userId).subscribe({
      next: (res) => {
        console.log('[Notification] unreadCount result:', res);
        this.unreadCount = res.count;
      },
      error: (err) => console.error('[Notification] unreadCount error:', err),
    });
  }

  openNotifications(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  private loadNotifications(): void {
    if (!this.departmentId || !this.userId) return;
    this.loading = true;
    this.activityLogService.getNotifications(this.departmentId, this.userId).subscribe({
      next: (data) => {
        console.log('[Notification] getNotifications result:', data);
        this.logs = data.map((log: any) => {
          const config = this.getActionTypeConfig(log.action_type);
          return {
            ...log,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            label: config.label,
            dateDisplay: this.formatDate(log.created_at),
            timeAgo: this.getTimeAgo(log.created_at),
          };
        });
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onNotificationClick(log: any): void {
    if (!log.is_read) {
      this.activityLogService.markAsRead(this.userId, [log.id]).subscribe({
        next: () => {
          log.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
      });
    }
    this.isOpen = false;
    const complaintId = log.nav_complaint_id || log.complaint_id;
    if (complaintId) {
      const queryParams: any = {};
      if (log.nav_sub_task_id) {
        queryParams.ticket = log.nav_sub_task_id;
        queryParams.t = Date.now(); // Force queryParams change for same ticket
      }
      this.router.navigate(['/pages/complaint/view', complaintId], { queryParams });
    }
  }

  markAllRead(): void {
    if (this.unreadCount === 0) return;
    this.activityLogService.markAllAsRead(this.userId, this.departmentId).subscribe({
      next: () => {
        this.unreadCount = 0;
        this.logs.forEach((l) => l.is_read = true);
      },
    });
  }

  clickOutside(): void {
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.subs.forEach((s) => s.unsubscribe());
  }

  private getActionTypeConfig(actionType: string): { icon: string; color: string; bgColor: string; label: string } {
    const configs: { [key: string]: { icon: string; color: string; bgColor: string; label: string } } = {
      CREATE_CASE: { icon: 'fa-plus-circle', color: '#10b981', bgColor: '#d1fae5', label: 'สร้าง Case' },
      CREATE_CASE_EXTERNAL: { icon: 'fa-external-link', color: '#10b981', bgColor: '#d1fae5', label: 'สร้าง Case (API)' },
      UPDATE_CASE_STATUS: { icon: 'fa-refresh', color: '#3b82f6', bgColor: '#dbeafe', label: 'เปลี่ยนสถานะ Case' },
      ASSIGN_OM: { icon: 'fa-user-plus', color: '#6366f1', bgColor: '#e0e7ff', label: 'มอบหมาย OM' },
      UPDATE_CASE_INFO: { icon: 'fa-edit', color: '#3b82f6', bgColor: '#dbeafe', label: 'แก้ไขข้อมูล Case' },
      ASSIGN_WORK: { icon: 'fa-users', color: '#6366f1', bgColor: '#e0e7ff', label: 'มอบหมายงาน' },
      UPDATE_CASE: { icon: 'fa-pencil', color: '#3b82f6', bgColor: '#dbeafe', label: 'อัพเดท Case' },
      AI_GENERATE_TICKETS: { icon: 'fa-magic', color: '#8b5cf6', bgColor: '#ede9fe', label: 'AI สร้าง Ticket' },
      CREATE_TICKET: { icon: 'fa-ticket', color: '#10b981', bgColor: '#d1fae5', label: 'สร้าง Ticket' },
      ASSIGN_DEPARTMENT: { icon: 'fa-building-o', color: '#f59e0b', bgColor: '#fef3c7', label: 'มอบหมายหน่วยงาน' },
      UPDATE_TICKET_CATEGORY: { icon: 'fa-folder-o', color: '#3b82f6', bgColor: '#dbeafe', label: 'เปลี่ยนหมวดหมู่' },
      UPDATE_TICKET_SUB_CATEGORY: { icon: 'fa-file-text-o', color: '#3b82f6', bgColor: '#dbeafe', label: 'เปลี่ยนประเภทเรื่อง' },
      UPDATE_TICKET_STATUS: { icon: 'fa-refresh', color: '#eab308', bgColor: '#fef9c3', label: 'เปลี่ยนสถานะ Ticket' },
      UPDATE_TICKET: { icon: 'fa-pencil', color: '#3b82f6', bgColor: '#dbeafe', label: 'อัพเดท Ticket' },
      DELETE_TICKET: { icon: 'fa-trash', color: '#ef4444', bgColor: '#fee2e2', label: 'ลบ Ticket' },
      ADD_TICKET_COMMENT: { icon: 'fa-comment-o', color: '#8b5cf6', bgColor: '#ede9fe', label: 'บันทึก Ticket' },
      ADD_CASE_COMMENT: { icon: 'fa-comment', color: '#3b82f6', bgColor: '#dbeafe', label: 'ความคิดเห็น Case' },
      PUBLIC_ADD_COMMENT: { icon: 'fa-external-link', color: '#f59e0b', bgColor: '#fef3c7', label: 'บันทึกจากภายนอก' },
      PUBLIC_UPDATE_STATUS: { icon: 'fa-external-link', color: '#f59e0b', bgColor: '#fef3c7', label: 'เปลี่ยนสถานะ (ภายนอก)' },
    };
    return configs[actionType] || { icon: 'fa-circle', color: '#6b7280', bgColor: '#f3f4f6', label: actionType };
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'เมื่อสักครู่';
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    if (diffDay === 1) return 'เมื่อวาน';
    if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
    return this.formatDate(dateStr);
  }
}

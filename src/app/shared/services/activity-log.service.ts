import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private static _refresh$ = new Subject<void>();
  static get refresh$() { return this._refresh$; }

  static triggerRefresh(): void {
    this._refresh$.next();
  }

  constructor(private http: HttpClient) {}

  getByComplaint(complaintId: string, subTaskIds: string[] = []): Observable<any> {
    let url = `${environment.api}/activity-log/by-complaint/${complaintId}`;
    if (subTaskIds.length > 0) {
      url += `?subTaskIds=${subTaskIds.join(',')}`;
    }
    return this.http.get(url);
  }

  getNotifications(departmentId: string, userId: string, limit = 30): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.api}/activity-log/notifications/${departmentId}?userId=${userId}&limit=${limit}`
    );
  }

  getUnreadCount(departmentId: string, userId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${environment.api}/activity-log/notifications/${departmentId}/unread-count?userId=${userId}`
    );
  }

  getTicketUnreadMap(departmentId: string, ticketIds: string[]): Observable<Record<string, number>> {
    if (!ticketIds.length || !departmentId) return new Observable(obs => { obs.next({}); obs.complete(); });
    return this.http.get<Record<string, number>>(
      `${environment.api}/activity-log/ticket-unread-map?departmentId=${departmentId}&ticketIds=${ticketIds.join(',')}`
    );
  }

  markTicketAsRead(departmentId: string, ticketId: string, userId?: string): Observable<any> {
    return this.http.post(`${environment.api}/activity-log/notifications/mark-ticket-read`, {
      departmentId, ticketId, userId
    });
  }

  markAsRead(userId: string, activityLogIds: string[]): Observable<any> {
    return this.http.post(`${environment.api}/activity-log/notifications/mark-read`, {
      userId, activityLogIds
    });
  }

  markAllAsRead(userId: string, departmentId: string): Observable<any> {
    return this.http.post(`${environment.api}/activity-log/notifications/mark-all-read`, {
      userId, departmentId
    });
  }
}

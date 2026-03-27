import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';
import { ActivityLogService } from './activity-log.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService extends RestService {
  endpoint = `${environment.api}/complaint-list`;

  createComplaint(data: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-list/create`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  getById(complaint_id: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-list/${complaint_id}`);
  }

  getByDepartment(data: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-list/department`, data);
  }

  getList(page: number, filterData: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-list?page=${page}`, filterData);
  }

  getReport(page: number, filterData: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-list/get-report?page=${page}`, filterData);
  }

  updateStatus(complaint_id: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-list/update-status/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateOM(complaint_id: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-list/update-om/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateCat(complaint_id: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-list/update-cat/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  assignWork(complaint_id: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-list/assign-work/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateComplaint(complaint_id: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-list/update/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  getUserByDepartment(data: any): Observable<any> {
    return this.http.post(`${environment.api}/users/filter-department`, data);
  }

  uploadAttachFile(complaint_id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.api}/complaint-attachedfile/file/${complaint_id}`, formData);
  }

  getAttachFile(imgpath: string): string {
    return `${environment.api}/complaint-attachedfile/file/${imgpath}`;
  }

  getChildren(complaint_id: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-list/children/${complaint_id}`);
  }

  aiGenerate(complaintId: string, caseNumber: string, jobDetail: string): Observable<any> {
    return this.http.post(`${environment.api}/complaint-sub-task/ai-generate`, {
      complaint_id: complaintId,
      case_number: caseNumber,
      job_detail: jobDetail
    }).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  // Sub-task methods
  getSubTask(subTaskId: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-sub-task/${subTaskId}`);
  }

  getSubTasksByParent(parentId: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-sub-task/by-parent/${parentId}`);
  }

  createSubTask(data: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-sub-task`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateSubTask(subTaskId: string, data: any): Observable<any> {
    return this.http.put(`${environment.api}/complaint-sub-task/${subTaskId}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateSubTaskDepartment(subTaskId: string, departmentId: string, performedBy?: string): Observable<any> {
    return this.http.put(`${environment.api}/complaint-sub-task/update-department/${subTaskId}`, { department_id: departmentId, performed_by: performedBy }).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateSubTaskCategory(subTaskId: string, categoryId: string | null, performedBy?: string): Observable<any> {
    return this.http.put(`${environment.api}/complaint-sub-task/update-category/${subTaskId}`, { ticket_category_id: categoryId, performed_by: performedBy }).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateSubTaskSubCategory(subTaskId: string, subCategoryId: string | null, performedBy?: string): Observable<any> {
    return this.http.put(`${environment.api}/complaint-sub-task/update-sub-category/${subTaskId}`, { ticket_sub_category_id: subCategoryId, performed_by: performedBy }).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  updateSubTaskExpense(subTaskId: string, data: { expense_amount: number; expense_description?: string; performed_by?: string }): Observable<any> {
    return this.http.put(`${environment.api}/complaint-sub-task/update-expense/${subTaskId}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  // Sub-task transaction methods (separate endpoint)
  createSubTaskTransaction(subTaskId: string, data: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-sub-task-transaction/create/${subTaskId}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  getSubTaskTransactions(subTaskId: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-sub-task-transaction/by-sub-task/${subTaskId}`);
  }

  // Sub-task transaction file methods
  uploadSubTaskTransactionFile(transactionId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.api}/complaint-sub-task-transection-file/file/${transactionId}`, formData);
  }

  getSubTaskTransactionFile(filename: string): string {
    return `${environment.api}/complaint-sub-task-transection-file/file/${filename}`;
  }

  // Repair request detail (proxy through backend)
  getRepairRequestDetail(ticketId: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-sub-task/${ticketId}/repair-request-detail`);
  }

  // Get complaints where any sub-task is assigned to the given department
  getBySubTaskDepartment(departmentId: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-list/by-subtask-department/${departmentId}`);
  }

  // Get all complaints with sub-task summary (optimized endpoint)
  getAllWithSubTasks(): Observable<any> {
    return this.http.get(`${environment.api}/complaint-list/with-subtasks`);
  }
}

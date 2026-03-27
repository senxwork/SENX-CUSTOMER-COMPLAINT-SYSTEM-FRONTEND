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
export class ComplaintTransactionService extends RestService {
  endpoint = `${environment.api}/complaint-transaction`;

  createTransaction(complaint_id: string, data: any): Observable<any> {
    return this.http.post(`${environment.api}/complaint-transaction/create/${complaint_id}`, data).pipe(tap(() => ActivityLogService.triggerRefresh()));
  }

  getByComplaintId(complaint_id: string): Observable<any> {
    return this.http.get(`${environment.api}/complaint-transaction/${complaint_id}`);
  }

  uploadAttachFile(transaction_id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.api}/complaint-transaction-attachedfile/file/${transaction_id}`, formData);
  }

  getAttachFile(imgpath: string): string {
    return `${environment.api}/complaint-transaction-attachedfile/file/${imgpath}`;
  }
}

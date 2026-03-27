import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PublicTicketService {
  private http: HttpClient;

  constructor(handler: HttpBackend) {
    // Create HttpClient without interceptors (no auth token needed)
    this.http = new HttpClient(handler);
  }

  getByToken(token: string): Observable<any> {
    return this.http.get(`${environment.api}/public/ticket/${token}`);
  }

  addComment(token: string, transactionDetail: string): Observable<any> {
    return this.http.post(`${environment.api}/public/ticket/${token}/comment`, {
      transaction_detail: transactionDetail,
    });
  }

  updateStatus(token: string, status: string): Observable<any> {
    return this.http.put(`${environment.api}/public/ticket/${token}/status`, {
      status,
    });
  }

  uploadFiles(transactionId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }
    return this.http.post(
      `${environment.api}/complaint-sub-task-transection-file/file/${transactionId}`,
      formData,
    );
  }
}

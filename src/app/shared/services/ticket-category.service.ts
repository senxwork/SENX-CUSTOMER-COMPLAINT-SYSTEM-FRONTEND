import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class TicketCategoryService extends RestService {
  endpoint = `${environment.api}/ticket-category`;

  getAll(): Observable<any> {
    return this.http.get(this.endpoint);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.endpoint}/${id}`);
  }

  override create(data: any): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  override update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, data);
  }

  override delete(id: string): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}

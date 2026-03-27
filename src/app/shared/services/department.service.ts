import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends RestService {
  endpoint = `${environment.api}/departments`;

  getAll(): Observable<any> {
    return this.http.get(this.endpoint);
  }

  getFilter(page: number, filterData?: any): Observable<any> {
    return this.http.post(`${this.endpoint}/filter?page=${page}`, filterData || {});
  }

  getList(page: number, filterData?: any): Observable<any> {
    return this.http.post(`${this.endpoint}/list?page=${page}`, filterData || {});
  }

  createDepartment(data: any): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  editDepartment(id: string, data: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, data);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}

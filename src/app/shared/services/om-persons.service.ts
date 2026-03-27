import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class OmPersonsService extends RestService {
  endpoint = `${environment.api}/om-persons`;

  getAll(): Observable<any> {
    return this.http.get(this.endpoint);
  }

  getFilter(page: number, filterData?: any): Observable<any> {
    return this.http.post(`${this.endpoint}/filter?page=${page}`, filterData || {});
  }

  getList(page: number, filterData?: any): Observable<any> {
    return this.http.post(`${this.endpoint}/list?page=${page}`, filterData || {});
  }

  createOmPerson(data: any): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  editOmPerson(id: string, data: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, data);
  }

  deleteOmPerson(id: string): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}

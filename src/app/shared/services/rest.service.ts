import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export abstract class RestService {

  abstract get endpoint(): string;

  constructor(protected http: HttpClient) {
  }

  all(page?: number): Observable<any> {
    let url = this.endpoint;

    if (page) {
      url += `?page=${page}`;
    }

    return this.http.get(url);
  }

  create(data:any): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  get(id: number | string): Observable<any> {
    return this.http.get(`${this.endpoint}/${id}`);
  }

  update(user_id: any, data:any): Observable<any> {
    return this.http.put(`${this.endpoint}/${user_id}`, data);
  }



  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}

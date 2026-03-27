import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private endpoint = `${environment.api}/system-settings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.endpoint);
  }

  get(key: string): Observable<any> {
    return this.http.get(`${this.endpoint}/${key}`);
  }

  set(key: string, value: string, description?: string): Observable<any> {
    return this.http.put(this.endpoint, { key, value, description });
  }
}

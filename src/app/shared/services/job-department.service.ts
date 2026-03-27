import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class JobDepartmentService extends RestService {
  endpoint = `${environment.api}/job-department`;

  getAll(): Observable<any> {
    return this.http.get(this.endpoint);
  }

  getJobCategory(job_departments_id: string): Observable<any> {
    return this.http.get(`${environment.api}/followup-job-catagory/${job_departments_id}`);
  }
}

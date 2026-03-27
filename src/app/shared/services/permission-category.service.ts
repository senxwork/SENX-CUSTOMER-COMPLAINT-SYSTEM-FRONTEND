import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionCategoryService extends RestService {
  endpoint = `${environment.api}/permission-category`;
}

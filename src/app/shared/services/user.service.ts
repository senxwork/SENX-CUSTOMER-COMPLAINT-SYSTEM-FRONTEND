import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { RestService } from "./rest.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService extends RestService {
  userItemData: any;
  userItemDataOfProject: any;
  endpoint = `${environment.api}/users`;
  endpointProfileImage = `${environment.api}/users/file/`;
  endpointSignature_imageImage = `${environment.api}/users/signature/file/`;
  sendDataOfUserItem(userItemData: any) {
    this.userItemData = userItemData;
  }
  sendDataOfUserOfProjectItem(userItemDataOfProject: any) {
    this.userItemDataOfProject = userItemDataOfProject;
  }
  reciveDataOfProjectUserItem() {
    return this.userItemDataOfProject;
  }

  updateActivateLine(userId: string, lineId: any): Observable<any> {
    return this.http.put<any>(
      `${environment.api}/users/line/${userId}`,
      lineId
    );
  }

  deactivateLine(userId: string): Observable<any> {
    return this.http.put<any>(
      `${environment.api}/users/deactivateline/${userId}`,
      {}
    );
  }

  checkLineConnection(lineUserId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/users/line/check/${lineUserId}`
    );
  }

  reciveDataOfUserItem() {
    return this.userItemData;
  }
  uploadImageFileProfile(user_id: string, data: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", data);
    return this.http.put<any>(
      `${environment.api}/users/file/${user_id}`,
      formData,
      {
        reportProgress: true,
        responseType: "json",
      }
    );
  }

  uploadSignatureImage(user_id: string, data: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", data);
    return this.http.put<any>(
      `${environment.api}/users/signature/file/${user_id}`,
      formData,
      {
        reportProgress: true,
        responseType: "json",
      }
    );
  }

  getUser(page: any, filterData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.api}/users/list?page=${page}`,
      filterData
    );
  }

  getUserByFilterData(page: any, filterData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.api}/users/list?page=${page}`,
      filterData
    );
  }

  getUserByProject(page: any, filterData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.api}/users/user-project?page=${page}`,
      filterData
    );
  }

   getUserList(): Observable<any> {
    return this.http.get<any>(
      `${environment.api}/users/userlist`
    
    );
  }
}

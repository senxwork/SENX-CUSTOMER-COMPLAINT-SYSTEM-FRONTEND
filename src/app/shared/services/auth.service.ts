import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { User } from "../../interfaces/user";



@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(protected http: HttpClient) {}

  login(data:any): Observable<any> {
    return this.http.post(`${environment.api}/login`, data, { withCredentials: true });
  }

  register(data:any): Observable<User> {
    return this.http.post<User>(`${environment.api}/register`, data);
  }
    registerUser(data:any): Observable<User> {
    return this.http.post<User>(`${environment.api}/register-user`, data);
  }

  user(): Observable<User> {
    return this.http.get<User>(`${environment.api}/user`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.api}/logout`, {});
  }

  updateInfo(data:any): Observable<User> {
    return this.http.put<User>(`${environment.api}/users/info`, data);
  }
  editUser(data:any): Observable<User> {
    return this.http.put<User>(`${environment.api}/users/edit`, data);
  }

  updatePassword(data:any): Observable<User> {
    return this.http.put<User>(`${environment.api}/users/password`, data);
  }

  changePassword(user_id:any, data:any): Observable<any> {
    return this.http.put<any>(`${environment.api}/users/change-password/${user_id}`, data);
  }

   forgotPassword(email:any): Observable<any> {
    return this.http.post<any>(`${environment.api}/users/forgot-password`, email);
  }
   resetPassword(token:any,email:any): Observable<any> {
    return this.http.put<any>(`${environment.api}/users/reset-password/${token}`, email);
  }
}

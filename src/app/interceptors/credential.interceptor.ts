import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable()
export class CredentialInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // ตรวจสอบว่าเป็น FormData (file upload) หรือไม่
    const isFormData = request.body instanceof FormData;

    // ถ้าเป็น FormData ห้ามตั้ง Content-Type (ให้ browser ตั้งเองพร้อม boundary)
    const headers: any = {
      apiKey: `${environment.apiKey}`,
    };

    // ถ้าไม่ใช่ FormData ให้ตั้ง Content-Type เป็น application/json
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const req = request.clone({
      withCredentials: true,
      setHeaders: headers
    });

    return next.handle(req);
  }
}



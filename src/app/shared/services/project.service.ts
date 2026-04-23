import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface ProjectItem {
  id: string;
  project_id: string;
  project_name_en: string;
  project_name_th: string;
  project_logo_image?: string;
  project_status: boolean;
  project_email?: string;
  project_type?: string;
  is_managed?: boolean;
  is_sena?: boolean;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  data: ProjectItem[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private apiUrl = environment.api;
  endpointProjectLogo = `${environment.api}/project/file/`;
  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<ApiResponse<ProjectItem[]>> {
    return this.http.get<ApiResponse<ProjectItem[]>>(`${this.apiUrl}/project`);
  }

  getProjectsByFilterData(page: any, filterData: any): Observable<any> {
    return this.http.post<any>(`${environment.api}/project/list?page=${page}`, filterData);
  }
  getProjectById(projectId: string): Observable<ProjectItem> {
    return this.http.get<ProjectItem>(`${this.apiUrl}/project/${projectId}`);
  }

  createProject(project: Partial<ProjectItem>): Observable<ApiResponse<ProjectItem>> {
    return this.http.post<ApiResponse<ProjectItem>>(`${this.apiUrl}/project/create`, project);
  }

  updateProject(projectId: string, project: Partial<ProjectItem>): Observable<ProjectItem> {
    return this.http.put<ProjectItem>(`${this.apiUrl}/project/update/${projectId}`, project);
  }

  uploadProjectImage(project_id: string, data: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", data);

    // เพิ่ม headers
    const headers = new HttpHeaders({
      enctype: "multipart/form-data",
    });

    return this.http.put<any>(`${environment.api}/project/file/${project_id}`, formData, {
      headers: headers,
      reportProgress: true,
      responseType: "json",
      withCredentials: false, // หรือ true ถ้าต้องการส่ง cookies
    });
  }

  getProjectImage(imagePath: string): string {
    return `${this.apiUrl}/project/file/${imagePath}`;
  }
}

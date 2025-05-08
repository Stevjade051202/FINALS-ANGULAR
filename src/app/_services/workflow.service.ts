import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  constructor(private http: HttpClient) { }

  getByEmployeeId(employeeId: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/workflows/employee/${employeeId}`);
  }

  create(workflow: any) {
    return this.http.post(`${environment.apiUrl}/workflows`, workflow);
  }

  updateStatus(id: number, status: string) {
    return this.http.put(`${environment.apiUrl}/workflows/${id}/status`, { status });
  }
}
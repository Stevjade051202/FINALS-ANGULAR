import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(`${environment.apiUrl}/departments`);
  }

  getById(id: number) {
    return this.http.get<any>(`${environment.apiUrl}/departments/${id}`);
  }

  create(department: any) {
    return this.http.post(`${environment.apiUrl}/departments`, department);
  }

  update(id: number, department: any) {
    return this.http.put(`${environment.apiUrl}/departments/${id}`, department);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/departments/${id}`);
  }
}
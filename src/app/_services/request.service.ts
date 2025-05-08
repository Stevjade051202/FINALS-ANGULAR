import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Request } from '../_models/request.model';

@Injectable({ providedIn: 'root' })
export class RequestService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Request[]> {
        return this.http.get<Request[]>(`${environment.apiUrl}/requests`);
    }

    getById(id: number): Observable<Request> {
        return this.http.get<Request>(`${environment.apiUrl}/requests/${id}`);
    }

    create(request: Request): Observable<Request> {
        return this.http.post<Request>(`${environment.apiUrl}/requests`, request);
    }

    update(id: number, request: Request): Observable<Request> {
        return this.http.put<Request>(`${environment.apiUrl}/requests/${id}`, request);
    }

    updateStatus(id: number, status: string): Observable<void> {
        return this.http.patch<void>(`${environment.apiUrl}/requests/${id}/status`, { status });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/requests/${id}`);
    }
}
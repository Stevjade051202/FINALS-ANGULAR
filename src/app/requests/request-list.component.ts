import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestService } from '../_services/request.service';
import { AlertService } from '../_services/alert.service';
import { AuthService } from '../_services/auth.service';
import { Request } from '../_models/request.model';

@Component({
    selector: 'app-request-list',
    templateUrl: './request-list.component.html',
    standalone: false
})
export class RequestListComponent implements OnInit {
    requests: Request[] = [];
    isAdmin = false;
    loading = false;

    constructor(
        private requestService: RequestService,
        private alertService: AlertService,
        private authService: AuthService
    ) {
        this.isAdmin = this.authService.isAdmin();
    }

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.loading = true;
        this.requestService.getAll()
            .pipe(first())
            .subscribe({
                next: requests => {
                    this.requests = requests;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    updateStatus(id: number, status: string) {
        this.requestService.updateStatus(id, status)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success(`Request ${status.toLowerCase()} successfully`);
                    this.loadRequests();
                },
                error: error => this.alertService.error(error)
            });
    }

    deleteRequest(id: number) {
        if (confirm('Are you sure you want to delete this request?')) {
            this.requestService.delete(id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.requests = this.requests.filter(x => x.id !== id);
                        this.alertService.success('Request deleted');
                    },
                    error: error => this.alertService.error(error)
                });
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            case 'pending': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
}
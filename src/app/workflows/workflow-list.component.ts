import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../_services/workflow.service';
import { AlertService } from '../_services/alert.service';

@Component({
  templateUrl: 'workflow-list.component.html',
  standalone: false
})
export class WorkflowListComponent implements OnInit {
  employeeId: number;
  workflows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.workflowService.getByEmployeeId(this.employeeId)
      .subscribe(workflows => this.workflows = workflows);
  }

  updateStatus(id: number, status: string) {
    this.workflowService.updateStatus(id, status)
      .subscribe({
        next: () => {
          this.alertService.success(`Workflow ${status} successfully`);
          this.workflowService.getByEmployeeId(this.employeeId)
            .subscribe(workflows => this.workflows = workflows);
        },
        error: error => this.alertService.error(error)
      });
  }

  backToEmployees() {
    this.router.navigate(['/employees']);
  }
}
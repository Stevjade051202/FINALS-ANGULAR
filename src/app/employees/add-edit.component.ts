import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../_services/employee.service';
import { AccountService } from '../_services/account.service';
import { DepartmentService } from '../_services/department.service';
import { AlertService } from '../_services/alert.service';

@Component({
  templateUrl: 'add-edit.component.html',
  standalone: false
})
export class AddEditComponent implements OnInit {
  form: FormGroup;
  id: number;
  isAddMode: boolean;
  users: any[] = [];
  departments: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private accountService: AccountService,
    private departmentService: DepartmentService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    this.form = this.formBuilder.group({
      employeeId: ['', Validators.required],
      userId: ['', Validators.required],
      position: ['', Validators.required],
      departmentId: ['', Validators.required],
      hireDate: ['', Validators.required],
      status: ['Active']
    });

    this.accountService.getAll()
      .subscribe(users => this.users = users);

    this.departmentService.getAll()
      .subscribe(depts => this.departments = depts);

    if (!this.isAddMode) {
      this.employeeService.getById(this.id)
        .subscribe(employee => this.form.patchValue(employee));
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isAddMode) {
      this.createEmployee();
    } else {
      this.updateEmployee();
    }
  }

  private createEmployee() {
    this.employeeService.create(this.form.value)
      .subscribe({
        next: () => {
          this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
          this.router.navigate(['/employees']);
        },
        error: error => this.alertService.error(error)
      });
  }

  private updateEmployee() {
    this.employeeService.update(this.id, this.form.value)
      .subscribe({
        next: () => {
          this.alertService.success('Employee updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['/employees']);
        },
        error: error => this.alertService.error(error)
      });
  }
}
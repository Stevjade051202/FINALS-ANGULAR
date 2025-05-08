import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../_services/department.service';
import { AlertService } from '../_services/alert.service';

@Component({
  templateUrl: 'department-add-edit.component.html',
  standalone: false
})
export class DepartmentAddEditComponent implements OnInit {
  form: FormGroup;
  id: number;
  isAddMode: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });

    if (!this.isAddMode) {
      this.departmentService.getById(this.id)
        .subscribe(dept => this.form.patchValue(dept));
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isAddMode) {
      this.createDepartment();
    } else {
      this.updateDepartment();
    }
  }

  public createDepartment() {
    this.departmentService.create(this.form.value)
      .subscribe({
        next: () => {
          this.alertService.success('Department created successfully', { keepAfterRouteChange: true });
          this.router.navigate(['/departments']);
        },
        error: error => this.alertService.error(error)
      });
  }

  public updateDepartment() {
    this.departmentService.update(this.id, this.form.value)
      .subscribe({
        next: () => {
          this.alertService.success('Department updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['/departments']);
        },
        error: error => this.alertService.error(error)
      });
  }
}
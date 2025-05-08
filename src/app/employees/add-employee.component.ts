import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../_services/employee.service';
import { AlertService } from '../_services/alert.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-employee',
    templateUrl: './add-employee.component.html'
})
export class AddEmployeeComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private router: Router
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required],
            user: ['', Validators.required],
            position: ['', Validators.required],
            department: ['', Validators.required],
            hireDate: ['', Validators.required]
        });
    }

    onSubmit() {
        this.submitted = true;
        
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.employeeService.create(this.form.value)
            .subscribe({
                next: () => {
                    this.alertService.success('Employee added successfully');
                    this.router.navigate(['/employees']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
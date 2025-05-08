import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { RequestService } from '../_services/request.service';
import { EmployeeService } from '../_services/employee.service';
import { AlertService } from '../_services/alert.service';
import { Employee } from '../_models/employee';

@Component({
    selector: 'app-request-add-edit',
    templateUrl: './add-edit.component.html',
    standalone: false
})
export class RequestAddEditComponent implements OnInit {
    form!: FormGroup;
    id?: number;
    title!: string;
    employees: Employee[] = [];
    loading = false;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load all employees for dropdown
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => {
                this.employees = employees;
            });

        this.form = this.formBuilder.group({
            type: ['', Validators.required],
            employeeId: ['', Validators.required],
            items: this.formBuilder.array([]),
            status: ['Pending']
        });

        if (this.id) {
            this.title = 'Edit Request';
            this.loading = true;
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe(request => {
                    this.form.patchValue(request);
                    request.items.forEach(item => this.addItem(item));
                    this.loading = false;
                });
        } else {
            this.title = 'Add Request';
            this.addItem();
        }
    }

    // Getter for easy access to form array
    get items() {
        return this.form.get('items') as FormArray;
    }

    addItem(item: any = null) {
        const itemForm = this.formBuilder.group({
            name: [item?.name || '', Validators.required],
            quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]]
        });
        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.submitting = true;

        // Create or update request based on id
        const saveRequest = this.id
            ? this.requestService.update(this.id, this.form.value)
            : this.requestService.create(this.form.value);

        saveRequest.pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request saved successfully');
                    this.router.navigateByUrl('/requests');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
}
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';

const accountsKey = 'angular-19-boilerplate-accounts'; // Make sure key is accessible or defined here
@Component({
    templateUrl: 'login.component.html',
    standalone: false
})
export class LoginComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        // --- TEST THE PUBLIC API ENDPOINT ---
        // Construct the URL correctly (relative or using environment.apiUrl)
        // Since fake backend intercepts based on url.endsWith, a relative path is fine here.
        // If you had a real backend, you'd use `${environment.apiUrl}/accounts/all`
        const apiUrl = `/accounts/all`; // Relative path for fake backend

        console.log('Attempting to fetch public accounts from:', apiUrl);

        this.http.get<any[]>(apiUrl).subscribe({ // Expect an array
            next: (accounts) => {
                console.log('Successfully fetched public accounts:', accounts);
                // You could display these somewhere in your template if needed
            },
            error: (error) => {
                console.error('Error fetching public accounts:', error);
            }
        });
        // --- END TEST ---
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    // get return url from query parameters or default to home page
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    resetFakeBackendStorage() {
        localStorage.removeItem(accountsKey);
        location.reload();
    }
}
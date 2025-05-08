import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '../_services';
import { Role } from '../_models';

// array in local storage for accounts
const accountsKey = 'angular-19-boilerplate-accounts';
let accounts: any[] = JSON.parse(localStorage.getItem(accountsKey) ?? '[]');

const departmentsKey = 'departments';
let departments: any[] = JSON.parse(localStorage.getItem(departmentsKey) ?? '[]');

const employeesKey = 'employees';
let employees: any[] = JSON.parse(localStorage.getItem(employeesKey) ?? '[]');

const workflowsKey = 'workflows';
let workflows: any[] = JSON.parse(localStorage.getItem(workflowsKey) ?? '[]');

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                // --- START NEW PUBLIC ROUTE ---
                case url.endsWith('/accounts/all') && method === 'GET': // Public GET all
                    return getAllAccountsPublic();
                // --- END NEW PUBLIC ROUTE ---
                case url.endsWith('/employees') && method === 'GET':
                    return getEmployees();
                case url.match(/\/employees\/\d+$/) && method === 'GET':
                    return getEmployeeById(url);
                case url.endsWith('/employees') && method === 'POST':
                    return createEmployee(body);
                case url.match(/\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee(url, body);
                case url.match(/\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee(url);
                case url.endsWith('/departments') && method === 'GET':
                    return getDepartments();
                case url.match(/\/departments\/\d+$/) && method === 'GET':
                    return getDepartmentById(url);
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment(body);
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment(url, body);
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment(url);
                case url.match(/\/workflows\/employee\/\d+$/) && method === 'GET':
                    return getWorkflowsByEmployeeId(url);
                case url.endsWith('/workflows') && method === 'POST':
                    return createWorkflow(body);
                case url.match(/\/workflows\/\d+\/status$/) && method === 'PUT':
                    return updateWorkflowStatus(url, body);
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { email, password } = body;
            
            // const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
            
            // if (!account) return error('Email or password is incorrect');

            let account = accounts.find(x => x.email === email);
            if (account.id !== 1) {
                if (!account) return error('Email does not exist');
            
                if (!account || account.password !== password) return error('Password is incorrect');
                
                if (!account.isVerified) {
                    // display verification email in alert
                    setTimeout(() => {
                        const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                        alertService.info(`
                            <h4>Verification Email</h4>
                            <p>Please click the below link to verify your email address:</p>
                            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        `, { autoClose: false });
                    }, 5000);
                    return error('Email is not verified');
                }
    
                if (!account || account.status !== 'Active') return error('Account is InActive. Please contact system administrator!');    
            }
            
            // add refresh token to account
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) return unauthorized();

            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            if (!account) return unauthorized();

            // replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });

        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();
            
            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            // revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;
            let isFirstUser = false; // Flag to indicate if it's the first user

            if (accounts.find(x => x.email === account.email)) {
                // display email already registered "email" in alert
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            if (account.id === 1) {
                // first registered account is an admin
                account.isVerified = true;
                account.role = Role.Admin;
                isFirstUser = true; // Set the flag
            } else {
                account.isVerified = false;
                account.role = Role.User;
            }
            account.status = 'InActive';
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            if (isFirstUser) {
                setTimeout(() => {
                    alertService.info(`
                        <h4>First User Login</h4>
                        <p>You can login directly as first user where role is Admin and account is verified</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }else{
                // display verification email in alert
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4>
                        <p>Thanks for registering!</p>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }
            

            // Return ok status with a flag indicating if it was the first user
            return ok({ isFirstUser: isFirstUser });
        }
        
        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);
            
            if (!account) return error('Verification failed');
            
            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);
            
            // always return ok() response to prevent email enumeration
            if (!account) return ok();
            
            // create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                    <h4>Reset Password Email</h4>
                    <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }
        
        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            // update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getAccounts() {
            if (!isAuthenticated()) return unauthorized();
            return ok(accounts.map(x => basicDetails(x)));
        }

        function getAccountById() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can get own profile and admin accounts can get all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            return ok(basicDetails(account));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                return error(`Email ${account.email} is already registered`);
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();

            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can update own profile and admin accounts can update all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // only update password if included
            if (!params.password) {
                delete params.password;
            }
            // don't save confirm password
            delete params.confirmPassword;

            // update and save account
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok(basicDetails(account));
        }

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can delete own account and admin accounts can delete any account
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // delete account then save
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        function getEmployees() {
            return this.ok(this.employees);
        }
    
        function getEmployeeById(url: string) {
            const id = parseInt(url.split('/').pop()!);
            const employee = this.employees.find(x => x.id === id);
            return employee ? this.ok(employee) : this.error('Employee not found');
        }
    
        function createEmployee(body: any) {
            const employee = {
                id: this.employees.length + 1,
                employeeId: body.employeeId,
                userId: body.userId,
                position: body.position,
                departmentId: body.departmentId,
                hireDate: body.hireDate,
                status: 'Active',
                user: { id: body.userId, email: `user${body.userId}@example.com` },
                department: this.departments.find(d => d.id === body.departmentId) || { id: body.departmentId, name: 'Unknown' }
            };
            this.employees.push(employee);
            return this.ok(employee);
        }
    
        function updateEmployee(url: string, body: any) {
            const id = parseInt(url.split('/').pop()!);
            const employee = this.employees.find(x => x.id === id);
            if (!employee) return this.error('Employee not found');
            Object.assign(employee, body);
            return this.ok(employee);
        }
    
        function deleteEmployee(url: string) {
            const id = parseInt(url.split('/').pop()!);
            this.employees = this.employees.filter(x => x.id !== id);
            return this.ok({ message: 'Employee deleted successfully' });
        }
    
        function getDepartments() {
            return ok(departments.map(x => departmentDetails(x)));
        }
    
        function getDepartmentById(url: string) {
            const id = parseInt(url.split('/').pop()!);
            const department = this.departments.find(x => x.id === id);
            return department ? this.ok(department) : this.error('Department not found');
        }
    
        function createDepartment(body: any) {
            console.log('Creating department:', body);
            const department = {
                id: departments.length + 1,
                name: body.name,
                description: body.description
            };
            departments.push(department);
            localStorage.setItem(departmentsKey, JSON.stringify(departments));

            return ok(department);
        }
    
        function updateDepartment(url: string, body: any) {
            const id = parseInt(url.split('/').pop()!);
            const department = this.departments.find(x => x.id === id);
            if (!department) return this.error('Department not found');
            Object.assign(department, body);
            return this.ok(department);
        }
    
        function deleteDepartment(url: string) {
            const id = parseInt(url.split('/').pop()!);
            departments = departments.filter(x => x.id !== id);
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            return ok({ message: 'Department deleted successfully' });
        }
    
        function getWorkflowsByEmployeeId(url: string) {
            const employeeId = parseInt(url.split('/').pop()!);
            const workflows = this.workflows.filter(x => x.employeeId === employeeId);
            return this.ok(workflows);
        }
    
        function createWorkflow(body: any) {
            const workflow = {
                id: this.workflows.length + 1,
                employeeId: body.employeeId,
                type: body.type,
                status: 'Pending',
                details: body.details,
                createdAt: new Date()
            };
            this.workflows.push(workflow);
            return this.ok(workflow);
        }
    
        function updateWorkflowStatus(url: string, body: any) {
            const id = parseInt(url.split('/')[2]);
            const workflow = this.workflows.find(x => x.id === id);
            if (!workflow) return this.error('Workflow not found');
            workflow.status = body.status;
            return this.ok(workflow);
        }
        
        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); 
                // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(account) {
            const { id, title, firstName, lastName, email, role, dateCreated, isVerified, status } = account;
            return { id, title, firstName, lastName, email, role, dateCreated, isVerified, status };
        }

        function departmentDetails(account) {
            const { id, name, description } = account;
            return { id, name, description };
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            // check if jwt token is in auth header
            const authHeader = headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer fake-jwt-token')) return;

            // check if token is expired

            // const tokenParts = authHeader.split('.');
            // if (tokenParts.length < 2) return;
            // const jwtToken = JSON.parse(atob(tokenParts[1]));
            // const tokenExpired = Date.now() > (jwtToken.exp * 1000);  
            // if (tokenExpired) return;

            // const account = accounts.find(x => x.id === jwtToken.id);
            // return account;

            const tokenParts = authHeader.split('.');
            if (tokenParts.length < 2) return undefined; // Return undefined for clarity
            try {
                const jwtToken = JSON.parse(atob(tokenParts[1]));
                const tokenExpired = Date.now() > (jwtToken.exp * 1000);
                if (tokenExpired) return undefined; // Return undefined for clarity

                const account = accounts.find(x => x.id === jwtToken.id);
                return account;
            } catch (e) {
                // Handle potential errors during token parsing (e.g., invalid base64)
                console.error("Error parsing JWT token:", e);
                return undefined;
            }
        }

        function generateJwtToken(account) {
            // create token that expires in 15 minutes
            const tokenPayload = { 
                exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                id: account.id
            }
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();

            // add token cookie that expires in 7 days
            const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;

            return token;
        }

        function getRefreshToken() {
            // get refresh token from cookie

            // return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];

            const cookies = document.cookie.split('; ');
            const refreshTokenCookie = cookies.find(row => row.startsWith('fakeRefreshToken='));
            return refreshTokenCookie ? refreshTokenCookie.split('=')[1] : '';
        }

        // --- START NEW PUBLIC HANDLER FUNCTION ---
        function getAllAccountsPublic() {
            // No authentication check needed for this public route.
            // Return basic details only to avoid exposing sensitive info like passwords/tokens.
            return ok(accounts.map(x => basicDetails(x)));
        }
        // --- END NEW PUBLIC HANDLER FUNCTION ---
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};

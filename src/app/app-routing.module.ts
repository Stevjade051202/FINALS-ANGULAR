import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'employees', loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule), canActivate: [AuthGuard] },
    { path: 'departments', loadChildren: () => import('./departments/departments.module').then(m => m.DepartmentsModule), canActivate: [AuthGuard] },
    { path: 'workflows', loadChildren: () => import('./workflows/workflows.module').then(m => m.WorkflowsModule), canActivate: [AuthGuard] },
    { path: 'requests', loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule) },
    // { path: 'requests', loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule), canActivate: [AuthGuard] },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

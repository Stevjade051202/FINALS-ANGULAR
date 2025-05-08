import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentListComponent } from './department-list.component';
import { DepartmentAddEditComponent } from './department-add-edit.component';
import { AuthGuard } from '../_helpers/auth.guard';
import { Role } from '../_models/role';

const routes: Routes = [
  {
    path: '',
    component: DepartmentListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add',
    component: DepartmentAddEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'edit/:id',
    component: DepartmentAddEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentsRoutingModule { }
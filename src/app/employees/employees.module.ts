import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeesRoutingModule } from './employees-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule
  ],
  declarations: [
    ListComponent,
    AddEditComponent
  ]
})
export class EmployeesModule { }
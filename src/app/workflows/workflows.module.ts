import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { WorkflowListComponent } from './workflow-list.component';
import { WorkflowCreateComponent } from './workflow-create.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkflowsRoutingModule
  ],
  declarations: [
    WorkflowListComponent,
    WorkflowCreateComponent
  ]
})
export class WorkflowsModule { }
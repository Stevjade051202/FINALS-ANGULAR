import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestListComponent } from './request-list.component';
import { RequestAddEditComponent } from './add-edit.component';
import { RequestsRoutingModule } from './requests-routing.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        RequestsRoutingModule
    ],
    declarations: [
        RequestListComponent,
        RequestAddEditComponent
    ]
})
export class RequestsModule { }
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestListComponent } from './request-list.component';
import { RequestAddEditComponent } from './add-edit.component';

const routes: Routes = [
    {
        path: '',
        component: RequestListComponent
    },
    {
        path: 'add',
        component: RequestAddEditComponent
    },
    {
        path: ':id/edit',
        component: RequestAddEditComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { }
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageUsersComponent } from './manage-users.component';

const routes: Routes = [
  {
    path: '',
    component: ManageUsersComponent,
    data: { 
      title: 'إدارة المستخدمين',
      breadcrumb: 'المستخدمين'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageUsersRoutingModule { }

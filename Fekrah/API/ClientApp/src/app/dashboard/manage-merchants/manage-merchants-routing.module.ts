import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageMerchantsComponent } from './components/manage-merchants-main/manage-merchants.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';

const routes: Routes = [
  { 
    path: '', 
    component: ManageMerchantsComponent,
    data: { title: 'إدارة التجار' }
  },
   {
    path: 'add',
    component: EditProfileComponent
  },
  {
    path: 'edit/:id',
    component: EditProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMerchantsRoutingModule { }

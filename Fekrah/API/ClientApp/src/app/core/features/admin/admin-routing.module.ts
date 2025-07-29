import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ManageMerchantsComponent } from './manage-merchants/manage-merchants.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'manage-merchants', component: ManageMerchantsComponent },
  { 
    path: 'add-merchant', 
    redirectTo: '/merchant-profile/edit',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

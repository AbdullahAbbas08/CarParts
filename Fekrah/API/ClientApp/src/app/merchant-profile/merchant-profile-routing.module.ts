import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerchantProfileComponent } from './merchant-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

const routes: Routes = [
  {
    path: '',
    component: MerchantProfileComponent
  },
  {
    path: 'edit',
    component: EditProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantProfileRoutingModule { }

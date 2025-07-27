import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { MerchantProfileRoutingModule } from './merchant-profile-routing.module';
import { SharedModule } from '../Shared/shared.module';
import { MerchantProfileComponent } from './merchant-profile.component';

@NgModule({
  declarations: [
    MerchantProfileComponent,
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MerchantProfileRoutingModule
  ]
})
export class MerchantProfileModule { }

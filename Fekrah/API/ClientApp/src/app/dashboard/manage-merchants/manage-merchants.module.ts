import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManageMerchantsRoutingModule } from './manage-merchants-routing.module';
import { ManageMerchantsComponent } from './components/manage-merchants-main/manage-merchants.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { SharedModule } from 'src/app/Shared/shared.module';

@NgModule({
  declarations: [
    ManageMerchantsComponent,
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ManageMerchantsRoutingModule,
    SharedModule
  ],
  exports: [
    ManageMerchantsComponent,
    EditProfileComponent
  ]
})
export class ManageMerchantsModule { }

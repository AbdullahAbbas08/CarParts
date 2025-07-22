import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllPrandsRoutingModule } from './all-prands-routing.module';
import { AllBrandsComponent } from './all-brands.component';
import { SharedModule } from '../../../Shared/shared.module';


@NgModule({
  declarations: [AllBrandsComponent],
  imports: [
    CommonModule,
    AllPrandsRoutingModule,
    SharedModule
  ]
})
export class AllPrandsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllOffersRoutingModule } from './all-offers-routing.module';
import { AllOffersComponent } from './all-offers/all-offers.component';
import { SharedModule } from '../../../Shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [AllOffersComponent],
  imports: [
    CommonModule,
    AllOffersRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AllOffersModule { }

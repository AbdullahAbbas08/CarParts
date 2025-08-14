import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OffersRoutingModule } from './offers-routing.module';
import { OffersListComponent } from './offers-list.component';
import { AddOfferComponent } from './add-offer/add-offer.component';
import { SharedModule } from 'src/app/Shared/shared.module';

@NgModule({
  declarations: [
    OffersListComponent,
    AddOfferComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    OffersRoutingModule,
    SharedModule
  ]
})
export class OffersModule { }

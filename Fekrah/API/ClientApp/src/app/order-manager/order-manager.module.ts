import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderManagerRoutingModule } from './order-manager-routing.module';
import { MerchantOrdersComponent } from './merchant-orders/merchant-orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { SharedModule } from '../Shared/shared.module';


@NgModule({
  declarations: [MerchantOrdersComponent,OrderDetailsComponent],
  imports: [
    CommonModule,
    OrderManagerRoutingModule,
    SharedModule
  ]
})
export class OrderManagerModule { }

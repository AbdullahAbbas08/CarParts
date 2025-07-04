import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerchantOrdersComponent } from './merchant-orders/merchant-orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

const routes: Routes = [
  {
    path: '',
    component: MerchantOrdersComponent,
  },
  {
    path: 'merchant-orders',
    component: MerchantOrdersComponent,
  },
  {
    path: 'order-details',
    component: OrderDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderManagerRoutingModule {}

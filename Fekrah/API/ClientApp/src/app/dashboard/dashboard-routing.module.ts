import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboar-main/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MerchantComponent } from './merchant/merchant.component';

const routes: Routes = [
  { path: 'merchant',component: MerchantComponent},
  { path: 'super',component: DashboardComponent},
    { path: 'statistics', component: StatisticsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

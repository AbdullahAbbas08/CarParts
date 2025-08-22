import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticOffersComponent } from './static-offers.component';

const routes: Routes = [
  { path: '', component: StaticOffersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticOffersRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllOffersComponent } from './all-offers/all-offers.component';

const routes: Routes = [
  {path:'',component:AllOffersComponent,pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllOffersRoutingModule { }

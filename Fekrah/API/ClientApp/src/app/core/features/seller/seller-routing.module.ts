import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerPageComponent } from './seller-page/seller-page.component';
import { AllStoresComponent } from './all-stores/all-stores.component';

const routes: Routes = [  
  { path: 'all-store', component: AllStoresComponent , pathMatch: 'full' },
  { path: ':id', component: SellerPageComponent },
  { path: 'seller/:id', component: SellerPageComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }

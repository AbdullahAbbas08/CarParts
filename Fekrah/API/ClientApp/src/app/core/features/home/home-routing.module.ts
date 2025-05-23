import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { OffersComponent } from './offers/offers.component';

const routes: Routes = [{ path: '', component: HomeComponent },
  { path: 'offers', component: OffersComponent }, // ✅ أضف هذا
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

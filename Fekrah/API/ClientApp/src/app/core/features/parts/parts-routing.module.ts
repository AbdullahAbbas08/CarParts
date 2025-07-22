import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartDetailsComponent } from './part-details/part-details.component';
import { AllPartsComponent } from './all-parts.component';

const routes: Routes = [
  { path: ':id', component: PartDetailsComponent },       // بعده
  { path: '', component: AllPartsComponent },                 // في النهاية
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartsRoutingModule { }

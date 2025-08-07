import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LookupComponent } from './lookup.component';
import { BrandComponent } from './brand/brand.component';
import { ModelTypeComponent } from './model-type/model-type.component';


const routes: Routes = [
  { path: '', component: LookupComponent },
  { path: 'brand', component: BrandComponent },
  { path: 'model-type', component: ModelTypeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LookupRoutingModule { }

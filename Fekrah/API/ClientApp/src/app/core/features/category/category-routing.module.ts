import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPartsComponent } from './category-parts/category-parts.component';

const routes: Routes = [
  { path: '', component: CategoryPartsComponent },
  { path: ':name', component: CategoryPartsComponent },
  { path: ':id', component: CategoryPartsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule {
  categoryName: string = 'كهرباء';
}

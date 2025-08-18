import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PartCardComponent } from './components/part-card/part-card.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { FiltersSidebarComponent } from './components/filters-sidebar/filters-sidebar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CardComponent } from './components/card/card.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { AddCategoryModalComponent } from './components/add-category-modal/add-category-modal.component';
import { PrimeNGModule } from './primeng.module';

@NgModule({
   declarations: [
    PartCardComponent,
    FilterSidebarComponent,
    FiltersSidebarComponent,
    CardComponent,
    BreadcrumbComponent,
    OfferCardComponent,
    AddCategoryModalComponent,
    AddCategoryModalComponent
  ],  
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    PrimeNGModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    PartCardComponent,
    FilterSidebarComponent,
    FiltersSidebarComponent,
    NgxPaginationModule,
    CardComponent,
    OfferCardComponent,
    BreadcrumbComponent,
    AddCategoryModalComponent,
    PrimeNGModule
  ],
 
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrandComponent } from './brand/brand.component';
import { ModelTypeComponent } from './model-type/model-type.component';
import { SharedModule } from 'src/app/Shared/shared.module';
import { LookupRoutingModule } from './lookup-routing.module';
import { LookupComponent } from './lookup.component';


@NgModule({
  declarations: [
    BrandComponent,
    ModelTypeComponent,
    LookupComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LookupRoutingModule
  ]
})
export class LookupModule { }

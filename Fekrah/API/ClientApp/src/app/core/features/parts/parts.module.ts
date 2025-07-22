import { NgModule } from '@angular/core';

import { PartsRoutingModule } from './parts-routing.module';
import { PartFilterComponent } from './part-filter/part-filter.component';
import { PartListComponent } from './part-list/part-list.component';
import { PartCardComponent } from './part-card/part-card.component';
import { PartDetailsComponent } from './part-details/part-details.component';
import { SharedModule } from '../../../Shared/shared.module';
import { PartSearchComponent } from './part-search/part-search.component';
import { NgImageSliderModule } from 'ng-image-slider';
import { AllPartsComponent } from './all-parts.component';


@NgModule({
  declarations: [
    PartSearchComponent,
    PartFilterComponent,
    PartListComponent,
    PartCardComponent,
    PartDetailsComponent,
    AllPartsComponent
  ],
  imports: [
    SharedModule,
    PartsRoutingModule,
    NgImageSliderModule
  ]
})
export class PartsModule { }

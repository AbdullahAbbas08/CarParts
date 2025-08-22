import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticOffersService } from './static-offers.service';
import { StaticOffersComponent } from './static-offers.component';
import { SharedModule } from 'src/app/Shared/shared.module';
import { StaticOffersRoutingModule } from './static-offers-routing.module';

@NgModule({
  declarations: [StaticOffersComponent],
  imports: [CommonModule, SharedModule, StaticOffersRoutingModule],
  exports: [StaticOffersComponent],
  providers: [StaticOffersService]
})
export class StaticOffersModule {}

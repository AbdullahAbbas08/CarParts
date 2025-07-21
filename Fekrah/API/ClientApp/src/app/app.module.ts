
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './Shared/layout/header/header.component';
import { PromoTickerComponent } from './Shared/components/promo-ticker/promo-ticker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from './Shared/layout/footer/footer.module';
import { PreNavbarComponent } from './Shared/layout/pre-navbar/pre-navbar.component';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { EnhancedSearchComponent } from './Shared/components/enhanced-search/enhanced-search.component';
import { PartsFilterComponent } from './Shared/components/parts-filter/parts-filter.component';
import { API_BASE_URL,SwaggerClient } from './Shared/Services/Swagger/SwaggerClient.service';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderInterceptor } from './Shared/Services/header.interceptor';
import { LoaderComponent } from './Shared/components/loader/loader.component';
import { environment } from '../environments/environment';
registerLocaleData(localeAr);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PromoTickerComponent,
    PreNavbarComponent,
    EnhancedSearchComponent,
    PartsFilterComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FooterModule

  ],
  exports: [
    HeaderComponent,
    EnhancedSearchComponent,
    PartsFilterComponent
  ],
  providers: [  
        {
      provide: API_BASE_URL,
      useValue: environment.BASE_URL
    },
      {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
    },
    SwaggerClient,
    { provide: LOCALE_ID, useValue: 'ar-EG' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

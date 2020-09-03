import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LocationStrategy, Location, PathLocationStrategy} from '@angular/common';

import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import {HynotechModule} from './hynotech/hynotech.module';
import {LoaderService} from './hynotech/services/loader.service';
import {LoaderInterceptor} from './hynotech/services/loader.interceptor';
import { RegisterComponent } from './register/register.component';
import {GlobalModule} from './global/global.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule, PanelModule} from 'primeng';
import {FlexModule} from '@angular/flex-layout';







registerLocaleData(localeEsPe, 'es');

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
  ],
    imports: [
        SharedModule,
        // BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService, {passThruUnknownUrl: true}),
        AppRoutingModule,
        HynotechModule,
        GlobalModule,
        FormsModule,
        PanelModule,
        ReactiveFormsModule,
        FlexModule,
        ButtonModule,


    ],
  providers: [
      LoaderService, { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
      Location, { provide: LocationStrategy, useClass: PathLocationStrategy},
      { provide: LOCALE_ID, useValue: 'es' }
      ],
  bootstrap: [AppComponent]
})
export class AppModule { }

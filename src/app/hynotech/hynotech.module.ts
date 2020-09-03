import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HtFontAwesomeComponent } from './components/ht-font-awesome/ht-font-awesome.component';
import {HtFileUploadComponent} from './components/ht-file-upload/ht-file-upload.component';
import {HtProgressComponent} from './components/ht-progress/ht-progress.component';
import { HtCustomNavGullComponent } from './components/ht-custom-nav-gull/ht-custom-nav-gull.component';
import {RouterModule} from '@angular/router';
import { HtFormErrorsComponent } from './components/ht-form-errors/ht-form-errors.component';
import { HtSearchGullComponent } from './components/ht-search-gull/ht-search-gull.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {ReactiveFormsModule} from '@angular/forms';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import { HtSearchComponent } from './components/ht-search/ht-search.component';
import { HtLoaderComponent } from './components/ht-loader/ht-loader.component';
import { GeneralComponent } from './layouts/general/general.component';
import { NoEncontradoComponent } from './layouts/no-encontrado/no-encontrado.component';
import { WithHeaderComponent } from './layouts/with-header/with-header.component';
import {HtFiltroBusquedaComponent} from '../general/ht-filtro-busqueda/ht-filtro-busqueda.component';

@NgModule({
    declarations: [
        HtFontAwesomeComponent,
        HtFileUploadComponent,
        HtProgressComponent,
        HtCustomNavGullComponent,
        HtFormErrorsComponent,
        HtSearchGullComponent,
        HtSearchComponent,
        HtLoaderComponent,
        GeneralComponent,
        NoEncontradoComponent,
        WithHeaderComponent,
        HtFiltroBusquedaComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        PerfectScrollbarModule,
        NgxPaginationModule,
    ],
    exports: [
        HtFontAwesomeComponent,
        HtFileUploadComponent,
        HtProgressComponent,
        HtCustomNavGullComponent,
        HtFormErrorsComponent,
        HtSearchGullComponent,
        HtSearchComponent,
        HtLoaderComponent,
        HtFiltroBusquedaComponent
    ]
})
export class HynotechModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';

import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UiSwitchModule} from 'ngx-ui-switch';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {HynotechModule} from '../../hynotech/hynotech.module';

import { PostulacionRoutingModule } from './postulacion-routing.module';

import { from } from 'rxjs';
import {
    MatCardModule, MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatSliderModule,
    MatToolbarModule,
    MatTreeModule
} from '@angular/material';

import {ResizableModule} from 'angular-resizable-element';

import {GlobalModule} from '../../global/global.module';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {ButtonModule, CardModule, FieldsetModule, TabViewModule} from 'primeng';
import {NgxPaginationModule} from 'ngx-pagination';
import {PanelModule} from 'primeng/panel';

import { ConvocatoriasComponent } from './convocatorias/convocatorias.component';
import { ListasComponent } from './listas/listas.component';
import {LoginComponent} from './login/login.component';
import {RecaptchaModule} from 'ng-recaptcha';
import {NgxEchartsModule} from 'ngx-echarts';

@NgModule({
  declarations: [ ConvocatoriasComponent, ListasComponent, LoginComponent] ,
    imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
        HynotechModule,
        ReactiveFormsModule,
        UiSwitchModule,

        PostulacionRoutingModule,

        SharedComponentsModule,
        NgbModule,
        MatTreeModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatSliderModule,
        ResizableModule,
        MatFormFieldModule,
        MatDatepickerModule,
        GlobalModule,
        TabViewModule,
        FieldsetModule,
        PanelModule,
        NgxPaginationModule,
        ButtonModule,
        CardModule,
        RecaptchaModule,
        NgxEchartsModule
    ],
    providers: [
        NgbActiveModal
    ]
})
export class PostulacionModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }

}

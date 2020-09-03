import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';

import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UiSwitchModule} from 'ngx-ui-switch';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {HynotechModule} from '../../hynotech/hynotech.module';

import { GastosRoutingModule } from './gastos-routing.module';
import { GastosComponent } from './gastos/gastos.component';
import {
    MatCardModule, MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatSliderModule,
    MatToolbarModule,
    MatTreeModule
} from '@angular/material';
import {ResizableModule} from 'angular-resizable-element';
import {interval, Subscription} from 'rxjs';
import {DataServices} from '../../servicios/data.services';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {SearchService} from '../../shared/services/search.service';
import {Router} from '@angular/router';
import {NgxPaginationModule} from 'ngx-pagination';
import {
    AccordionModule,
    CheckboxModule,
    InputSwitchModule,
    PanelModule,
    SplitButtonModule,
    TabViewModule,
    ToastModule
} from 'primeng';
import {CustomFormsModule} from 'ng2-validation';
import {ButtonModule} from 'primeng/button';
import {GlobalModule} from '../../global/global.module';

@NgModule({
  declarations: [GastosComponent],
    imports: [
        CommonModule,
        GastosRoutingModule,
        HynotechModule,
        ReactiveFormsModule,
        NgSelectModule,
        FormsModule,
        NgbModule,
        NgxPaginationModule,
        SharedComponentsModule,
        ToastModule,
        AccordionModule,
        CustomFormsModule,
        ButtonModule,
        PanelModule,
        TabViewModule,
        SplitButtonModule,
        GlobalModule,
        CheckboxModule,
        InputSwitchModule
    ],
    providers: [
        NgbActiveModal
    ]
})
export class GastosModule {
    suscripcionDatosMostrar: Subscription;
    constructor(
        private _dataService: DataServices,
        private queryInvestigacionService: QueryInvestigacionServices,
        public searchService: SearchService,
        private router: Router,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}


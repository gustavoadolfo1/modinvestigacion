import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {UiSwitchModule} from 'ngx-ui-switch';

import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {HynotechModule} from '../../hynotech/hynotech.module';

import {PresupuestoRoutingModule} from './presupuesto-routing.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import { CronogramaTecnicoComponent } from './cronograma-tecnico/cronograma-tecnico.component';
import {DistribucionPresupuestoComponent} from './distribucion-presupuesto/distribucion-presupuesto.component';
import { FinanciableComponent } from './financiable/financiable.component';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {AccordionModule, ButtonModule, ToastModule} from 'primeng';
import {CustomFormsModule} from 'ng2-validation';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
    declarations: [
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
        HynotechModule,
        ReactiveFormsModule,
        UiSwitchModule,
        SharedComponentsModule,
        NgxDatatableModule,

        PresupuestoRoutingModule,
        AccordionModule,
        NgbModule,
        ToastModule,
        ButtonModule,
        CustomFormsModule,
        NgxPaginationModule
    ],
    exports: [
    ],
    providers: [
        NgbActiveModal
    ]
})
export class PresupuestoModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }

}

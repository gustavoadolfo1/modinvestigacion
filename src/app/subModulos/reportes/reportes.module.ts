import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportesRoutingModule} from './reportes-routing.module';
import {ReportesComponent} from './reportes/reportes.component';
import {NgbActiveModal, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {NgxEchartsModule} from 'ngx-echarts';
import {NgSelectModule} from '@ng-select/ng-select';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import { NotificacionComponent } from './notificacion/notificacion.component';

@NgModule({
    declarations: [ReportesComponent, NotificacionComponent],
    imports: [
        CommonModule,
        ReportesRoutingModule,
        NgxEchartsModule,
        NgbTabsetModule,
        NgSelectModule,
        HynotechModule,
        NgxPaginationModule,
        FormsModule,
        ButtonModule
    ],
    providers: [
        NgbActiveModal
    ]
})
export class ReportesModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

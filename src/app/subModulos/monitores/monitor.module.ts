import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonitorRoutingModule } from './monitor-routing.module';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {MonitoresProyectoComponent} from './monitores-proyecto/monitores-proyecto.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';

@NgModule({
    declarations: [
        MonitoresProyectoComponent
    ], imports: [
        CommonModule,
        MonitorRoutingModule,
        HynotechModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        ButtonModule
    ],
    providers: [
        NgbActiveModal
    ]
})
export class MonitorModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }

}

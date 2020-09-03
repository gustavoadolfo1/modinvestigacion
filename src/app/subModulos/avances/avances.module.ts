import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvancesRoutingModule } from './avances-routing.module';
import { AvanceTecnicoComponent } from './avance-tecnico/avance-tecnico.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {GlobalModule} from '../../global/global.module';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {ButtonModule} from 'primeng/button';

@NgModule({
  declarations: [AvanceTecnicoComponent],
    imports: [
        CommonModule,
        AvancesRoutingModule,
        NgxPaginationModule,
        HynotechModule,
        NgSelectModule,
        FormsModule,
        NgbModule,
        NgxPaginationModule,
        SharedComponentsModule,
        ReactiveFormsModule,
        GlobalModule,
        ButtonModule
        //  GlobalModule,
    ],
    providers: [
        NgbActiveModal
    ]
})
export class AvancesModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

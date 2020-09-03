import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformesRoutingModule } from './informes-routing.module';
import { InformesComponent } from './informes/informes.component';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GlobalModule} from '../../global/global.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import { InformeHitoComponent } from './informe-hito/informe-hito.component';
import {AccordionModule, CalendarModule, CheckboxModule, SplitButtonModule, ToastModule} from 'primeng';
import {ButtonModule} from 'primeng/button';
import { InformeTecnicoComponent } from './informe-tecnico/informe-tecnico.component';
import {CustomFormsModule} from 'ng2-validation';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
    declarations: [InformesComponent, InformeHitoComponent, InformeTecnicoComponent],
    imports: [
        CommonModule,
        InformesRoutingModule,
        HynotechModule,
        ReactiveFormsModule,
        GlobalModule,
        ToastModule,
        AccordionModule,
        FormsModule,
        ButtonModule,
        CustomFormsModule,
        CalendarModule,
        SplitButtonModule,
        CheckboxModule,
        NgxPaginationModule,
    ],
    providers: [
        NgbActiveModal
    ]
})
export class InformesModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

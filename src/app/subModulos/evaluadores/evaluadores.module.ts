import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgbActiveModal, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';

import {UiSwitchModule} from 'ngx-ui-switch';

import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {HynotechModule} from '../../hynotech/hynotech.module';

import {EvaluadoresRoutingModule} from './evaluadores-routing.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

import { MenuComponent } from './menu/menu.component';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import {ParesEvaluadoresComponent} from './pares-evaluadores/pares-evaluadores.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {AccordionModule, ButtonModule, FieldsetModule, TabViewModule} from 'primeng';
import {ProyectoModule} from '../proyecto/proyecto.module';
import {PanelModule} from 'primeng/panel';
import {GlobalModule} from '../../global/global.module';
import {ResumenComponent} from './resumen/resumen.component';
import { PropuestasComponent } from './propuestas/propuestas.component';


@NgModule({
    declarations: [
        MenuComponent, EvaluacionComponent, ParesEvaluadoresComponent, ResumenComponent, PropuestasComponent
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

        EvaluadoresRoutingModule,
        NgxPaginationModule,
        NgbTabsetModule,
        AccordionModule,
        //   ProyectoModule,
        PanelModule,
        GlobalModule,
        TabViewModule,
        FieldsetModule,
        ButtonModule,
        ProyectoModule
    ],
    exports: [
        MenuComponent, EvaluacionComponent, ParesEvaluadoresComponent , ResumenComponent, PropuestasComponent
    ],
    providers: [
        NgbActiveModal
    ]
})
export class EvaluadoresModule {
    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

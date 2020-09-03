import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProyectoRoutingModule } from './proyecto-routing.module';
import { ProyectoComponent } from './proyecto/proyecto.component';
import {ButtonModule} from 'primeng/button';
import {
    AccordionModule, CheckboxModule, MessageModule,
    PanelModule, SelectButtonModule,
    SplitButtonModule,
    StepsModule,
    TableModule,
    TabMenuModule,
    ToastModule
} from 'primeng';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {TabViewModule} from 'primeng/tabview';
import {FieldsetModule} from 'primeng/fieldset';
import {NgSelectModule} from '@ng-select/ng-select';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {GlobalModule} from '../../global/global.module';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import { HitoComponent } from './hito/hito.component';
import { ProgramacionTecnicaComponent } from './programacion-tecnica/programacion-tecnica.component';
import { HttpClientModule } from '@angular/common/http';
import {CustomFormsModule} from 'ng2-validation';
import {interval, Subscription} from 'rxjs';
import {DataServices} from '../../servicios/data.services';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {SearchService} from '../../shared/services/search.service';
import {Router} from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { IndicadorHitoComponent } from './indicador-hito/indicador-hito.component';
import {DistribucionPresupuestoComponent} from '../presupuesto/distribucion-presupuesto/distribucion-presupuesto.component';
import {CronogramaTecnicoComponent} from '../presupuesto/cronograma-tecnico/cronograma-tecnico.component';
import { FinanciableComponent } from '../presupuesto/financiable/financiable.component';
import { RequisitoComponent } from './requisito/requisito.component';


@NgModule({
    declarations: [ProyectoComponent, HitoComponent, ProgramacionTecnicaComponent, MenuComponent,
        IndicadorHitoComponent, DistribucionPresupuestoComponent, CronogramaTecnicoComponent, FinanciableComponent, RequisitoComponent],
    imports: [
        CommonModule,
        ProyectoRoutingModule,
        ButtonModule,
        TabMenuModule,
        StepsModule,
        ToastModule,
        FormsModule,
        InputTextModule,
        TabViewModule,
        FieldsetModule,
        ReactiveFormsModule,
        NgSelectModule,
        HynotechModule,
        GlobalModule,
        SharedComponentsModule,
        TableModule,
        PanelModule,
        SplitButtonModule,
        HttpClientModule,
        AccordionModule,
        CheckboxModule,
        CustomFormsModule,
        NgxPaginationModule,

        NgbModule,
        MessageModule,
        SelectButtonModule,
    ],
    exports: [
        MenuComponent,
        RequisitoComponent
    ],
    providers: [
        NgbActiveModal
    ]
})
export class ProyectoModule {
    suscripcionDatosMostrar: Subscription;

    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

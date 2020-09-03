import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';

import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UiSwitchModule} from 'ngx-ui-switch';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {HynotechModule} from '../../hynotech/hynotech.module';

import { MantenimientoRoutingModule } from './mantenimiento-routing.module';

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

import {FuenteProyectoComponent} from './fuente-proyecto/fuente-proyecto.component';
import {TipoProyectoComponent} from './tipo-proyecto/tipo-proyecto.component';
import {EstadoProyectoComponent} from './estado-proyecto/estado-proyecto.component';
import { EvaluadoresProyectoComponent } from './evaluadores-proyecto/evaluadores-proyecto.component';
import { ConvocatoriaComponent } from './convocatoria/convocatoria.component';

import {GlobalModule} from '../../global/global.module';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {ButtonModule, FieldsetModule, TabViewModule} from 'primeng';
import {NgxPaginationModule} from 'ngx-pagination';
import {PanelModule} from 'primeng/panel';

import { MiembroComponent } from './miembro/miembro.component';
import { MonitorComponent } from './monitor/monitor.component';
import { PostulantesComponent } from './postulantes/postulantes.component';
@NgModule({
    declarations: [
        FuenteProyectoComponent,
        TipoProyectoComponent,
        EstadoProyectoComponent,
            EvaluadoresProyectoComponent,
            ConvocatoriaComponent,
            MiembroComponent,
            MonitorComponent,
        PostulantesComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
        HynotechModule,
        ReactiveFormsModule,
        UiSwitchModule,

        MantenimientoRoutingModule,

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
        ButtonModule
        // AppRoutingModule
    ],
    providers: [
        NgbActiveModal
    ]
})
export class MantenimientoModule {

    constructor(
        private queryInvestigacionService: QueryInvestigacionServices,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}

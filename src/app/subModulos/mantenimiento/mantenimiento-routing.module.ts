import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstadoProyectoComponent } from './estado-proyecto/estado-proyecto.component';
import { TipoProyectoComponent } from './tipo-proyecto/tipo-proyecto.component';
import { FuenteProyectoComponent } from './fuente-proyecto/fuente-proyecto.component';
import { EvaluadoresProyectoComponent } from './evaluadores-proyecto/evaluadores-proyecto.component';
import {ConvocatoriaComponent} from './convocatoria/convocatoria.component';
import {MiembroComponent} from './miembro/miembro.component';
import {MonitorComponent} from './monitor/monitor.component';
import { PostulantesComponent } from './postulantes/postulantes.component';

const routes: Routes = [
  {
      path: 'tipo_proyecto',
      component: TipoProyectoComponent,
  },
  {
      path: 'estado_proyecto',
      component: EstadoProyectoComponent,
  },
    {
        path: 'fuente_proyecto',
        component: FuenteProyectoComponent,
    },
    {
        path: 'evaluadores_proyecto',
        component: EvaluadoresProyectoComponent,
    },
    {
        path: 'evaluadores_proyecto',
        component: MonitorComponent,
    },
    {
        path: 'convocatoria',
        component: ConvocatoriaComponent,
    },
    {
        path: 'miembro',
        component: MiembroComponent,
    },
    {
        path: 'monitor',
        component: MonitorComponent,
    },
    {
        path: 'postulantes',
        component: PostulantesComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MantenimientoRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ProyectoComponent} from './proyecto/proyecto.component';
import {ProgramacionTecnicaComponent} from './programacion-tecnica/programacion-tecnica.component';
import {HitoComponent} from './hito/hito.component';
import {IndicadorHitoComponent} from './indicador-hito/indicador-hito.component';
import {DistribucionPresupuestoComponent} from '../presupuesto/distribucion-presupuesto/distribucion-presupuesto.component';
import {CronogramaTecnicoComponent} from '../presupuesto/cronograma-tecnico/cronograma-tecnico.component';
import {FinanciableComponent} from '../presupuesto/financiable/financiable.component';

const routes: Routes = [
    {
        path: 'datos_proyecto',
        component: ProyectoComponent,
    },
    {
        path: 'hito_proyecto',
        component: HitoComponent,
    },
    {
        path: 'progTec_proyecto',
        component: ProgramacionTecnicaComponent,
    },
    {
        path: 'indicador_hito_proyecto',
        component: IndicadorHitoComponent,
    },
    {
        path: 'distribucion_presupuesto',
        component: DistribucionPresupuestoComponent,
    },
    {
        path: 'cronograma_tecnico',
        component: CronogramaTecnicoComponent,
    },
    {
        path: 'financiable',
        component: FinanciableComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProyectoRoutingModule { }

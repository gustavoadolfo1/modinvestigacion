import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DistribucionPresupuestoComponent } from './distribucion-presupuesto/distribucion-presupuesto.component';
import { CronogramaTecnicoComponent } from './cronograma-tecnico/cronograma-tecnico.component';
import {ProyectoModule} from '../proyecto/proyecto.module';
import { FinanciableComponent } from './financiable/financiable.component';
const routes: Routes = [

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

    imports: [RouterModule.forChild(routes), ProyectoModule],
    exports: [RouterModule]

})
export class PresupuestoRoutingModule { }

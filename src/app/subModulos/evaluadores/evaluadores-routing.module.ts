import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParesEvaluadoresComponent } from './pares-evaluadores/pares-evaluadores.component';
import { MenuComponent } from './menu/menu.component';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import { ResumenComponent } from './resumen/resumen.component';
import { PropuestasComponent } from './propuestas/propuestas.component';

const routes: Routes = [

   {
        path: 'pares_evaluadores',
        component: ParesEvaluadoresComponent,
    },
    {
        path: 'menu',
        component: MenuComponent ,
    },
    {
        path: 'evaluacion',
        component: EvaluacionComponent,
    },
    {
        path: 'resumen',
        component: ResumenComponent,
    },
    {
        path: 'propuestas',
        component: PropuestasComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EvaluadoresRoutingModule { }

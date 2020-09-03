import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {InformesComponent} from './informes/informes.component';
import {InformeHitoComponent} from './informe-hito/informe-hito.component';
import {InformeTecnicoComponent} from './informe-tecnico/informe-tecnico.component';


const routes: Routes = [
    {
        path: 'informe_final',
        component: InformesComponent,
    },
    {
        path: 'informe_hito',
        component: InformeHitoComponent,
    },
    {
        path: 'informe_tecnico',
        component: InformeTecnicoComponent,
    }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformesRoutingModule { }

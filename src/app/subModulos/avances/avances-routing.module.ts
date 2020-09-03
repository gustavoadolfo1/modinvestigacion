import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AvanceTecnicoComponent} from './avance-tecnico/avance-tecnico.component';


const routes: Routes = [
    {
        path: 'avance_tecnico',
        component: AvanceTecnicoComponent,
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvancesRoutingModule { }

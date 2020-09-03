import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MonitoresProyectoComponent} from './monitores-proyecto/monitores-proyecto.component';


const routes: Routes = [
    {
        path: 'monitor_proyecto',
        component: MonitoresProyectoComponent,
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonitorRoutingModule { }

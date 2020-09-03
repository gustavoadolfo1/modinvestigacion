import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ReportesComponent} from './reportes/reportes.component';
import {NotificacionComponent} from './notificacion/notificacion.component';


const routes: Routes = [
    {
        path: 'reportes',
        component: ReportesComponent,
    },
    {
        path: 'notificaciones',
        component: NotificacionComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {GastosComponent} from './gastos/gastos.component';


const routes: Routes = [
    {
        path: 'gasto_proyecto',
        component: GastosComponent,
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GastosRoutingModule { }

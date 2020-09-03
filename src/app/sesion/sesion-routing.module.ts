import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InicioComponent} from './components/inicio/inicio.component';
import {OlvidadoComponent} from './components/olvidado/olvidado.component';
import {CambioPwdComponent} from './components/cambio-pwd/cambio-pwd.component';


const routes: Routes = [
    { path: 'inicio', component: InicioComponent},
    { path: 'olvidado/:dni/:token', component: OlvidadoComponent},
    { path: 'olvidado', component: OlvidadoComponent},
    { path: 'cambio-pwd', component: CambioPwdComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SesionRoutingModule { }

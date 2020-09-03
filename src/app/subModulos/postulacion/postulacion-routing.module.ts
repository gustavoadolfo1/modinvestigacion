import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConvocatoriasComponent } from './convocatorias/convocatorias.component';
import { ListasComponent } from './listas/listas.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
      path: 'convocatorias',
      component: ConvocatoriasComponent,
   },
    {
        path: 'listas',
        component: ListasComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
];

@NgModule({

    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],


})
export class PostulacionRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SesionRoutingModule } from './sesion-routing.module';
import { InicioComponent } from './components/inicio/inicio.component';
import { OlvidadoComponent } from './components/olvidado/olvidado.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HynotechModule} from '../hynotech/hynotech.module';
import {SharedComponentsModule} from '../shared/components/shared-components.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CambioPwdComponent} from './components/cambio-pwd/cambio-pwd.component';



@NgModule({
  declarations: [InicioComponent, OlvidadoComponent, CambioPwdComponent],
    imports: [
        CommonModule,
        SesionRoutingModule,
        ReactiveFormsModule,
        HynotechModule,
        SharedComponentsModule,
        NgbModule
    ]
})
export class SesionModule { }

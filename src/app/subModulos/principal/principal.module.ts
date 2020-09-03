import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PrincipalRoutingModule } from './principal-routing.module';
import {interval, Subscription} from 'rxjs';
import {DataServices} from '../../servicios/data.services';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';
import {SearchService} from '../../shared/services/search.service';
import {Router} from '@angular/router';
import {FrmRegistroModalComponent} from './principal/frm-registro-modal/frm-registro-modal.component';
import {HynotechModule} from '../../hynotech/hynotech.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgxPaginationModule} from 'ngx-pagination';
import {HynotechExtraModule} from '../../Partials/hynotech/hynotechExtra.module';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {MatToolbarModule} from '@angular/material';
import {QueryServices} from '../../servicios/query.services';
import {GlobalModule} from '../../global/global.module';
import {TagInputModule} from 'ngx-chips';
import {ButtonModule} from 'primeng/button';
import {CardModule, CarouselModule, PanelModule, TabViewModule} from 'primeng';

import {CurriculumComponent} from './curriculum/curriculum.component';
import {PrincipalComponent} from './principal/principal.component';
import { GestionComponent } from './gestion/gestion.component';
@NgModule({
    declarations: [
        FrmRegistroModalComponent,
        PrincipalComponent,
        GestionComponent,
        CurriculumComponent

    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrincipalRoutingModule,
        HynotechModule,
        NgbModule,
        NgSelectModule,
        NgxPaginationModule,
        HynotechExtraModule,
        MDBBootstrapModule,
        SharedComponentsModule,
        MatToolbarModule,
        GlobalModule,
        TagInputModule,
        ButtonModule,
        CardModule,
        CarouselModule,
        TabViewModule,
        PanelModule
    ],
    entryComponents: [
        FrmRegistroModalComponent
    ]

})
export class PrincipalModule {
    suscripcionDatosMostrar: Subscription;
    constructor(
        private _dataService: DataServices,
        private queryInvestigacionService: QueryInvestigacionServices,
        public searchService: SearchService,
        private router: Router,
    ) {
        queryInvestigacionService.actualizarDataService();
    }
}


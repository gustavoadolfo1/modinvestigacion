import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {PrincipalComponent} from './principal/principal.component';
import {GestionComponent} from './gestion/gestion.component';
import {CurriculumComponent} from './curriculum/curriculum.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalComponent,
    },
    {
        path: 'gestion',
        component: GestionComponent,
    },
    {
        path: 'curriculum',
        component: CurriculumComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PrincipalRoutingModule {
}

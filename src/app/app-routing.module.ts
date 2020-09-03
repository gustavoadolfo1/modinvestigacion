import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthLayoutComponent} from './shared/components/layouts/auth-layout/auth-layout.component';
import {AuthGaurd} from './shared/services/auth.gaurd';
import {BlankLayoutComponent} from './shared/components/layouts/blank-layout/blank-layout.component';
import {AdminLayoutSidebarLargeComponent} from './shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component';
import {WithHeaderComponent} from './hynotech/layouts/with-header/with-header.component';
import {RegisterComponent} from './register/register.component';

const moduleRoutes: Routes = [
    {
        path: 'investigacion',
        loadChildren: () => import('./subModulos/principal/principal.module').then(m => m.PrincipalModule)
    },
    {
        path: 'proyecto',
        loadChildren: () => import('./subModulos/proyecto/proyecto.module').then(m => m.ProyectoModule)
    },
    {
        path: 'mantenimiento',
        loadChildren: () => import('./subModulos/mantenimiento/mantenimiento.module').then(m => m.MantenimientoModule)
    },
    {
        path: 'presupuesto',
        loadChildren: () => import('./subModulos/presupuesto/presupuesto.module').then(m => m.PresupuestoModule)
    },
    {
        path: 'gastos',
        loadChildren: () => import('./subModulos/gastos/gastos.module').then(m => m.GastosModule)
    },
    {
        path: 'avances',
        loadChildren: () => import('./subModulos/avances/avances.module').then(m => m.AvancesModule)
    },
    {
        path: 'evaluadores',
        loadChildren: () => import('./subModulos/evaluadores/evaluadores.module').then(m => m.EvaluadoresModule)
    },
    {
        path: 'monitores',
        loadChildren: () => import('./subModulos/monitores/monitor.module').then(m => m.MonitorModule)
    },
    {
        path: 'informes',
        loadChildren: () => import('./subModulos/informes/informes.module').then(m => m.InformesModule)
    },
    {
        path: 'reportes',
        loadChildren: () => import('./subModulos/reportes/reportes.module').then(m => m.ReportesModule)
    },
    {
        path: 'postulacion',
        loadChildren: () => import('./subModulos/postulacion/postulacion.module').then(m => m.PostulacionModule)
    },
];

const routes: Routes = [

    { path: 'register', component: RegisterComponent },

    {
        path: '',
        redirectTo: 'investigacion',
        pathMatch: 'full'
    },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'sesion',
                loadChildren: () => import('./sesion/sesion.module').then(m => m.SesionModule)
            }
        ]
    },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'sessions',
                loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
            }
        ]
    },
    {
        path: '',
        component: WithHeaderComponent,
        children: [
            {
                path: 'e',
                loadChildren: () => import('./subModulos/postulacion/postulacion.module').then(m => m.PostulacionModule)
            }
        ]
    },
    {
        path: '',
        component: BlankLayoutComponent,
        children: [
            {
                path: 'others',
                loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule)
            }
        ]
    },
    {
        path: '',
        component: AdminLayoutSidebarLargeComponent,
        // component: AdminLayoutSidebarCompactComponent,
        canActivate: [AuthGaurd],
        children: moduleRoutes
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
})
export class AppRoutingModule {
}

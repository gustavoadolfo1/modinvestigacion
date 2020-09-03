import {Injectable, NgZone} from '@angular/core';
import { LocalStoreService } from './local-store.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ToastrService  } from 'ngx-toastr';
import {DataServices} from '../../servicios/data.services';
import {QueryServices} from '../../servicios/query.services';
import {environment} from '../../../environments/environment';
import {ConstantesService} from '../../servicios/constantes.service';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Only for demo purpose
    authenticated = false;
    private baseUrl;

    constructor(
        private _dataService: DataServices,
        private queryTramitesService: QueryServices,
        private queryInvestigacionServices: QueryInvestigacionServices,

        private store: LocalStoreService,
        private router: Router,

        private api: ApiService,
        private toastr: ToastrService,

        private constantes: ConstantesService,
    ) {
        this.baseUrl = environment.urlAPI;
        this.checkAuth();
    }

    checkAuth() {
        this.authenticated = this.store.getItem('unamToken');
    }

    getuser() {
        return of({});
    }

    signin(credentials) {
        this.api.getUser(credentials)
            .subscribe(
                async data => {
                    if (data['access_token']) {
                        this.authenticated = true;
                        this.store.setItem('unamToken', data);

                        this.api.getProfile().subscribe(dataUser => {
                            this.store.setItem('userInfo', dataUser);
                        });
                        await this.queryInvestigacionServices.obtenerCredencial();
                        switch (this.constantes.tipoSistemaLogin) {
                            case 'dependencias':
                                const ofSeleccionada = this._dataService.getOption().oficinas_usuario.find(item => item.iDepenId === credentials.dependencia);
                                // console.log(ofSeleccionada);

                                this._dataService.setOption('ofSeleccionada', ofSeleccionada);
                                // tslint:disable-next-line:radix
                                this.store.setItem('ofsel', parseInt(ofSeleccionada.iDepenId));
                                break;
                            case 'perfiles':
                                if (this._dataService.getOption().oficinas_usuario.length > 0) {
                                    // tslint:disable-next-line:no-shadowed-variable
                                    const ofSeleccionada = this._dataService.getOption().oficinas_usuario; // .find(item => item.iDepenId === credentials.dependencia);
                                    this._dataService.setOption('ofSeleccionada', ofSeleccionada[0]);
                                    // tslint:disable-next-line:radix
                                    this.store.setItem('ofsel', parseInt(ofSeleccionada[0].iDepenId));
                                    // tslint:disable-next-line:radix
                                    this.store.setItem('perfilSeleccionado', parseInt(credentials.perfil));
                                } else {
                                    this.store.setItem('ofsel', '');
                                }
                                break;
                        }

                        this._dataService.getIp();
                    } else {
                        this.authenticated = false;
                        this.store.setItem('unamToken', true);
                    }
                },
                error => {
                    this.toastr.error('Acceso Denegado!', 'Verifica tu usuario y contraseña!');

                }
            );
        // console.log('SALIENDO');

        return of({}).pipe(delay(3000));
    }

    signout() {
        this.authenticated = false;
        this.store.setItem('unamToken', false);
        // this.router.navigateByUrl('/sessions/signin');
        this.router.navigateByUrl('/sesion/inicio');
    }





}

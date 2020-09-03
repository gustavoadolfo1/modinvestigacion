import { Component, OnInit } from '@angular/core';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { Router, RouteConfigLoadStart, ResolveStart, RouteConfigLoadEnd, ResolveEnd } from '@angular/router';
import {QueryServices} from '../../../servicios/query.services';
import {DataServices} from '../../../servicios/data.services';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../../environments/environment';
import {valueReferenceToExpression} from '@angular/compiler-cli/src/ngtsc/annotations/src/util';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    animations: [SharedAnimations]
})
export class SigninComponent implements OnInit {
    loading: boolean;
    loadingText: string;
    signinForm: FormGroup;
    usuario: string;
    clave: string;

    tipoUsuario = 0 ;
    dependenciasServ;
    dependencia;
    conDependencia;
    mostrarConDependencia: boolean;

    constructor(
        private _dataService: DataServices,
        private queryTramitesService: QueryServices,
        private toastr: ToastrService,

        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {

    }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
                this.loadingText = 'Cargando bandeja...';
                this.loading = true;
            }
            if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
                this.loading = false;
            }
        });

        this.signinForm = this.fb.group({
            usuario: [this.usuario, Validators.required],
            dependencia: [this.dependencia, Validators.required],
            password: [this.clave, Validators.required],
            conDependencia: [this.conDependencia, Validators.required],
            tipoUsuario: [this.tipoUsuario, Validators.required]
        });

        if (localStorage.getItem('usuario')) {
            this.signinForm.controls.usuario.setValue(localStorage.getItem('usuario'));
            localStorage.removeItem('usuario');
            this.verAreasCredencial();
        }
        this.mostrarConDependencia = false;
    }

    signin() {

        console.log(this.signinForm.value);
        console.warn(this.signinForm.valid);
        if (!this.signinForm.valid) {
            let msgFinal = '';
            if (!this.signinForm.get('dependencia').valid) {
                msgFinal += 'Su cuenta no esta asociada a ninguna dependencia.';
            }
            this.toastr.error('Debe completar todos los campos de acceso. ' + msgFinal, 'Faltan Datos!');
            return false;
        }
        this.loading = true;
        this.loadingText = 'Ingresando...';
        this.auth.signin(this.signinForm.value)
            .subscribe(res => {

                for (const ofi of this.dependenciasServ) {
                    if (ofi.iDepenId == this.signinForm.get('dependencia').value) {
                        // this._dataService.setOption('ofSeleccionada', ofi);
                        // localStorage.setItem('ofsel', ofi.iDepenId);
                        break;
                    }
                }

                if (localStorage.getItem('unamToken') && JSON.parse(localStorage.getItem('unamToken'))['access_token'] ) {
                    this.queryTramitesService.datosTramitesServidor({
                        tipo: 'verificarCambioContraseña',
                        data: [this.signinForm.get('usuario').value]
                    }).subscribe(resSu => {
                        if (!resSu['cambiado']) {
                            this.router.navigateByUrl('investigacion');
                            return false;
                        } else {
                            this.router.navigateByUrl('investigacion');
                        }
                    });
                }


                this.loading = false;
            });
    }

    async verAreasCredencial() {
        this.dependenciasServ = [];
        this.signinForm.get('dependencia').reset();
        const credencialUsuario = this.signinForm.get('usuario').value;
        // console.log(credencialUsuario);
        // return false;

        if (credencialUsuario.length == 8) {

            const dataCredencial = await this.queryTramitesService.datosServidorAsync({
                tipo: 'credenciales',
                data: [credencialUsuario]
            }, true).catch(err => {
                console.log(err);
                localStorage.setItem('usuario', this.signinForm.controls.usuario.value);
                localStorage.setItem('intranet', '0');
                window.location.reload();

            });
            console.log(dataCredencial);
            // return false;
            // @ts-ignore
            if (dataCredencial.length > 0) {
                const dataDependencias = await this.queryTramitesService.datosServidorAsync({
                    tipo: 'data_oficinas_usuario',
                    data: [dataCredencial[0].iCredId]
                }, true);
                // @ts-ignore
                if (dataDependencias.length > 0) {
                    this.dependenciasServ = dataDependencias;
                    this._dataService.setOption('oficinas_usuario', dataDependencias);
                    this.signinForm.get('dependencia').setValue(dataDependencias[0].iDepenId);
                }
            }
        } else {
            console.log('no es credencial valida');
        }
    }


    async llamarAccion(data) {
        switch (data[0]) {
            case 'conDependencia':
                this.mostrarConDependencia = true;
                this.signinForm.get('tipoUsuario').setValue('0');
                break;
            case 'sinDependencia':
                this.mostrarConDependencia = false;
                this.signinForm.get('dependencia').setValue('0');
                break;
        }
    }
}

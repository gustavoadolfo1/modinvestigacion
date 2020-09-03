import { Component, OnInit } from '@angular/core';
import {SharedAnimations} from '../../../shared/animations/shared-animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../../../shared/services/auth.service';
import {ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router} from '@angular/router';
import {SesionService} from '../../../sesion/services/sesion.service';
import {environment} from '../../../../environments/environment';
import {ConstantesService} from '../../../servicios/constantes.service';
import swal from "sweetalert2";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
    animations: [SharedAnimations]
})
export class LoginComponent implements OnInit {
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };

    tipoSistemaLogin: string;

    loading: boolean;
    loadingText: string;
    signinForm: FormGroup;
    usuario: string;
    clave: string;
    show: any = true;

    dependenciasServ;
    dependencia;

    credencialActual;
    frmEstadoProyecto: FormGroup;
    enviandoFormulario = false;

    get frmSignInControl() {
        return this.signinForm.controls;
    }

    constructor(
        private modalService: NgbModal,
        private queryInvestigacion: QueryInvestigacionServices,
        private sesionService: SesionService,
        private _dataService: DataServices,
        private toastr: ToastrService,

        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,

        private constantes: ConstantesService,
    ) {
        this.tipoSistemaLogin = constantes.tipoSistemaLogin;
    }
    get frmEstadoProyectoControl() {
        return this.frmEstadoProyecto.controls;
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
        this.iniciarFrm();
    }

    iniciarFrm() {
        switch (this.tipoSistemaLogin) {
            case 'dependencias':
                this.signinForm = this.fb.group({
                    usuario: [this.usuario, Validators.required],
                    dependencia: [this.dependencia, Validators.required],
                    password: [this.clave, Validators.required]
                });

                if (localStorage.getItem('usuario')) {
                    this.signinForm.controls.usuario.setValue(localStorage.getItem('usuario'));
                    localStorage.removeItem('usuario');
                    this.verAreasCredencial();
                }
                break;
            case 'perfiles':
                this.signinForm = this.fb.group({
                    usuario: [this.usuario, Validators.required],
                    perfil: [null, Validators.required],
                    modulo: [null, Validators.required],
                    password: [this.clave, Validators.required]
                });

                if (localStorage.getItem('usuario')) {
                    this.signinForm.controls.usuario.setValue(localStorage.getItem('usuario'));
                    localStorage.removeItem('usuario');
                    this.verAreasCredencial();
                }
                break;
            default:
                this.signinForm = this.fb.group({
                    usuario: [this.usuario, Validators.required],
                    password: [this.clave, Validators.required]
                });
                break;
        }
    }

    signin() {
        if (!this.signinForm.valid) {
            let msgFinal = '';
            if (this.tipoSistemaLogin != 'dependencias' && !this.signinForm.get('dependencia').valid) {
                msgFinal += 'Su cuenta no esta asociada a ninguna dependencia.';
            }
            this.toastr.error('Debe completar todos los campos de acceso. ' + msgFinal, 'Faltan Datos!');
            return false;
        }
        this.loading = true;
        this.loadingText = 'Ingresando...';
        this.auth.signin(this.signinForm.value)
            .subscribe(res => {
                switch (this.constantes.tipoSistemaLogin) {
                    case 'dependencias':
                        for (const ofi of this.dependenciasServ) {
                            if (ofi.iDepenId == this.signinForm.get('dependencia').value) {
                                break;
                            }
                        }
                        break;
                    case 'perfiles':
                        break;
                }

                if (localStorage.getItem('unamToken') && JSON.parse(localStorage.getItem('unamToken'))['passSameToUser'] ) {
                    this.router.navigateByUrl('/sesion/cambio-pwd');
                    return false;
                } else {
                    this.router.navigateByUrl('investigacion');
                }


                this.loading = false;
            }, err => {
                console.log('ERROR LOGIN');
            });
    }

    async verAreasCredencial() {
        const credencialUsuario = this.signinForm.get('usuario').value;

        switch (this.tipoSistemaLogin) {
            case 'dependencias':
                this.dependenciasServ = [];
                this.signinForm.get('dependencia').reset();
                // console.log(credencialUsuario);
                // return false;

                if (credencialUsuario.length == 8) {

                    const dataCredencial = await this.sesionService.datosServidorAsync({
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
                        const dataDependencias = await this.sesionService.datosServidorAsync({
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
                break;
            case 'perfiles':
                // console.log(credencialUsuario);
                // return false;

                if (credencialUsuario.length == 8) {
                    const dataCredencial = await this.sesionService.dServidorAsync('credenciales', {
                        modulo: 'INV',
                        data: [credencialUsuario]
                    }, true).catch(error => {
                        if (error.status == 404 && localStorage.getItem('intranet') == '0') {
                            swal.fire({
                                title: '¿Continuar?',
                                html: 'No se puede conectar con el servidor, por favor revise su conexion.',
                                type: 'error',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Reintentar',
                                cancelButtonText: 'Cancelar'
                            }).then((result) => {
                                if (!result.dismiss) {
                                    localStorage.setItem('intranet', '1');
                                    localStorage.setItem('usuario', this.signinForm.controls.usuario.value);
                                    window.location.reload();
                                }
                            });
                        } else {
                            if ([500, 503].includes(error.status)) {
                                this._dataService.mensajeError(error);
                            } else {
                                localStorage.setItem('intranet', '0');
                                localStorage.setItem('usuario', this.signinForm.controls.usuario.value);
                                window.location.reload();
                            }
                        }
                    });
                    this.credencialActual = dataCredencial;
                    this.frmSignInControl.perfil.setValue(this.credencialActual.perfiles[0].iPerfilId);
                    this.frmSignInControl.modulo.setValue(this.credencialActual.modulo.iModuloId);
                    this._dataService.setOption('oficinas_usuario', this.credencialActual.oficinas);
                    this._dataService.setOption('infoLogin', dataCredencial);
                } else {
                    console.log('no es credencial valida');
                }
                break;
            default:
                break;
        }
    }

    async llamarAccion(data) {
        switch (data[0]) {
            case 'nuevo':
                 this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
               // this.imprimir.modalPreTitulo = 'Nueva Estado de Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
             //   this.imprimir.modalPreTitulo = 'Editar Estado de Proyecto | ';
               this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_estado_proyecto',
                    data: [data[2].iEstadoProyectoId]
                });
                // @ts-ignore
                if (!retorno.error) {
                   // this.cargarLista();
                }
                break;
        }
    }
    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_estado_proyecto':
                frmTratarControl = this.frmEstadoProyectoControl;
                frmTratar = this.frmEstadoProyecto;
                break;
        }

        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            // console.warn(this._dataService.getOption().credencialActual.iCredId);
            // console.warn(frmTratarControl);

            this.enviandoFormulario = true;
            if (frmTratar.invalid) {
                // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                await swal.fire({
                    title: 'Error:',
                    text: 'Faltan datos en el formulario. por favor verifique',
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                this.enviandoFormulario = false;
                return false;
            } else {
                const retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: tipo_form,
                    data: frmTratar.value
                });
                // @ts-ignore
                if (!retorno.error) {

               /////     this.cargarLista();
                    this.limpiarFormulario();
                    // this.modalActivo.close();
                    this.modalService.dismissAll();
                }
            }
            this.enviandoFormulario = false;
        }
    }
    limpiarFormulario(data: any = false) {
        // this.frmEstadoProyectoControl.descripcion.reset(data ? data.cEstadoProyDescripcion : '');
        // this.frmEstadoProyectoControl.detalle.reset(data ? data.cEstadoProyDetalle : '');

        //this.frmEstadoProyectoControl.idEstadoProy.reset(data ? data.iEstadoProyectoId : '');
    }
    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }

}

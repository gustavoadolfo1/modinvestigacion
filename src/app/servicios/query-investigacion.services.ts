import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LocalStoreService} from '../shared/services/local-store.service';
import {environment} from '../../environments/environment';
import swal from 'sweetalert2';
import {DataServices} from './data.services';
import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {interval, Subscription} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class QueryInvestigacionServices {
    suscripcionDatosMostrar: Subscription;

    private baseUrl;
    headers: any;
    token: any;
    ls = window.localStorage;
    httpOptions: any;

    constructor(
        private http: HttpClient,
        private store: LocalStoreService,
        private _dataService: DataServices,
        private router: Router
    ) {
        this.baseUrl = environment.urlAPI;
    }

    insertHead(archivo = false) {
        this.ls.getItem('unamToken');
        const data = this.store.getItem('unamToken');
        this.token = data['access_token'];
        if (data['access_token']) {
            if (archivo) {
                this.httpOptions = {
                    headers: new HttpHeaders({
                        'Authorization': 'Bearer ' + this.token
                    })
                };
            } else {
                this.httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.token
                    })
                };
            }

        }
    }
//////////////////////////////////////////////////
    getRutaResponse(ruta, data) {
        return this.http.post(`${this.baseUrl}/${ruta}`, data, this.httpOptions);
    }
/////////////////////////////////////////////////////////////////////

    datosPideServidor(tipo, persona_id, data, anonimo = false) {
        if (!anonimo){
            this.insertHead();
        }
        console.log('cargando pide');
        return this.http.post(`${this.baseUrl}/pide/${tipo}/${persona_id}`, data, this.httpOptions);
    }
//leer data
    datosInvestigacionServidor(data, anonimo = false, headers = true) {
        // console.log(headers);
        if (anonimo) {
            return this.http.post(`${this.baseUrl}/inv/dataexistenteAnonimo`, data);
        }
        if (headers) {
            this.insertHead();
            return this.http.post(`${this.baseUrl}/inv/dataexistente`, data, this.httpOptions);
        } else {
            return this.http.post(`${this.baseUrl}/inv/dataexistente`, data);
        }
    }

    async datosInvestigacionServidorAsync(data, anonimo = false, headers = true) {
        return await this.datosInvestigacionServidor(data, anonimo, headers).toPromise();
    }
//enviar o guardar
    datosInvestigacionEnviarServidor(data) {
           this.insertHead();
           return this.http.post(`${this.baseUrl}/inv/guardar`, data, this.httpOptions);
    }


    ////////////////////////////////////////////////////////////////////
    async datosPideServidorAsync(tipo, persona_id, data) {
        return await this.datosPideServidor(tipo, persona_id, data).toPromise();
    }
////////////////////////////////////////

    async datosServidorAsync(data, anonimo = false, headers = true) {
        return await this.datosInvestigacionServidor(data, anonimo, headers).toPromise();
    }
//guardar
    async enviaranonimo(data) {
        // console.log('datacc'+data)
        const dataRetorno = await this.http.post(`${this.baseUrl}/inv/guardarAnonimo`, data, this.httpOptions).toPromise();
        if (dataRetorno['error']) {
            await swal.fire({
                title: 'Error:',
                text: dataRetorno['msg'],
                type: 'error',
                confirmButtonText: 'Verificar',
            });
            // return false;
        }
        else {
            let timerInterval;
            swal.fire({
                title: 'Guardado Correctamente:',
                html: dataRetorno['msg'] + '<br> Se cerrara en <strong> X </strong> segundos.',
                type: 'success',
                timer: 2000,
                onBeforeOpen: () => {
                    swal.showLoading();
                    timerInterval = setInterval(() => {
                        const impr = Math.ceil((swal.getTimerLeft() / 1000));
                        swal.getContent().querySelector('strong').textContent = String(impr);
                    }, 100);
                },
                onClose: () => {
                    clearInterval(timerInterval);
                }
            })/*.then((result) => {
              if (
                  // Read more about handling dismissals
                  result.dismiss === swal.DismissReason.timer
              ) {
                  retorno = {error: false, msg: dataRetorno['msg'], };

              }
          })*/;
        }
        return dataRetorno;
    }
    async guardarDatosAsync(data) {
        // console.log('datacc'+data)
        const dataRetorno = await this.datosInvestigacionEnviarServidor(data).toPromise();

        if (dataRetorno['error']) {
            await swal.fire({
                title: 'Error:',
                text: dataRetorno['msg'],
                type: 'error',
                confirmButtonText: 'Verificar',
            });
            // return false;
        }
        else {
            let timerInterval;
            swal.fire({
                title: 'Guardado Correctamente:',
                html: dataRetorno['msg'] + '<br> Se cerrara en <strong> X </strong> segundos.',
                type: 'success',
                timer: 2000,
                onBeforeOpen: () => {
                    swal.showLoading();
                    timerInterval = setInterval(() => {
                        const impr = Math.ceil((swal.getTimerLeft() / 1000));
                        swal.getContent().querySelector('strong').textContent = String(impr);
                    }, 100);
                },
                onClose: () => {
                    clearInterval(timerInterval);
                }
            })/*.then((result) => {
              if (
                  // Read more about handling dismissals
                  result.dismiss === swal.DismissReason.timer
              ) {
                  retorno = {error: false, msg: dataRetorno['msg'], };

              }
          })*/;
        }
        return dataRetorno;
    }
    /*   */
    async eliminarDatosAsync(data, mensaje = '') {
        return await swal.fire({
            title: '¿Continuar?',
            html: (mensaje != '' ? mensaje : 'Se eliminara el item Seleccionado.') + '<br> <b>¿Desea continuar?</b>',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (!result.dismiss) {
                return this.guardarDatosAsync(data);
            }
        });
    }

    async obtenerCredencial() {
        // console.log('Entro a Async');
        const dataAcceso = await this.datosServidorAsync({tipo: 'data_credencial', data: []}).catch(err => {
            if (err.status) {
                localStorage.clear();
                localStorage.setItem('intranet', '1');
                this.router.navigateByUrl('sesion/inicio');
                return false;
            }
        });
        this._dataService.setOption('credencialActual', dataAcceso[0]);

        const dataCredencial = await this.dApiGeneralesAsync('credenciales', {modulo: 'INV', data: []}).catch(err => {
            if (err.status) {
                localStorage.clear();
                localStorage.setItem('intranet', '1');
                this.router.navigateByUrl('sesion/inicio');
                return false;
            }
        });
        this._dataService.setOption('infoLogin', dataCredencial);
        return true;
    }
    async enviarArchivo(tipo, formGroup: FormGroup, formControlNames = [], extras: object) {
        const formDataEnv: FormData = new FormData();
        formDataEnv.append('tipo', tipo);

        Object.keys(formGroup.controls).forEach(key => {
            if (formControlNames.includes(key)) {
                // if (key == 'archivo') {
                // console.log(formGroup.controls[key]);
                if (formGroup.controls[key].value  && formGroup.controls[key].value[0] !== null ){
                    // console.log(formGroup.controls[key].value);
                    if (formGroup.controls[key].value[0] && formGroup.controls[key] && formGroup.controls[key] !== null
                        && formGroup.controls[key].value !== '' && formGroup.controls[key].value[0] !== 's'){
                        // console.log(formGroup.controls[key].value[0]);
                        const arch: File = formGroup.controls[key].value[0];

                        formDataEnv.append(key, arch, arch.name);
                    }
                }

            }
        });
        formDataEnv.append('data', JSON.stringify(extras));
        this.insertHead(true);
        const dataRetorno = await this.http.post(`${this.baseUrl}/inv/guardarArchivo`, formDataEnv, this.httpOptions).toPromise();

        // console.log(dataRetorno);
        // console.log(dataRetorno['error']);
        if (dataRetorno['error']) {
            await swal.fire({
                title: 'Error:',
                text: dataRetorno['msg'],
                type: 'error',
                confirmButtonText: 'Verificar',
            });
            // return false;
        }
        else {
            let timerInterval;
            swal.fire({
                title: 'Guardado Correctamente:',
                html: dataRetorno['msg'] + '<br> Se cerrara en <strong> X </strong> segundos.',
                type: 'success',
                timer: 2000,
                onBeforeOpen: () => {
                    swal.showLoading();
                    timerInterval = setInterval(() => {
                        const impr = Math.ceil((swal.getTimerLeft() / 1000));
                        swal.getContent().querySelector('strong').textContent = String(impr);
                    }, 100);
                },
                onClose: () => {
                    clearInterval(timerInterval);
                }
            });
            /*.then((result) => {
              if (
                  // Read more about handling dismissals
                  result.dismiss === swal.DismissReason.timer
              ) {
                  retorno = {error: false, msg: dataRetorno['msg'], };

              }
          })*/
        }
        return dataRetorno;
    }
    /*  */

    async obtenerOficinasCredencial() {
        if (!this._dataService.getOption().credencialActual.iCredId) {
            await this.obtenerCredencial();
        }
        const data = await this.datosServidorAsync({
            tipo: 'data_oficinas_usuario_dgi',
            data: [this._dataService.getOption().credencialActual.iCredId]
        });
        this._dataService.setOption('oficinas_usuario', data);
        // console.log('obtenerOficinasCredencial');
        // console.log(this._dataService);
        return true;
    }

    async oficinaSeleccionada() {
        if (!this._dataService.getOption().oficinas_usuario) {
            await this.obtenerOficinasCredencial();
        }
        if (!localStorage.getItem('ofsel')) {
            // tslint:disable-next-line:radix
            this.store.setItem('ofsel', parseInt(this._dataService.getOption().oficinas_usuario[0].iDepenId));
        }
        // const ofSeleccionada = this._dataService.getOption().oficinas_usuario.find(item => item.iDepenId === localStorage.getItem('ofsel'));
        const ofSeleccionada = this._dataService.getOption().oficinas_usuario.find(item => item.iDepenId == localStorage.getItem('ofsel'));
        this._dataService.setOption('ofSeleccionada', ofSeleccionada);
        return true;
    }

    getConfiguracion(data) {
        return this.http.post(`${this.baseUrl}/grl/configuracion`, data);
    }

    actualizarDataService(){
        if (!localStorage.getItem('unamToken')) {
            // localStorage.clear();
            localStorage.removeItem('ofsel');
            localStorage.removeItem('unamToken');
            localStorage.setItem('intranet', '1');
            // this.router.navigateByUrl('sessions/signin');
            this.router.navigateByUrl('/sesion/inicio');
        } else {
            if (JSON.parse(localStorage.getItem('unamToken'))['access_token']) {

                if (!this._dataService.getOption().credencialActual.iCredId) {
                    this.obtenerCredencial();
                }
                if (!this._dataService.getOption().oficinas_usuario) {
                    this.suscripcionDatosMostrar = interval(3000).subscribe(val => {
                        if (!this._dataService.getOption().ofSeleccionada) {
                            this.oficinaSeleccionada();
                        } else {
                            // tslint:disable-next-line:no-unused-expression
                            this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
                        }
                        if (val >= 20) {
                            // tslint:disable-next-line:no-unused-expression
                            this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
                        }
                    });
                    this._dataService.getIp();
                }
                this.getConfiguracion({}).subscribe(data => {
                    this._dataService.setOption('config', data);
                });

            } else {
                localStorage.clear();
                this.router.navigateByUrl('sesion/inicio');
            }
        }
    }


    /* Generales */
    dApiGenerales(tipo, data, anonimo = false, headers = true) {
        if (anonimo) {
            return this.http.post(`${this.baseUrl}/grl/dataexistenteAnonimo/${tipo}`, data);
        }
        if (headers) {
            this.insertHead();
            return this.http.post(`${this.baseUrl}/grl/dataexistente/${tipo}`, data, this.httpOptions);
        } else {
            return this.http.post(`${this.baseUrl}/grl/dataexistente/${tipo}`, data);
        }
    }

    async dApiGeneralesAsync(tipo, data, anonimo = false, headers = true) {
        return this.dApiGenerales(tipo, data, anonimo, headers).toPromise();
    }

    getReporte(rutaRep: any, data, anyo = '') {
        let dataEnviar = '';
        data.filter((value, index, arr) => {
            dataEnviar = dataEnviar + '/$' + value;
        });
        dataEnviar = dataEnviar.substring(1);
       // console.log(this.baseUrl + rutaRep + dataEnviar);
       //  console.log(anyo);
        this.insertHead();
        return this.http.get(
            `${this.baseUrl + rutaRep }${anyo}`,
            this.httpOptions,
        );
       // `${this.baseUrl + rutaRep + dataEnviar}`,

    }
}

export interface ConfigGuardar {
    error: string;
    msg: string;
    data: object;
}

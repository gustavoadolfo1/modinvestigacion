import {Injectable, NgZone} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {environment} from '../../environments/environment';

import swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class DataServices {

    public idProySel : any ;
    public nombProySel: any;
    public reqCompProy: any;

    public apiUrl = '';

    public cargando: boolean;

    public photoURL = environment.urlPublic + 'fotografia/';

    private data = {
        infoLogin: null,
        config: null,
        ofSeleccionada: null,
        oficinas_usuario: null,
        credencialActual: {
            foto_reniec: null,
            foto_estudiante: null,
            nombres_completos: null,
            nombres: null,
            apellido_paterno: null,
            foto: null,
            fotoPath: null,
            iCredId: null, iPersId: ''


        },
        ip: {
            local: null,
            publico: null,
        },
        fotografia: null,

        mantenimiento: false,

    };



    private ipRegex = new RegExp(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);

    direcciones_ip = {
        local: null,
        publico: null
    };

    suscripcionDatosMostrar: Subscription;
    idParEval: null;
    doc: any;
    constructor(
        private zone: NgZone,
        private http: HttpClient,
    ) {
        if (!localStorage.getItem('intranet')) {
            localStorage.setItem('intranet', '1');
        }
    }

    setOption(option, value) {
        this.data[option] = value;
    }

    getOption() {
        return this.data;
    }



    // SECCION DE CAPTURA DE IP
    getIp() {
        this.determineLocalIp();
        this.getPublicIp();
        /*
        this.suscripcionDatosMostrar = interval(1000).subscribe(val => {
            if (this.data.ip.publico != null) {
                this.setOption('ip', this.direcciones_ip);
                // tslint:disable-next-line:no-unused-expression
                this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
                // return this.direcciones_ip;
            }
        });
        */
    }

    private determineLocalIp() {

        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(pc.setLocalDescription.bind(pc));

        pc.onicecandidate = (ice) => {
            // console.log(ice);
            this.zone.run(() => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) {
                    return;
                }

                this.data.ip.local = (this.ipRegex.exec(ice.candidate.candidate) != null ? this.ipRegex.exec(ice.candidate.candidate)[1] : null);
                // this.direcciones_ip.local = this.ipRegex.exec(ice.candidate.candidate)[1];

                // this.localIp = this.ipRegex.exec(ice.candidate.candidate)[1];
                // sessionStorage.setItem('LOCAL_IP', this.localIp);

                pc.onicecandidate = () => {};
                pc.close();
            });
        };
    }

    private getPublicIp() {
        this.http.get<any>('https://api.ipify.org?format=json')
            .subscribe( data => {
                this.data.ip.publico = data.ip;
            });
    }

    public jsonBR(data) {
        if (data == null || data == 'null' || data == '[]') {
            return '';
        }
        return JSON.parse(data).join();
        /*
        let ret = '';
        JSON.parse(data).filter((v) => {
            ret += v + '<br>';
        });
        return ret;
        */
    }

    buscarEnArrayDeObjetos(array, campo, valor) {
        if (array.length > 0) {
            let existe = false;
            array.filter((elem, index, arr) => {
                if (!existe) {
                    existe = (elem[campo] && (elem[campo] == valor));
                    // console.log(elem[campo]);
                }
                if (elem[campo] == null) {
                    existe = true;
                }
            });
            return existe;
            /*
            const a = array.filter(function(elem) {
                console.log([(elem[campo] && elem[campo] == valor), elem, valor]);
                return (elem[campo] && elem[campo] == valor);
            });
            console.log(a);
            */
        } else {
            return false;
        }

    }

    mensajeError(error: HttpErrorResponse) {
        let errDebug = '' ;
        if (!environment.production){
            errDebug = '(url: ' + error.url + ')';
        }
        switch (error.status) {
            case 404:
                swal.fire({
                    title: 'Error:',
                    text: 'No se puede conectar con el servidor. ' + errDebug,
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                break;
            default:
                if ([503].includes(error.status)) {
                    console.log(error);
                }
                swal.fire({
                    title: 'Error:',
                    text: error.error.message + errDebug,
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                break;
        }
    }

}

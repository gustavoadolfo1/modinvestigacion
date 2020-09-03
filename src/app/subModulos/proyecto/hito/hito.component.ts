import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {Hito} from '../hito/models/hito';
import swal from 'sweetalert2';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-hito',
    templateUrl: './hito.component.html',
    styleUrls: ['./hito.component.scss'],
    providers: [MessageService],
})
export class HitoComponent implements OnInit {
    activeIndex = 1;
    idProyecto: number;

    dataExtraProyecto = {
        hito: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        }
    };
    modelos = {
        sel_en_lista_hito: null,
    };
    dataConvocatoria: Object;
    duracion;
    duracionHitos = 0;
    dataProyecto: Object;
    estadoPropuesta: number;
    nroHitos: number;
    dataServidor = {
        iNumMesesHito: undefined,
        iNumMesesProyecto: undefined

    };

    perfilesDeUsuarios;
    perfilActual = null;
    constructor(
        private messageService: MessageService,
        private queryInvestigacion: QueryInvestigacionServices,
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private local: LocalStoreService,
        private modalService: NgbModal,
        public _dataService: DataServices,
        private router: Router,
        private _constantes: ConstantesService,
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.postulante].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            // this.idProyecto = this.local.getItem('proysel');
            this.idProyecto = this._dataService.idProySel;
            // await this.getNumeroMeses(this.idProyecto);
            await this.getEstadoPropuesta(this.idProyecto);
            await this.getHitos(this.idProyecto);
        }
    }

    async getNumeroMeses(idProyecto: any = false) {
        this.dataConvocatoria = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_convocatoria_proyecto',
            data: [idProyecto]
        });
        if (this.dataConvocatoria[0].iNumMesesProyecto) {
            this.duracion = this.dataConvocatoria[0].iNumMesesProyecto * 1;
        } else {
            this.duracion = 0;
        }
    }

    private async getEstadoPropuesta(idProyecto: any = false) {
        this.dataProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_proyecto',
            data: [idProyecto]
        });
        //  console.log(this.dataProyecto);
        this.nroHitos = 0;
        if (this.dataProyecto[0].iEstadoPropuesta >= 0) {
            this.estadoPropuesta = this.dataProyecto[0].iEstadoPropuesta;
            this.nroHitos = this.dataProyecto[0].iNumMesesProyecto / this.dataProyecto[0].iNumMesesHito;
            this.dataServidor.iNumMesesHito = this.dataProyecto[0].iNumMesesHito * 1;
            this.dataServidor.iNumMesesProyecto = this.dataProyecto[0].iNumMesesProyecto * 1;
        }else {
            this.estadoPropuesta = 0;
        }
        // console.log(this.dataServidor.iNumMesesProyecto );
        // this.estadoPropuesta = 1;  // borrar luego
        // console.log(this.dataProyecto);
        // console.log(this.dataProyecto[0].iEstadoPropuesta);
        // console.log(this.estadoPropuesta);
        // console.log(idProyecto);
    }

    async getHitos(idProyecto: any = false) {
        const dataHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [idProyecto, null, null]
        });
        this.dataExtraProyecto.hito = [];
        // console.log(dataHito);
        // @ts-ignore
        if (dataHito.length == 0){
            // console.log('sin dato');
            // console.log( this.nroHitos);
            for (let _i = 0; _i < this.nroHitos; _i++) {
                // console.log(_i);
                this.agregarHito();
            }
        }else{
            // tslint:disable-next-line:forin
            for (const index in dataHito) {
                const ht = new Hito();
                ht.iHitoId = dataHito[index].iHitoId;
                ht.iProyectoId = dataHito[index].iProyectoId;
                ht.iNumeroHito = dataHito[index].iNumeroHito;
                ht.cNombre = dataHito[index].cNombre;
                ht.cHitoAnyoInicio = dataHito[index].cHitoAnyoInicio;
                ht.cHitoMesInicio = dataHito[index].cHitoMesInicio;
                ht.cHitoAnyoFin = dataHito[index].cHitoAnyoFin;
                ht.cHitoMesFin = dataHito[index].cHitoMesFin;
                ht.iNumeroMeses = dataHito[index].iNumeroMeses;
                ht.dtFechaInicio = dataHito[index].dtFechaInicio;
                ht.dtFechaFin = dataHito[index].dtFechaFin;

                await this.dataExtraProyecto.hito.push(ht);
            }
        }
        this.calculaDuracionHitos();
        // console.log(this.dataExtraProyecto.hito);
    }


    async agregarHito() {
        const index = this.dataExtraProyecto.hito.length - 1;
        let numHito = 0;
        if (this.dataExtraProyecto.hito[index]){
            numHito = this.dataExtraProyecto.hito[index].iNumeroHito;
        }
        const ht = new Hito();
        ht.iHitoId = null;
        ht.iProyectoId = this.idProyecto;
        ht.iNumeroHito = (numHito * 1) + 1;
        ht.cHitoAnyoInicio = null;
        ht.cHitoMesInicio = null;
        ht.cHitoAnyoFin = null;
        ht.cHitoMesFin = null;
        ht.iNumeroMeses = this.dataServidor.iNumMesesHito;
        ht.dtFechaInicio = null;
        ht.dtFechaFin = null;

        await this.dataExtraProyecto.hito.push(ht);
        this.calculaDuracionHitos();
    }
    eliminarHito(indexHito: any = false) {
        this.dataExtraProyecto.hito.splice(indexHito, 1);
    }
    calculaDuracionHitos() {
        this.duracionHitos = 0;
        this.dataExtraProyecto.hito.filter((value, index, arr) => {
            this.duracionHitos += (value.iNumeroMeses * 1);
        });
    }
    async guardarHito() {
        let valDuracion = true;
        let valCampoLLenos = true;
        let msj1 = '';
        let msj2 = '';
        this.dataExtraProyecto.hito.filter((value, index, arr) => {
            if (value.iNumeroMeses == 0 || value.iNumeroMeses == null) {
                valCampoLLenos = false;
                msj1 = 'Faltan datos en el formulario. por favor verifique.';
            }
        });
        if (this.dataServidor.iNumMesesProyecto !== this.duracionHitos && this.dataServidor.iNumMesesProyecto !== 0
            && this.perfilActual !== this.perfilesDeUsuarios.postulante){

    valDuracion = false;
            msj2 = 'La duración de los hitos es diferente a la duración del Proyecto. por favor verifique.';
        }
        if (valCampoLLenos && valDuracion) {
            const credencial_id = this._dataService.getOption().credencialActual.iCredId;
            const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
            this.dataExtraProyecto.auditoria.credencial_id = credencial_id;
            this.dataExtraProyecto.auditoria.ip = ip;
            const retorno = await this.queryInvestigacion.guardarDatosAsync({
                tipo: 'mantenimiento_hito',
                data: this.dataExtraProyecto
            });
            // @ts-ignore
            if (!retorno.error) {
                this.router.navigate(['/proyecto/progTec_proyecto']);
            } else {
            }
        }else{
            await swal.fire({
                title: 'Error:',
                text: msj1 + ' ' + msj2 ,
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
    }
    cancelar() {
        this.router.navigate(['/investigacion']);
    }

    mayuscula(data: any, s: string) {
        data.cNombre = s;
    }
}

import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {Hito} from '../hito/models/hito';
import {IndicadorHito} from '../hito/models/indicadorHito';
import {Indicador} from '../programacion-tecnica/models/indicador';
import swal from 'sweetalert2';
import {number} from 'ng2-validation/dist/number';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-indicador-hito',
    templateUrl: './indicador-hito.component.html',
    styleUrls: ['./indicador-hito.component.scss'],
    providers: [MessageService],
})
export class IndicadorHitoComponent implements OnInit {
    activeIndex = 3;
    idProyecto: string;
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
        sel_en_lista_ind: null,
    };
    dataServidor = {
        listaConvocatoria: null

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
            await this.getHitos(this.idProyecto);
        }
    }

    async getHitos(idProyecto: any = false) {
        const dataHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [idProyecto, null, null]
        });
        this.dataExtraProyecto.hito = [];
        // tslint:disable-next-line:forin
        for (const index in dataHito) {
            const ind = await this.getIndicadorHito(idProyecto, dataHito[index].iHitoId);
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
            ht.indicadorHito = ind;
            await this.dataExtraProyecto.hito.push(ht);
        }
        // console.log(this.dataExtraProyecto.hito);
    }

    async getIndicadorHito(idProyecto: any = false, idHito: any = false) {
        const dataIndicador = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_indicador_hito_proyecto',
            data: [idProyecto, idHito]
        });
        // console.log(dataIndicador);
        const aInd = [];
        // tslint:disable-next-line:forin
        for (const index in dataIndicador) {
            const ind = new IndicadorHito();
            ind.iIndicadorHitoId = dataIndicador[index].iIndicadorHitoId;
            ind.iHitoId = dataIndicador[index].iHitoId;
            ind.cIndicadorHito = dataIndicador[index].cIndicadorHito;
            ind.iMeta = dataIndicador[index].iMeta;
            ind.iNumero = dataIndicador[index].iNumero;
            await aInd.push(ind);
        }
        return aInd;
    }

    async agregarIndicador(indexHito: any = false) {
        // console.log(indexHito);
        const ind = new IndicadorHito();
        ind.iIndicadorHitoId = null;
        ind.iHitoId = this.dataExtraProyecto.hito[indexHito].iHitoId;
        ind.cIndicadorHito = null;
        ind.iMeta = null;
        ind.iNumero = this.dataExtraProyecto.hito[indexHito].indicadorHito.length + 1;
        await this.dataExtraProyecto.hito[indexHito].indicadorHito.push(ind);
    }

    eliminarIndicador(indexHito: any = false, indexInd: any = false) {
        this.dataExtraProyecto.hito[indexHito].indicadorHito.splice(indexInd, 1);
    }

    async guardarProgTecFin() {
        let valCampoLLenos = true;
        let msj1 = '';
        let msj2 = '';
        let msj3 = '';
        const aNumeros = [];
        this.dataExtraProyecto.hito.filter((value, index, arr) => {
            if (value.indicadorHito.length == 0) {
                valCampoLLenos = false;
                msj1 = 'Debe registrar indicadores por cada Hito. ';
            }
            value.indicadorHito.filter((value2, index2, arr2) => {
                if (value2.cIndicadorHito == null || value2.iMeta == null || value2.iNumero == null) {
                    valCampoLLenos = false;
                    msj2 = 'Faltan datos de los indicadores en el formulario. ';
                }
                aNumeros.push(value2.iNumero * 1);
            });
            for (let i = 1; i <= aNumeros.length; i++) {
                if (!aNumeros.includes(i)){
                    valCampoLLenos = false;
                    msj3 = 'Falta un número en la Secuencia de un Indicador. ';
                }
            }
            aNumeros.splice(0, aNumeros.length);
        });

        if (valCampoLLenos) {
            const credencial_id = this._dataService.getOption().credencialActual.iCredId;
            const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
            this.dataExtraProyecto.auditoria.credencial_id = credencial_id;
            this.dataExtraProyecto.auditoria.ip = ip;
            const retorno = await this.queryInvestigacion.guardarDatosAsync({
                tipo: 'mantenimiento_indicador_hito',
                data: this.dataExtraProyecto
            });
            // @ts-ignore
            if (!retorno.error) {
                this.router.navigate(['/proyecto/distribucion_presupuesto']);
            } else {
                /* this.editandoActividades = true;
                 this.disableForm = false;*/
            }
        } else {
            await swal.fire({
                title: 'Error:',
                text: msj1 + ' ' + msj2 + ' ' + msj3 + 'por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
    }

    cancelar() {
        this.router.navigate(['/investigacion']);
    }

    mayuscula(data: any, s: string) {
        data.cIndicadorHito = s;
    }
}

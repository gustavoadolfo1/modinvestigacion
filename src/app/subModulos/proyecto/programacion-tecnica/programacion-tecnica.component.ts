import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import swal from 'sweetalert2';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {Objetivo} from './models/objetivo';
import {Indicador} from './models/indicador';
import {Actividad} from './models/actividad';
import {Cronograma} from './models/cronograma';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-programacion-tecnica',
    templateUrl: './programacion-tecnica.component.html',
    styleUrls: ['./programacion-tecnica.component.scss'],
    providers: [MessageService],
})
export class ProgramacionTecnicaComponent implements OnInit {
    activeIndex = 2;
    idProyecto: string;
    dataExtraProyecto = {
        objEspecifico: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        }
    };
    modelos = {
        sel_en_lista_act: null,
        sel_en_lista_ind: null,
    };
    dataServidor = {
        listaUnidadMedida: null,
        listaConvocatoria: null

    };
    loading = false;

    listaMeses = {
        numMes: [],
    };
    dataConvocatoria: Object;
    dataProyecto: Object;
    perfilesDeUsuarios;
    perfilActual = null;
    iNumMesesProyecto;
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
            await this.getNumeroMeses(this.idProyecto);
            await this.getObjEspecifico(this.idProyecto);

            // this.queryInvestigacion.datosInvestigacionServidor({
            //     tipo: 'data_unidad_medida',
            //     data: ['%%']
            // }).subscribe(data => {
            //     this.dataServidor.listaUnidadMedida = data;
            // });
        }
    }
    async getNumeroMeses(idProyecto: any = false) {
        this.dataProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'duracion_proyecto',
            data: [idProyecto]
        });
        this.dataConvocatoria = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_convocatoria_proyecto',
            data: [idProyecto]
        });
        if (this.dataConvocatoria[0].iNumMesesProyecto < this.dataProyecto[0].iNumMesesProyecto){
            this.iNumMesesProyecto = this.dataProyecto[0].iNumMesesProyecto;
        }else{
            this.iNumMesesProyecto = this.dataConvocatoria[0].iNumMesesProyecto;
        }
        // console.log(this.dataConvocatoria[0].iNumMesesProyecto +'<'+ this.dataProyecto[0].iNumMesesProyecto);
        // console.log(this.dataConvocatoria[0].iNumMesesProyecto +'<'+ this.dataProyecto[0].iNumMesesProyecto);

        for (let i = 1; i <= this.iNumMesesProyecto; i++) {
            const mes = {
                numMes: i
            };
            this.listaMeses.numMes.push(mes);
        }
        // console.log(this.dataConvocatoria);

    }

    async getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_objetivos_proyecto',
            data: [idProyecto, '']
        });
        this.dataExtraProyecto.objEspecifico.length = 0;
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            const ind = await this.getIndicadorObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const act = await this.getActividadObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const obj = new Objetivo();
            obj.iObjetivoId = dataObjEspecifico[index].iObjetivoId;
            obj.iProyectoId = dataObjEspecifico[index].iProyectoId;
            obj.cObjetivo = dataObjEspecifico[index].cObjetivo;
            obj.iTipoObjetivoId = dataObjEspecifico[index].iTipoObjetivoId;
            obj.indicador = ind;
            obj.actividad = act;

            await this.dataExtraProyecto.objEspecifico.push(obj);
        }
        // console.log(this.dataExtraProyecto.objEspecifico);
    }

    async getIndicadorObjetivo(idProyecto: any = false, idObjetivo: any = false) {
        const dataIndicador = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_indicador_obj_proyecto',
            data: [idProyecto, idObjetivo]
        });
        // console.log(dataIndicador);
        const aInd = [];
        // tslint:disable-next-line:forin
        for (const index in dataIndicador) {
            const ind = new Indicador();
            ind.iIndicadorId = dataIndicador[index].iIndicadorId;
            ind.iObjetivoId = dataIndicador[index].iObjetivoId;
            ind.cIndicador = dataIndicador[index].cIndicador;
            ind.iMeta = dataIndicador[index].iMeta;
            await aInd.push(ind);
        }
        return aInd;
    }

    async getActividadObjetivo(idProyecto: any = false, idObjetivo: any = false) {
        const dataActividad = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_actividad_obj_proyecto',
            data: [idProyecto, idObjetivo]
        });
        const aAct = [];
        // tslint:disable-next-line:forin
        for (const index in dataActividad) {
            const cro = await this.geCronogramaActividad(dataActividad[index].iActividadId);
            const act = new Actividad();
            act.iActividadId = dataActividad[index].iActividadId;
            act.iObjetivoId = dataActividad[index].iObjetivoId;
            act.cActividadDescripcion = dataActividad[index].cActividadDescripcion;
            act.iCantidad = dataActividad[index].iCantidad;
            act.cUnidadMedida = dataActividad[index].cUnidadMedida;
            act.cUnidadMedida = dataActividad[index].cUnidadMedida;
            act.cronograma = cro;
            await aAct.push(act);
        }
        return aAct;
    }

    async geCronogramaActividad(idActividad: any = false) {
        const dataCronograma = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_cronograma_actividad',
            data: [idActividad]
        });
        const aCro = [];
        // @ts-ignore
        if (dataCronograma.length > 0) {
            // tslint:disable-next-line:forin
            for (const index in dataCronograma) {
                const cro = new Cronograma();
                cro.iCronogramaId = dataCronograma[index].iCronogramaId;
                cro.iActividadId = dataCronograma[index].iActividadId;
                cro.nMes = dataCronograma[index].nMes;
                cro.iEstado = (dataCronograma[index].iEstado == 1);
                await aCro.push(cro);
            }
        } else {
            for (let i = 1; i <= this.iNumMesesProyecto; i++) {
                const cro = new Cronograma();
                cro.iCronogramaId = null;
                cro.iActividadId = null;
                cro.nMes = i;
                cro.iEstado = false;
                await aCro.push(cro);
            }
        }
        return aCro;
    }

    async agregarActividad(indexObj: any = false) {
        const aCro = [];
        for (let i = 1; i <= this.iNumMesesProyecto; i++) {
            const cro = new Cronograma();
            cro.iCronogramaId = null;
            cro.iActividadId = null;
            cro.nMes = i;
            cro.iEstado = false;
            await aCro.push(cro);
        }
        const act = new Actividad();
        act.iActividadId = null;
        act.iObjetivoId = this.dataExtraProyecto.objEspecifico[indexObj].iObjetivoId;
        act.cActividadDescripcion = null;
        act.iCantidad = null;
        act.cUnidadMedida = null;
        act.cUnidadMedida = null;
        act.cronograma = aCro;

        await this.dataExtraProyecto.objEspecifico[indexObj].actividad.push(act);

    }

    eliminarActividad(indexObj: any = false, indexAct: any = false) {
        this.dataExtraProyecto.objEspecifico[indexObj].actividad.splice(indexAct, 1);
    }

    async agregarIndicador(indexObj: any = false) {
        const ind = new Indicador();
        ind.iIndicadorId = null;
        ind.iObjetivoId = null;
        ind.cIndicador = null;
        ind.iMeta = null;
        await this.dataExtraProyecto.objEspecifico[indexObj].indicador.push(ind);
    }

    eliminarIndicador(indexObj: any = false, indexInd: any = false) {
        this.dataExtraProyecto.objEspecifico[indexObj].indicador.splice(indexInd, 1);
    }

    async guardarProgTec() {
        let valCampoLLenos = true;
        let msj1 = '';
        let msj2 = '';
        let msj3 = '';
        let msj4 = '';
        this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {
            if (value.indicador.length == 0) {
                valCampoLLenos = false;
                msj1 = 'Debe registrar indicadores por cada Objetivo. ';
            }
            if (value.actividad.length == 0 && value.iTipoObjetivoId == 2) {
                valCampoLLenos = false;
                msj2 = 'Debe registrar actividades por cada Objetivo. ';
            }
            value.indicador.filter((value2, index2, arr2) => {
                if (value2.cIndicador == null || value2.iMeta == null) {
                    valCampoLLenos = false;
                    msj3 = 'Faltan datos de los indicadores en el formulario.';
                }
            });
            value.actividad.filter((value3, index3, arr3) => {
                if (value3.cActividadDescripcion == null || value3.iCantidad == null || value3.cUnidadMedida == null) {
                    valCampoLLenos = false;
                    msj4 = 'Faltan datos de las actividades en el formulario.';
                }
            });

        });

        if (valCampoLLenos) {
            const credencial_id = this._dataService.getOption().credencialActual.iCredId;
            const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
            this.dataExtraProyecto.auditoria.credencial_id = credencial_id;
            this.dataExtraProyecto.auditoria.ip = ip;
            const retorno = await this.queryInvestigacion.guardarDatosAsync({
                tipo: 'mantenimiento_actividad_cronograma_indicador',
                data: this.dataExtraProyecto
            });
            // @ts-ignore
            if (!retorno.error) {
                this.router.navigate(['/proyecto/indicador_hito_proyecto']);
            } else {
                /* this.editandoActividades = true;
                 this.disableForm = false;*/
            }
        } else {
            await swal.fire({
                title: 'Error:',
                text: msj1 + ' ' + msj2 + ' ' + msj3 + ' ' + msj4 + 'por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
    }

    cancelar() {
        this.router.navigate(['/investigacion']);
    }


    mayusculaIndicador(data: any, s: string) {
        data.cIndicador = s;
    }

    mayusculaActividad(data: any, s: string) {
        data.cActividadDescripcion = s;
    }
    mayusculaUnidad(data: any, s: string) {
        data.cUnidadMedida = s;
    }
}

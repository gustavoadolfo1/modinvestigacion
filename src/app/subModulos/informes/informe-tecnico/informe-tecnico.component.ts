import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {Objetivo} from '../../proyecto/programacion-tecnica/models/objetivo';
import {Indicador} from '../../proyecto/programacion-tecnica/models/indicador';
import swal from 'sweetalert2';
import {environment} from '../../../../environments/environment';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-informe-tecnico',
    templateUrl: './informe-tecnico.component.html',
    styleUrls: ['./informe-tecnico.component.scss'],
    providers: [MessageService],
})
export class InformeTecnicoComponent implements OnInit {
    urlAPI: string;
    idProyecto: any;
    dataInfTec = {
        iHitoId: '',
        dtFechaInfoAvTec: '',
        cResumenEjecutivo: '',
        objGral: [],
        objEspecifico: [],
        actividades: [],
        hito: [],
        cDetAvIndHito: '',
        hitoAnt: [],
        cDetAvIndNoCompletoHitoAnt: '',
        resultadoLogrado: [],
        riesgoIndicador: [],

        problemaHito: [],

        observacionHito: [],
        observacionHitoEvaluado: [],
        equipoTec: [],
        cConclusion: '',
        cRecomendacion: '',

        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        },
        infTecObjGral: undefined,
        // edit
        iInfoAvTecId: null, iEstado: null,
    };
    dataServidor = {
        listaHito: null,
        listaEstadoRiesgo: null,
        avFinanciero: null,
        resumenEjecPres: null
    };
    dataProyecto = {
        nomProyecto: null,
        nomDirector: null,
        resolucion: null,
    };
    dataHito = {
        dtFechaInicio: null,
        dtFechaFin: null,
        iNumeroHito: null,
        cNombre: null,
    };
    idHito: any;
    frmInfTecnico: FormGroup;
    idObjAnt = 0;
    modelos = {
        sel_en_lista_ind: null,
        sel_en_lista_resLog: null,
        sel_en_lista_otroProbAdm: null,
        sel_en_lista_otroProbTec: null,
        sel_en_lista_otroProbFinan: null,
        sel_en_lista_obsHito: null,
        sel_en_lista_obs: null,
        sel_en_lista_logro: null,
        sel_en_lista_ind_ht: null,
        sel_en_lista_ind_ht_ant: null,
        sel_en_lista_rgInd: null,
        sel_en_lista_resEjeP: null
    };
    itemsExp;
    archivo = {
        cArchivoAnexo: '',
    };
    pdfActual: any;
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    baseUrl: any;
    rubroAnterior = null;
    totalPreAsig = 0;
    totalPreEjec = 0;
    totalEjecutado = 0;
    perfilActual = null;
    perfilesDeUsuarios;

    index = 6;
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
        if (!this._dataService.idProySel){
            this.router.navigate(['/investigacion/']);
        }
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.urlAPI = environment.urlAPI;
        this.baseUrl = environment.urlPublic;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.monitor].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            await this.crearFormulario();
            this.idProyecto = this._dataService.idProySel;
            // this.nomProyecto = this._dataService.nombProySel;
            // this.idProyecto = this.local.getItem('proysel');
            this.idHito = this.local.getItem('ht');
            await this.getProyecto(this.idProyecto);
            await this.getHito(this.idProyecto, this.idHito);
            //   await this.getObjEspecifico(this.idProyecto);
            this.dataInfTec.iHitoId = this.idHito;
            await this.getAvanceTecnico(this.idProyecto, this.idHito);
            await this.cargaLista();

            this.opcionExportar();
        }
    }

    opcionExportar() {
        this.itemsExp = [
            {
                label: 'Informe', icon: 'pi pi-file-pdf', command: () => {
                    this.generarPdf('infAvTec');
                }
            },
        ];
    }

    async getHito(idProyecto: any = false, idHito: any = false) {
        this.dataServidor.listaHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [idProyecto, idHito, null]
        });
        this.dataHito.dtFechaInicio = this.dataServidor.listaHito[0].dtFechaInicio;
        this.dataHito.dtFechaFin = this.dataServidor.listaHito[0].dtFechaFin;
        this.dataHito.iNumeroHito = this.dataServidor.listaHito[0].iNumeroHito;
        this.dataHito.cNombre = this.dataServidor.listaHito[0].cNombre;
        // console.log(this.dataServidor.listaHito);
    }

    async getProyecto(idProyecto: any = false) {
        const data = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_proyecto',
            data: [this.idProyecto]
        });
        this.dataProyecto.nomProyecto = data[0].cNombreProyecto;
        this.dataProyecto.nomDirector = data[0].director;
        this.dataProyecto.resolucion = data[0].cResProyecto;
    }


    get frmInfTecnicoControl() {
        return this.frmInfTecnico.controls;
    }

    async crearFormulario() {
        this.frmInfTecnico = this.formBuilder.group({
            cArchivoAnexo: ['']
        });
    }

    async cargaLista() {
        this.dataServidor.listaEstadoRiesgo = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'estado_riesgo',
            data: ['%']
        });
    }

    async getAvanceTecnico(idProyecto: any = false, idHito: any = false) {
        const data = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_informe_avance_tec',
            data: [idHito]
        });
        // console.log(data);
        // @ts-ignore
        if (data.length > 0) {
            this.dataInfTec.iInfoAvTecId = data[0].iInfoAvTecId;
            this.dataInfTec.dtFechaInfoAvTec = data[0].dtFechaInfoAvTec;
            this.dataInfTec.cResumenEjecutivo = data[0].cResumenEjecutivo;
            this.dataInfTec.cDetAvIndHito = data[0].cDetAvIndHito;
            this.dataInfTec.cDetAvIndNoCompletoHitoAnt = data[0].cDetAvIndNoCompletoHitoAnt;
            this.dataInfTec.cConclusion = data[0].cConclusion;
            this.dataInfTec.cRecomendacion = data[0].cRecomendacion;

            this.archivo.cArchivoAnexo = data[0].cArchivoAnexo;
            await this.frmInfTecnicoControl.cArchivoAnexo.reset(data[0].cArchivoAnexo ? data[0].cArchivoAnexo : '');

            this.dataInfTec.iEstado = +data[0].iEstado;
        }
        // 2.
        const [dataAvanceTecnico] = await Promise.all([this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_obj_ind',
            data: [idProyecto, idHito, this.dataInfTec.iInfoAvTecId]
        })]);
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnico) {
            const obj = {
                iProyectoId: dataAvanceTecnico[index].iProyectoId,
                iObjetivoId: dataAvanceTecnico[index].iObjetivoId,
                iTipoObjetivoId: dataAvanceTecnico[index].iTipoObjetivoId,
                cObjetivo: dataAvanceTecnico[index].cObjetivo,
                cTipoObjetivo: dataAvanceTecnico[index].cTipoObjetivo,
                iIndicadorId: dataAvanceTecnico[index].iIndicadorId,
                cIndicador: dataAvanceTecnico[index].cIndicador,
                iMeta: dataAvanceTecnico[index].iMeta,
                iEjecutado: dataAvanceTecnico[index].totalEjecAntesHito,
                nEjecutadoPorcentaje: ((dataAvanceTecnico[index].totalEjecAntesHito * 1 + dataAvanceTecnico[index].totalEjecEnHito * 1) / dataAvanceTecnico[index].iMeta) * 100,
                numInd: dataAvanceTecnico[index].numInd,
                iCantidad: dataAvanceTecnico[index].totalEjecEnHito,
                cMedioVerificacion: dataAvanceTecnico[index].cMedioVerificacion,
                cArchivo: dataAvanceTecnico[index].cArchVerificacion,
                iAvLogradoHitoId: dataAvanceTecnico[index].iAvLogradoHitoId
            };
            if (dataAvanceTecnico[index].iTipoObjetivoId == 1) {
                await this.dataInfTec.objGral.push(obj);
            } else {
                await this.dataInfTec.objEspecifico.push(obj);
            }
        }
        // console.log(this.dataInfTec.objGral);
        console.log(this.dataInfTec.objEspecifico);

        // actividades
        const dataObjActividad = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_obj_act',
            data: [idProyecto, idHito, this.dataInfTec.iInfoAvTecId, 2]
        });
        // tslint:disable-next-line:forin
        for (const index in dataObjActividad) {
            const objAct = {
                iProyectoId: dataObjActividad[index].iProyectoId,
                iObjetivoId: dataObjActividad[index].iObjetivoId,
                iTipoObjetivoId: dataObjActividad[index].iTipoObjetivoId,
                cObjetivo: dataObjActividad[index].cObjetivo,
                cTipoObjetivo: dataObjActividad[index].cTipoObjetivo,
                iActividadId: dataObjActividad[index].iActividadId,
                cActividadDescripcion: dataObjActividad[index].cActividadDescripcion,
                iMeta: dataObjActividad[index].iMeta,
                iEjecutado: dataObjActividad[index].totalEjecAntesHito,
                nEjecutadoPorcentaje: ((dataObjActividad[index].totalEjecAntesHito * 1 + dataObjActividad[index].totalEjecEnHito * 1) / dataObjActividad[index].iMeta) * 100,
                numAct: dataObjActividad[index].numAct,
                iCantidad: dataObjActividad[index].totalEjecEnHito,
                cMedioVerificacion: dataObjActividad[index].cMedioVerificacion,
                cArchivo: dataObjActividad[index].cArchVerificacion,
                iAvLogradoHitoActId: dataObjActividad[index].iAvLogradoHitoActId,
            };
            await this.dataInfTec.actividades.push(objAct);
        }

        // 3.2
        const dataAvanceTecnicoHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_ht_ind',
            data: [idProyecto, idHito, this.dataInfTec.iInfoAvTecId]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoHito) {
            const ht = {
                iProyectoId: dataAvanceTecnicoHito[index].iProyectoId,
                iHitoId: dataAvanceTecnicoHito[index].iHitoId,
                iNumeroHito: dataAvanceTecnicoHito[index].iNumeroHito,
                iIndicadorHitoId: dataAvanceTecnicoHito[index].iIndicadorHitoId,
                cIndicadorHito: dataAvanceTecnicoHito[index].cIndicadorHito,
                iMeta: dataAvanceTecnicoHito[index].iMeta,
                iNumero: dataAvanceTecnicoHito[index].iNumero,
                iEjecutado: dataAvanceTecnicoHito[index].iEjecutado,
                nEjecutadoPorcentaje: dataAvanceTecnicoHito[index].nEjecutadoPorcentaje,
                numInd: dataAvanceTecnicoHito[index].numInd,
                iCantidad: dataAvanceTecnicoHito[index].iCantidad,
                cMedioVerificacion: dataAvanceTecnicoHito[index].cMedioVerificacion,
                iAfectaIndSgtHito: dataAvanceTecnicoHito[index].iAfectaIndSgtHito,
                dtFechaCumplir: dataAvanceTecnicoHito[index].dtFechaCumplir,

                iAvIndHitoId: dataAvanceTecnicoHito[index].iAvIndHitoId,

            };
            await this.dataInfTec.hito.push(ht);
        }
        // console.log(this.dataInfTec.hito);
        // 3.3
        const dataAvanceTecnicoHitoAnt = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_htAnt_ind_noCumplido',
            data: [idProyecto, idHito, this.dataInfTec.iInfoAvTecId]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoHitoAnt) {
            const htAnt = {
                iProyectoId: dataAvanceTecnicoHitoAnt[index].iProyectoId,
                iHitoId: dataAvanceTecnicoHitoAnt[index].iHitoId,
                iNumeroHito: dataAvanceTecnicoHitoAnt[index].iNumeroHito,
                iIndicadorHitoId: dataAvanceTecnicoHitoAnt[index].iIndicadorHitoId,
                cIndicadorHito: dataAvanceTecnicoHitoAnt[index].cIndicadorHito,
                iMeta: dataAvanceTecnicoHitoAnt[index].iMeta,
                iNumero: dataAvanceTecnicoHitoAnt[index].iNumero,
                iEjecutado: dataAvanceTecnicoHitoAnt[index].iEjecutado,
                nEjecutadoPorcentaje: dataAvanceTecnicoHitoAnt[index].nEjecutadoPorcentaje,
                numInd: dataAvanceTecnicoHitoAnt[index].numInd,
                iCantidad: dataAvanceTecnicoHitoAnt[index].iCantidad,
                cMedioVerificacion: dataAvanceTecnicoHitoAnt[index].cMedioVerificacion,
                iAfectaIndSgtHito: dataAvanceTecnicoHitoAnt[index].iAfectaIndSgtHito,
                dtFechaCumplir: dataAvanceTecnicoHitoAnt[index].dtFechaCumplir,
                totalEjecAntesHito: dataAvanceTecnicoHitoAnt[index].totalEjecAntesHito,

                iAvIndHitoId: dataAvanceTecnicoHitoAnt[index].iAvIndHitoId,
            };
            await this.dataInfTec.hitoAnt.push(htAnt);
        }
        // console.log(this.dataInfTec.hitoAnt);
        // 4.
        const dataAvanceTecnicoResultado = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_resultado',
            data: [this.dataInfTec.iInfoAvTecId]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoResultado) {
            const rsLog = {
                cResultadoHito: dataAvanceTecnicoResultado[index].cResultadoHito,
                iHitoId: dataAvanceTecnicoResultado[index].iHitoId,

                iResultadoHitoId: dataAvanceTecnicoResultado[index].iResultadoHitoId,
            };
            await this.dataInfTec.resultadoLogrado.push(rsLog);
        }
        // console.log(this.dataInfTec.resultadoLogrado);
        // 5.
        const dataAvanceTecnicoRiesgo = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_riesgo',
            data: [this.dataInfTec.iInfoAvTecId]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoRiesgo) {
            const riesgInd = {
                cRiesgoHito: dataAvanceTecnicoRiesgo[index].cRiesgoHito,
                iHitoId: dataAvanceTecnicoRiesgo[index].iHitoId,
                iEstadoRiesgoId: dataAvanceTecnicoRiesgo[index].iEstadoRiesgoId,
                cEstadoRiesgo: dataAvanceTecnicoRiesgo[index].cEstadoRiesgo,
                cAccionTomada: dataAvanceTecnicoRiesgo[index].cAccionTomada,

                iRiesgoHitoId: dataAvanceTecnicoRiesgo[index].iRiesgoHitoId,
            };
            await this.dataInfTec.riesgoIndicador.push(riesgInd);
        }
        // console.log(this.dataInfTec.riesgoIndicador);
        // 6.
        const dataAvanceTecnicoProblema = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_problema',
            data: [this.dataInfTec.iInfoAvTecId]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoProblema) {
            const probHt = {
                cProblemaHito: dataAvanceTecnicoProblema[index].cProblemaHito,
                iHitoId: dataAvanceTecnicoProblema[index].iHitoId,
                iTipoObservacionId: dataAvanceTecnicoProblema[index].iTipoObservacionId,
                cTipoObservacion: dataAvanceTecnicoProblema[index].cTipoObservacion,

                iProblemaHitoId: dataAvanceTecnicoProblema[index].iProblemaHitoId,
            };
            await this.dataInfTec.problemaHito.push(probHt);
        }
        // console.log(this.dataInfTec.riesgoIndicador);
        // 7.
        const dataAvanceTecnicoObsHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_obs',
            data: [idProyecto, idHito]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoObsHito) {
            const obsHt = {
                iNumeroHito: dataAvanceTecnicoObsHito[index].iNumeroHito,
                iHitoId: dataAvanceTecnicoObsHito[index].iHitoId,
                iTipoObservacionId: dataAvanceTecnicoObsHito[index].iTipoObservacionId,
                iEstadoObservacionId: dataAvanceTecnicoObsHito[index].iEstadoObservacionId,
                dtFechaActa: dataAvanceTecnicoObsHito[index].dtFechaActa,
                cNumActa: dataAvanceTecnicoObsHito[index].cNumActa,
                cLugar: dataAvanceTecnicoObsHito[index].cLugar,
                cRecomendacion: dataAvanceTecnicoObsHito[index].cRecomendacion,
                cResultado: dataAvanceTecnicoObsHito[index].cResultado,
                cTipoObservacion: dataAvanceTecnicoObsHito[index].cTipoObservacion,
                cEstadoObservacion: dataAvanceTecnicoObsHito[index].cEstadoObservacion,

                iObservacionHitoId: dataAvanceTecnicoObsHito[index].iObservacionHitoId,
            };
            await this.dataInfTec.observacionHito.push(obsHt);
        }
        // console.log(this.dataInfTec.observacionHito);
        // 8.
        const dataAvanceTecnicoObsHitoEval = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_tecnico_obs_evaluada',
            data: [idProyecto, idHito]
        });
        // tslint:disable-next-line:forin
        for (const index in dataAvanceTecnicoObsHitoEval) {
            const obsHtEval = {
                iNumeroHito: dataAvanceTecnicoObsHitoEval[index].iNumeroHito,
                iObservacionId: dataAvanceTecnicoObsHitoEval[index].iObservacionId,
                dtFechaActa: dataAvanceTecnicoObsHitoEval[index].dtFechaActa,
                cNumActa: dataAvanceTecnicoObsHitoEval[index].cNumActa,
                cLugar: dataAvanceTecnicoObsHitoEval[index].cLugar,
                cRecomendacion: dataAvanceTecnicoObsHitoEval[index].cRecomendacion,
                cResultado: dataAvanceTecnicoObsHitoEval[index].cResultado,
                iEstadoObservacionId: dataAvanceTecnicoObsHitoEval[index].iEstadoObservacionId,
                cEstadoObservacion: dataAvanceTecnicoObsHitoEval[index].cEstadoObservacion,
                iTipoObservacionId: dataAvanceTecnicoObsHitoEval[index].iTipoObservacionId,
                cTipoObservacion: dataAvanceTecnicoObsHitoEval[index].cTipoObservacion,
            };
            await this.dataInfTec.observacionHitoEvaluado.push(obsHtEval);
        }
        // console.log(this.dataInfTec.observacionHitoEvaluado);
        // 9.
        let dataAvanceMiembros;
        if (this.dataInfTec.iInfoAvTecId > 0) {
            dataAvanceMiembros = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'data_miembros_hito',
                data: [this.dataInfTec.iInfoAvTecId]
            });
        }
        console.log(this.dataInfTec.iInfoAvTecId);
        if (this.dataInfTec.iInfoAvTecId == null){
            dataAvanceMiembros = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'data_miembros_proyecto',
                data: [idProyecto]
            });
        }
        // tslint:disable-next-line:forin
        for (const index in dataAvanceMiembros) {
            const mb = {
                iMiembroId: dataAvanceMiembros[index].iMiembroId,
                cPersDescripcion: dataAvanceMiembros[index].cPersDescripcion,
                iTipoMiembroId: dataAvanceMiembros[index].iTipoMiembroId,
                cTipoMiembroDescripcion: dataAvanceMiembros[index].cTipoMiembroDescripcion,
                cPersDocumento: dataAvanceMiembros[index].cPersDocumento,
                iMiembroProyectoId: dataAvanceMiembros[index].iMiembroProyectoId,
                cGrado: dataAvanceMiembros[index].cGrado,
                nDedicacionPorcentaje: (dataAvanceMiembros[index].nDedicacionPorcentaje ? dataAvanceMiembros[index].nDedicacionPorcentaje : null),

                iMiembroHitoId: null,
                // iMiembroHitoId: dataAvanceMiembros[index].iMiembroHitoId,
            };
            await this.dataInfTec.equipoTec.push(mb);
        }
        // console.log(this.dataInfTec.equipoTec);
        // 12.
        const dataAvanceFinancieroHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_financiero',
            data: [idProyecto, idHito]
        });
        let idRubroAnt = 0;
        const datos = [];
        let rubro;
        // tslint:disable-next-line:forin
        for (const index in dataAvanceFinancieroHito) {
            if (idRubroAnt !== +dataAvanceFinancieroHito[index].iRubroId) {
                if (idRubroAnt !== 0) {
                    await datos.push(rubro);
                }
                idRubroAnt = +dataAvanceFinancieroHito[index].iRubroId;
                rubro = {
                    iProyectoId: dataAvanceFinancieroHito[index].iProyectoId,
                    iRubroId: dataAvanceFinancieroHito[index].iRubroId,
                    cRubroDescripcion: dataAvanceFinancieroHito[index].cRubroDescripcion,
                    detalle: []
                };
            }
            const detalle = {
                cAccion: dataAvanceFinancieroHito[index].cAccion,
                cDocAprueba: dataAvanceFinancieroHito[index].cDocAprueba,
                cObjetivo: dataAvanceFinancieroHito[index].cObjetivo,
                iHitoId: dataAvanceFinancieroHito[index].iHitoId,
                nGasto: dataAvanceFinancieroHito[index].nGasto,
            };
            await rubro.detalle.push(detalle);
            // await this.dataInfTec.avFinanciero.push(mb);
        }
        await datos.push(rubro);
        this.dataServidor.avFinanciero = datos;
        this.totalEjecutado = 0;
        this.dataServidor.avFinanciero.filter((value, index, arr) => {
            value.detalle.filter((value1, index1, arr1) => {
                this.totalEjecutado += +value1.nGasto;
            });
        });
        // RESUMEN EJECUCION PRESUPUESTAL
        const dataResumenEjecPresupuestal = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_avance_financiero_resumen',
            data: [idProyecto, idHito]
        });
        this.dataServidor.resumenEjecPres = dataResumenEjecPresupuestal;
        this.totalPreAsig = 0;
        this.totalPreEjec = 0;
        this.dataServidor.resumenEjecPres.filter((value, index, arr) => {
            this.totalPreAsig += +value.totalPresupuesto;
            this.totalPreEjec += +value.totalGasto;
        });
    }


    async getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_objetivos_proyecto',
            data: [idProyecto, '']
        });
        this.dataInfTec.objEspecifico.length = 0;
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            const ind = await this.getIndicadorObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const obj = new Objetivo();
            obj.iObjetivoId = dataObjEspecifico[index].iObjetivoId;
            obj.iProyectoId = dataObjEspecifico[index].iProyectoId;
            obj.cObjetivo = dataObjEspecifico[index].cObjetivo;
            obj.iTipoObjetivoId = dataObjEspecifico[index].iTipoObjetivoId;
            obj.indicador = ind;

            await this.dataInfTec.objEspecifico.push(obj);
        }
        // console.log(this.dataInfTec.objEspecifico);
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


    comparaObj(iObjetivoId: any = false) {

         // console.log(this.idObjAnt + '!==' + iObjetivoId);
        if (this.idObjAnt !== iObjetivoId) {
            this.idObjAnt = iObjetivoId;
            return true;
        } else {
            return false;
        }
        return true;
    }

    async agregarResultadoLogrado() {
        const resLog = {
            cResultadoHito: null,
            iHitoId: null,

            iResultadoHitoId: null,
        };
        await this.dataInfTec.resultadoLogrado.push(resLog);
    }

    eliminarResultadoLogrado(indexResLog: any = false) {
        this.dataInfTec.resultadoLogrado.splice(indexResLog, 1);
    }

    async agregarRiesgoIndicador() {
        const riesgInd = {
            cRiesgoHito: null,
            iHitoId: null,
            iEstadoRiesgoId: null,
            cEstadoRiesgo: null,
            cAccionTomada: null,

            iRiesgoHitoId: null,
        };
        await this.dataInfTec.riesgoIndicador.push(riesgInd);
    }

    eliminarRiesgoIndicador(indexRiesgo: any = false) {
        this.dataInfTec.riesgoIndicador.splice(indexRiesgo, 1);
    }

    async agregarOtroProblema(tipo) {
        let probHt: object;
        switch (tipo) {
            case 'adm':
                probHt = {
                    cProblemaHito: null,
                    iHitoId: null,
                    iTipoObservacionId: 1,
                    cTipoObservacion: null,

                    iProblemaHitoId: null,
                };
                await this.dataInfTec.problemaHito.push(probHt);
                break;
            case 'tec':
                probHt = {
                    iHitoId: null,
                    iTipoObservacionId: 2,
                    cProblemaHito: null,
                    cTipoObservacion: null,

                    iProblemaHitoId: null,
                };
                await this.dataInfTec.problemaHito.push(probHt);
                break;
            case 'finan':
                probHt = {
                    iHitoId: null,
                    iTipoObservacionId: 3,
                    cProblemaHito: null,
                    cTipoObservacion: null,

                    iProblemaHitoId: null,
                };
                await this.dataInfTec.problemaHito.push(probHt);
                break;
        }
    }

    eliminarOtroProblema(tipo, indexOtroProb: any = false) {
        switch (tipo) {
            case 'adm':
                this.dataInfTec.problemaHito.splice(indexOtroProb, 1);
                break;
            case 'tec':
                this.dataInfTec.problemaHito.splice(indexOtroProb, 1);
                break;
            case 'finan':
                this.dataInfTec.problemaHito.splice(indexOtroProb, 1);
                break;
        }
    }

    async guardar(tipo: string) {
        let valCampoLLenos = true;
        let msj1 = '';
        let msj2 = '';
        let msj3 = '';
        let msj4 = '';

        /*if (
            this.dataInfTec.dtFechaInfoAvTec !== '' &&
            this.dataInfTec.cResumenEjecutivo !== '' &&
            this.dataInfTec.cDetAvIndHito !== '' &&
            this.dataInfTec.cDetAvIndNoCompletoHitoAnt !== '' &&
            this.dataInfTec.cConclusion !== '' &&
            this.dataInfTec.cRecomendacion !== ''){
            valCampoLLenos = false;
            msj1 = 'Debe registrar indicadores por cada Objetivo. ';
        }*/
        /* let dataInfTeca = {
             objGral: [],
             objEspecifico: [],
             hito: [],
             hitoAnt: [],
             resultadoLogrado: [],
             riesgoIndicador: [],

             problemaHito: [],

             /!* otroProblemaAdm: [],
              otroProblemaTec: [],
              otroProblemaFinan: [],*!/
             observacionHito: [],
             observacionHitoEvaluado: [],
             equipoTec: [],

         };*/

        /* this.dataInfTec.objEspecifico.filter((value, index, arr) => {
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
                 if (value3.cActividadDescripcion == null || value3.iCantidad == null || value3.iUnidadMedidaId == null) {
                     valCampoLLenos = false;
                     msj4 = 'Faltan datos de las actividades en el formulario.';
                 }
             });

         });*/

        if (valCampoLLenos) {
            const credencial_id = this._dataService.getOption().credencialActual.iCredId;
            const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
            this.dataInfTec.auditoria.credencial_id = credencial_id;
            this.dataInfTec.auditoria.ip = ip;
            let retorno;
            switch (tipo) {
                case 'infTec':
                    const arrControl = ['cArchivoAnexo'];
                    this.dataInfTec.objGral.filter((value, index, arr) => {
                        if (value.cArchivo) {
                            // console.log(value.cArchivo[0].name);
                            this.frmInfTecnico.addControl('cArchivo' + value.iIndicadorId, new FormControl(value.cArchivo, Validators.required));
                            arrControl.push('cArchivo' + value.iIndicadorId);
                        }
                    });
                    this.dataInfTec.objEspecifico.filter((value, index, arr) => {
                        if (value.cArchivo) {
                            // console.log(value.cArchivo[0].name);
                            this.frmInfTecnico.addControl('cArchivo' + value.iIndicadorId, new FormControl(value.cArchivo, Validators.required));
                            arrControl.push('cArchivo' + value.iIndicadorId);
                        }
                    });
                    this.dataInfTec.actividades.filter((value, index, arr) => {
                        if (value.cArchivo) {
                            // console.log(value.cArchivo[0].name);
                            this.frmInfTecnico.addControl('cArchivoAct' + value.iActividadId, new FormControl(value.cArchivo, Validators.required));
                            arrControl.push('cArchivoAct' + value.iActividadId);
                        }
                    });

                    const data2 = {
                        carpeta: this.idProyecto + '/infAvance' ,
                        prefijo: 'Ht' + this.dataHito.iNumeroHito + '_',
                        sufijo: 'av',
                        controlArchivo: arrControl
                    };
                    const frmTratar = this.frmInfTecnico;
                    // this.frmInfTecnicoControl.cArchivoAnexo.reset(0);
                    const dataExtra = {...this.dataInfTec, ...frmTratar.getRawValue(), ...data2};
                    // console.log(this.dataInfTec);

                    this.frmInfTecnico.addControl('newcontrol', new FormControl('', Validators.required));
                    // console.log(this.frmInfTecnico);
                    // console.log(arrControl);

                    retorno = await (await this.queryInvestigacion.enviarArchivo(
                        'mantenimiento_informe_tec_hito',
                        this.frmInfTecnico,
                        // this.dataInfTec,
                        arrControl,
                        dataExtra
                    ));
                    // console.log(this.dataInfTec);
                    break;
            }
            // @ts-ignore
            if (!retorno.error) {
                 this.router.navigate(['/informes/informe_hito']);

                //  this.router.navigate(['/proyecto/indicador_hito_proyecto']);
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
        this.router.navigate(['/informes/informe_hito']);
    }

    calculaPorctInd(avTecHito: any, tipCalculo: string) {
        let todo = avTecHito.iMeta;
        // console.log(tipCalculo);
        // console.log(avTecHito.iMeta + '-' + avTecHito.totalEjecAntesHito);

        if (tipCalculo == 'pendiente') {
            todo = avTecHito.iMeta - avTecHito.totalEjecAntesHito;
        }
        avTecHito.nEjecutadoPorcentaje = (avTecHito.iCantidad / todo) * 100;
    }

    async abrirModal(tipo: string, ctrlModal = null) {
        switch (tipo) {
            case 'observacion':

                /* const valBusc = this.frmGastoProyectoControl.valBuscSIGA.value ? this.frmGastoProyectoControl.valBuscSIGA.value : '%%';
                 this.dataServidor.listaDatosSiga = await this.queryInvestigacion.datosServidorAsync({
                     tipo: 'data_pedidos_SIGA',
                     data: [2019, this.infoSiga.SecEje, valBusc, this.infoSiga.empleado, 'B', this.infoSiga.centroCosto, '', '']
                 });*/
                break;
            case 'Proveedor':
                // this.buscarProveedor();
                break;

        }
        if (ctrlModal) {
            this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg'});
        }
    }

    generarPdf(tipo: string) {
        let rutaRep;
        let data;
        data = [this.idProyecto, this.dataInfTec.iInfoAvTecId, this.idHito];
        switch (tipo) {
            case 'infAvTec':
                rutaRep = '/inv/gestion/descargas/infAvTec/' + this.idProyecto + '/' + this.dataInfTec.iInfoAvTecId + '/' + this.idHito;
                break;
        }
        window.open(
            this.urlAPI + rutaRep
        );

        this.queryInvestigacion
            .getReporte(rutaRep, data, '')
            .toPromise()
            .then(
                res => {
                    let blob: Blob;
                    // @ts-ignore
                    blob = new Blob([res], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });
                    const blobUrl = URL.createObjectURL(blob);
                },
                error => {

                },
            );
    }

    mostrarPDF(ctrlModal, url) {
        // console.log(url);
        const ur = encodeURI(this.baseUrl + url);
        this.pdfActual = ur.replace(' ', '%20');
        this.modalAbierto = true;
        this.modalService.open(ctrlModal, {size: 'lg', backdrop: 'static', windowClass: 'modalPDF'});
    }

    cerrarPDF() {
        this.pdfActual = null;
        this.cargandoPdfError = false;
        this.cargandoPdf = false;
        this.modalAbierto = false;
    }

    comparaRubro(avFinan: any) {
        if (this.rubroAnterior !== avFinan.iRubroId) {
            this.rubroAnterior = avFinan.iRubroId;
            return true;
        } else {
            return false;
        }
    }

    mayusculaAll(op: string, data: any, s: string) {
        data[op] = s;
    }
}

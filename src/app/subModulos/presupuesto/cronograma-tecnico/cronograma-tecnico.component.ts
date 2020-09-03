import {Component, OnInit} from '@angular/core';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';
import {LocalService} from '../../../servicios/local.services';
import {Objetivo} from './models/objetivo';
import {Actividad} from './models/actividad';
import {Cronograma} from './models/cronograma';
import {MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';
import {environment} from '../../../../environments/environment';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {Indicador} from './models/indicador';




@Component({
    selector: 'app-cronograma-tecnico',
    templateUrl: './cronograma-tecnico.component.html',
    styleUrls: ['./cronograma-tecnico.component.scss'],
    providers: [MessageService],
})
export class CronogramaTecnicoComponent implements OnInit {
    activeIndex = 5;
    idProyecto;
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
        sel_en_lista: null,
    };
    dataServidor = {
        listaUnidadMedida: null,
        listaConvocatoria: null,
        mostrarLista: null,
        mostrarLista1: null,
        listaactividades: null,
    };

    loading = false;

    listaMeses = {
        numMes: [],
    };

    perfilesDeUsuarios;
    perfilActual = null;
    iNumMesesProyecto;
    itemsExp;
    urlAPI: string;
    iEstadoPropuesta;
    constructor(
        public _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private messageService: MessageService,
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private local: LocalStoreService,
        private router: Router,
        private _constantes: ConstantesService,
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.urlAPI = environment.urlAPI;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.postulante].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.idProyecto = this._dataService.idProySel;
            if (this.idProyecto > 0){
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'data_proyecto',
                    data: [this.idProyecto]
                }).subscribe(data => {
                    console.log(data);
                    this.iEstadoPropuesta = data[0].iEstadoPropuesta;
                });
            }
            this.cargarLista();
          //  await this.getNumeroMeses(this.idProyecto);
            await this.getObjEspecifico(this.idProyecto);
            this.opcionExportar();

            this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_actividad_presupuesto',
                data: [this.idProyecto]
            }).subscribe(data => {
                this.dataServidor.listaactividades = data;
                // console.log('-----');
                // console.log(data);
            });
        }
    }
    opcionExportar() {
        this.itemsExp = [
            {
                label: 'Avance Tecnico y Financiero de Proyectos', icon: 'pi pi-file-pdf', command: () => {
                    this.generarPdf('repPptPtXrubroResumen'); // data_rubro_presupuesto_gasto_resumen
                }
            },
            {
                label: 'Presupuesto del Rubro Detallado', icon: 'pi pi-file-pdf', command: () => {
                    this.generarPdf('repPptPtXrubroDetallado'); // data_rubro_presupuesto_gasto_resumen
                }
            },
        ];
    }
    async getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_rubro_proyecto1',
            data: [idProyecto, '']
        });
        this.dataExtraProyecto.objEspecifico.length = 0;
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            //   const ind = await this.getIndicadorObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const act = await this.getActividadObjetivo(idProyecto, dataObjEspecifico[index].iRubroId);
            const obj = new Objetivo();
            obj.iRubroId = dataObjEspecifico[index].iRubroId;
            obj.iProyectoId = dataObjEspecifico[index].iProyectoId;
            obj.cRubroDescripcion = dataObjEspecifico[index].cRubroDescripcion;
            // obj.iTipoObjetivoId = dataObjEspecifico[index].iTipoObjetivoId;
            // obj.indicador = ind;
            obj.actividad = act;

            await this.dataExtraProyecto.objEspecifico.push(obj);
        }
        // console.log(this.dataExtraProyecto.objEspecifico);
    }

    prueba() {
        // console.log(this.dataExtraProyecto.objEspecifico);
    }
    async getActividadObjetivo(idProyecto: any = false, idRubro: any = false) {
        const dataActividad = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_presupuestos_proyecto',
            data: [idProyecto, idRubro]
        });
        const aAct = [];
        // tslint:disable-next-line:forin
        for (const index in dataActividad) {
          //  const cro = await this.geCronogramaActividad(dataActividad[index].iDescripcionPresupuestoId);
            const act = new Actividad();
            act.iDescripcionPresupuestoId = dataActividad[index].iDescripcionPresupuestoId;
            act.iRubroId = dataActividad[index].iRubroId;
            act.cDetalle = dataActividad[index].cDetalle;
            act.iCantidad = dataActividad[index].iCantidad;
            act.nMonto = dataActividad[index].nMonto;

            act.nTotal = dataActividad[index].nTotal;
            act.iActividadId = dataActividad[index].iActividadId;
            act.cActividadDescripcion = dataActividad[index].cActividadDescripcion;
          //  act.cronograma = cro;
            await aAct.push(act);
        }
        // console.log(aAct)
        return aAct;
    }
    eliminarActividad(indexObj: any = false, indexAct: any = false) {
        this.dataExtraProyecto.objEspecifico[indexObj].actividad.splice(indexAct, 1);
    }

    async guardarProgTec() {
        let valCampoLLenos = true;

        let msj4 = '';
        this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {

            value.actividad.filter((value3, index3, arr3) => {
                // console.log(value3);
                if (value3.cDetalle == null || value3.nTotal == null  || value3.iActividadId == null  ) {
                    valCampoLLenos = false;
                    msj4 = 'Faltan datos de los presupuestos en el formulario.';
                }
            });

        });

        if (valCampoLLenos) {
            const credencial_id = this._dataService.getOption().credencialActual.iCredId;
            const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
            this.dataExtraProyecto.auditoria.credencial_id = credencial_id;
            this.dataExtraProyecto.auditoria.ip = ip;

            const retorno = await this.queryInvestigacion.guardarDatosAsync({
                tipo: 'mantenimiento_cronograma_descripcion_presupuesto',
                data: this.dataExtraProyecto
            });
        } else {
            await Swal.fire({
                title: 'Error:',
                text: msj4 + 'por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
        this.cargarLista();
    }

    cancelar() {
        this.router.navigate(['/investigacion']);
    }

    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_resumen_presupuesto',
            data: [this.idProyecto]
        }).subscribe(data => {
            // console.log(data);
            this.dataServidor.mostrarLista1 = data;
        });
    }

    llamarAccion(param: (string | any)[]) {
    }

    finalizar() {
        let msj = '';
        if ([this.perfilesDeUsuarios.integrante].includes(this.perfilActual)) {
            msj = 'Una vez finalizado no podrá realizar cambios!';
        }
        Swal.fire({
            title: 'Desea finalizar el registro de la propuesta del proyecto?',
            html: msj,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                Swal.fire(
                    'Enviado',
                    'La propuesta de Proyecto fue registrada con éxito',
                    'success'
                );
                this.terminarPostulacion();
            }
        });
    }

    generarPdf(tipo: string) {
        let rutaRep;
        let data;
        data = [this.idProyecto];
        switch (tipo) {
            case 'repPptPtXrubroResumen':
                rutaRep = '/inv/gestion/descargas/repPptPtXrubroResumen/' + this.idProyecto;
                break;
            case 'repPptPtXrubroDetallado':
                rutaRep = '/inv/gestion/descargas/repPptPtXrubroDetallado/' + this.idProyecto;
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

    async terminarPostulacion(){
        const data = {
            iProyectoId : this.idProyecto,
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'terminar_postulacion_proyecto',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            // console.log('enviado para guardar');
            this.router.navigate(['/investigacion']);
        }
    }
}



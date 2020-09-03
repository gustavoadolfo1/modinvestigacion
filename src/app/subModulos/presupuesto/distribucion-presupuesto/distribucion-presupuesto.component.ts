import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

import {DataServices} from '../../../servicios/data.services';

import {Router} from '@angular/router';
import {Actividad} from './models/actividad';
import {Cronograma} from './models/cronograma';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {Objetivo} from './models/objetivo';
import {Indicador} from './models/indicador';
import {ConstantesService} from '../../../servicios/constantes.service';
import {number} from 'ng2-validation/dist/number';
@Component({
    selector: 'app-distribucion-presupuesto',
    templateUrl: './distribucion-presupuesto.component.html',
    styleUrls: ['./distribucion-presupuesto.component.scss'],
    providers: [MessageService],
})
export class DistribucionPresupuestoComponent implements OnInit {

    activeIndex = 4;
   // private idProyecto;
    idProyecto: number
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

    };
    loading = false;

    listaMeses = {
        numMes: [],
    };

    sumatotal = 0;

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
            await this.getObjEspecifico(this.idProyecto);

            this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_unidad_medida',
                data: ['%%']
            }).subscribe(data => {
                this.dataServidor.listaUnidadMedida = data;
            });
        }
    }
    async getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_rubro_proyecto1',
            data: [idProyecto]
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
            obj.sumatoriaTotal = 0;
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
       //     const cro = await this.geCronogramaActividad(dataActividad[index].iDescripcionPresupuestoId);
            const act = new Actividad();
            act.iDescripcionPresupuestoId = dataActividad[index].iDescripcionPresupuestoId;
            act.iRubroId = dataActividad[index].iRubroId;
            act.cDetalle = dataActividad[index].cDetalle;
            act.iCantidad = dataActividad[index].iCantidad;
            act.cUnidadMedida = dataActividad[index].cUnidadMedida;
            act.cUnidadMedida = dataActividad[index].cUnidadMedida;
            act.nMonto = dataActividad[index].nMonto;
            act.nTotal = dataActividad[index].nTotal;
      //      act.cronograma = cro;
            await aAct.push(act);
        }
        // console.log(aAct)
        return aAct;
    }


    async agregarActividad(indexObj: any = false) {
        const aCro = [];
        for (let i = 1; i <= this.iNumMesesProyecto; i++) {
            const cro = new Cronograma();
            cro.iCronogramaPresId = null;
            cro.iDescripcionPresupuestoId = null;
            cro.nMes = i;
            cro.iEstado = false;
            await aCro.push(cro);
        }
        const act = new Actividad();
        act.iDescripcionPresupuestoId = null;
        act.iRubroId = this.dataExtraProyecto.objEspecifico[indexObj].iRubroId;
        act.cDetalle = null;
        act.iCantidad = 0;
        act.nMonto = 0;
        act.nTotal = 0;
        act.cUnidadMedida = null;
        act.cUnidadMedida = null;
        act.cronograma = aCro;

        await this.dataExtraProyecto.objEspecifico[indexObj].actividad.push(act);

    }

    eliminarActividad(indexObj: any = false, indexAct: any = false) {
        this.dataExtraProyecto.objEspecifico[indexObj].actividad.splice(indexAct, 1);
    }
    async guardarProgTec() {
        let valCampoLLenos = true;

        let msj4 = '';
        this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {

            value.actividad.filter((value3, index3, arr3) => {
                if (value3.cDetalle == null || value3.iCantidad == null || value3.cUnidadMedida == null) {
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
                tipo: 'mantenimiento_descripcion_presupuesto_cronograma_indicador',
                data: this.dataExtraProyecto
            });
            if (retorno){
                this.getObjEspecifico(this.idProyecto);
            }
        }
        else {
            await swal.fire({
                title: 'Error:',
                text: msj4 + 'por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
    }
    siguiente() {

        this.router.navigate(['/proyecto/cronograma_tecnico']);
    }
    calculoTotalActividad(actividad) {
            const rpta = actividad.nMonto * actividad.iCantidad;
            actividad.nTotal = rpta;
            return rpta;
    }
    sumar(){
        this.sumatotal = 0;
        // tslint:disable-next-line:forin
        console.log(this.dataExtraProyecto);
        // tslint:disable-next-line:forin
        for (const x  in this.dataExtraProyecto.objEspecifico){
            this.dataExtraProyecto.objEspecifico[x].sumatoriaTotal = 0;
            this.dataExtraProyecto.objEspecifico[x].actividad.forEach(e => {
                if (e.nTotal){
                    this.dataExtraProyecto.objEspecifico[x].sumatoriaTotal += parseFloat(e.nTotal);
                }else {
                    if (e.iCantidad && e.nMonto === undefined) {
                        console.log('entro');
                        e.nTotal = 1 * e.iCantidad;
                    }else if (e.nMonto && e.iCantidad === undefined) {
                        e.nTotal = parseFloat(e.nMonto) * 1.0;
                    }else {
                        e.nTotal = parseFloat(e.nMonto) * parseFloat(e.iCantidad);
                    }
                    this.dataExtraProyecto.objEspecifico[x].sumatoriaTotal += parseFloat(e.nTotal);
                }
            });
            // this.sumatotal += parseFloat(this.dataExtraProyecto.objEspecifico[x].nTotal);
        }
    }
    mayusculaUnidad(data: any, s: string) {
        data.cUnidadMedida = s;
    }
}

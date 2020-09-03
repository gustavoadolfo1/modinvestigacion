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
import {number} from 'ng2-validation/dist/number';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
  selector: 'app-financiable',
  templateUrl: './financiable.component.html',
  styleUrls: ['./financiable.component.scss'],
    providers: [MessageService],
})
export class FinanciableComponent implements OnInit {


    private idProyecto: string;
    dataExtraProyecto = {
        objEspecifico: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        },
        rubrosValores: undefined,
        rubrosValoresPresupuestoId: undefined, idProyecto: undefined

    };
    modelos = {
        sel_en_lista: null,
        valores: {},
        valoresPresupuestoId: {},
        valores1: {},
    };
    dataServidor = {
        mostrarLista1: null,
        mostrarLista2: null,
        listaactividades: null,
    };

    loading = false;

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
            this.cargarLista();
        }
    //    await this.getNumeroMeses(this.idProyecto);
    //    this.crearFormulario();

        //  await this.getObjEspecifico(this.idProyecto);
    }


    onTabClose(event) {
        this.messageService.add({severity: 'info', summary: 'Tab Closed', detail: 'Index: ' + event.index});
    }

    onTabOpen(event) {
        this.messageService.add({severity: 'info', summary: 'Tab Expanded', detail: 'Index: ' + event.index});
    }
    captureCheck(d){
        // console.log(d);
    }
    captureCheck1(e){
        // console.log(e);
    }

    prueba() {
        // console.log(this.dataExtraProyecto.objEspecifico);
    }

     getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico =  this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'rubro_presupuesto',
            data: [this.idProyecto]
        });
        this.dataExtraProyecto.objEspecifico.length = 0;
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            const obj = new Objetivo();

            obj.iProyectoId = dataObjEspecifico[index].iProyectoId;
            obj.iRubroId = dataObjEspecifico[index].iRubroId;
            obj.cRubroDescripcion = dataObjEspecifico[index].cRubroDescripcion;
            obj.totalPresupuesto = dataObjEspecifico[index].totalPresupuesto;
           this.dataExtraProyecto.objEspecifico.push(obj);
        }
        // console.log(this.dataExtraProyecto.objEspecifico);
    }


    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'rubro_presupuesto',
            data: [this.idProyecto]
        }).subscribe(data => {
            // console.log(data);
            this.dataServidor.mostrarLista1 = data;
            this.dataServidor.mostrarLista1.filter((val, idx) => {
                this.modelos.valores[val.iRubroId] = val.nTotalPresupuesto * 1;
                this.modelos.valoresPresupuestoId[val.iRubroId] = val.iPresupuestoId;
            });
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_presupuesto_disponible',
            data: [this.idProyecto]
        }).subscribe(data => {
            // console.log(data);
            this.dataServidor.mostrarLista2 = data;
        });
    }

    llamarAccion(param: (string | any)[]) {
    }

    async guardarProgTec() {
        let valCampoLLenos = true;

        let msj4 = '';
        this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {

            value.data.filter((value3, index3, arr3) => {
                if (value3.totalPresupuesto == null || value3.iPresupuestoId == null) {
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
            this.dataExtraProyecto.rubrosValores = this.modelos.valores;
            this.dataExtraProyecto.rubrosValoresPresupuestoId = this.modelos.valoresPresupuestoId;
            this.dataExtraProyecto.idProyecto = this.idProyecto;
            const retorno = await this.queryInvestigacion.guardarDatosAsync({
                tipo: 'saldo_presupuestal',
                data: this.dataExtraProyecto
            });
            // @ts-ignore
            if (!retorno.error) {
                this.cargarLista();
            }

        } else {

          await  swal.fire({
                title: 'Error:',
                text: msj4 + 'por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }

    }

    cancelar() {

    }
}

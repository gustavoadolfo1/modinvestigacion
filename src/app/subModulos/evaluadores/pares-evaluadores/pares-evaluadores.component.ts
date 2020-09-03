
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {MessageService} from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { LocalStoreService } from '../../../shared/services/local-store.service';
import {ConstantesService} from '../../../servicios/constantes.service';
import {LocalService} from '../../../servicios/local.services';
import {Router} from '@angular/router';


@Component({
    selector: 'app-pares-evaluadores',
    templateUrl: './pares-evaluadores.component.html',
    styleUrls: ['./pares-evaluadores.component.scss'],
    providers: [MessageService],
})
export class ParesEvaluadoresComponent implements OnInit {

    dataServidor = {
        mostrarLista: null,
        listaMiembros: null,
    };

    modelos = {
        sel_en_lista: null,
        sel_en_lista_persona: undefined
    };

    dataExtraProyecto = {
        miembros: [],
    };

    pers_seleccionada = {
        i: null,
        foto: null,
        nombres_completos: null,
        dni: null,
        persona_id: null,
        iParEvaluadorId: null
    };
    tipoPersModal = null;
    isVisibleDiv = false;


    editandoMiembro = false;
    modalDestinatario = null;

    private idParEvaluador: any;
    nomProyecto;
    estadoPropuesta;
    perfilActual = null;
    perfilesDeUsuarios;
    idProyecto: string;


    constructor(
        public _constantes: ConstantesService,
        private messageService: MessageService,
        private queryInvestigacion: QueryInvestigacionServices,
        public _dataService: DataServices,
        private queryTramite: QueryInvestigacionServices,
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        public store: LocalStoreService,
        private local: LocalService,
        private router: Router,
    ) {
        if (!this._dataService.idProySel){
           this.router.navigate(['/investigacion/']);
        }
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
    }
    frmAgregarMiembro: FormGroup;
    frmRegistro: FormGroup;
    p: any;

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.parEvaluador].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.idProyecto = this._dataService.idProySel;
            await this.getProyecto(this.idProyecto);
            this.cargarLista();
            this.crearFormulario();
            this.frmRegistro.updateValueAndValidity();
        }

    } ///////
    async getProyecto(idProyecto: any = false) {
        const dataProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_proyecto',
            data: [idProyecto]
        });
        this.nomProyecto = dataProyecto[0].cNombreProyecto;
        this.estadoPropuesta = dataProyecto[0].iEstadoPropuesta;
    }
    get frmRegistroControl() {
       return this.frmRegistro.controls;
    }  //////////

    get frmAgregarMiembroControl() {
        return this.frmAgregarMiembro.controls;
    } /////

    crearFormulario() {



        this.frmAgregarMiembro = this.formBuilder.group({

            idDependencia: [localStorage.getItem('ofsel')],
            idProyecto: [''],
            idParEvaluador: [''],
            valBuscMiembro: [''],
            idMiembro: ['', Validators.required],
            txtNomApeMiembro: ['', Validators.required],
            // aqui pongo la fecha
            dtFechaEntrega: [''],
            idTipoMiembro: ['', Validators.required],
            txtTipoMiembro: ['', Validators.required],

            idParEvaluadorProyecto: '',

            auditoria: this.formBuilder.group({

                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),

        });
        this.frmRegistro = this.formBuilder.group({

            countObjEspecifico: [''],
            concepto: [false],
            idConcepto: [''],

            // PARA EDITAR
            iProyectoId: [''],

            // EXTRAS ENVIAR
            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });

    }  //////


/**********sel para  evaluador x proyecto id********/
    cargarLista() {
        const idProyecto = this.idProyecto;
        // const idProyecto = localStorage.getItem('proysel');
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_evaluador',
            data: [idProyecto, (this.idParEvaluador)]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            if (this.dataServidor.mostrarLista.length > 1) {
                this.idParEvaluador = this.dataServidor.mostrarLista[0].iParEvaluadorId;
            }
            console.log(data);
        });
    }   ///////
    /******************************************** */
    async abrirMiembroModal(tipoPersona, ctrlModal = null) {
        this.tipoPersModal = tipoPersona;
        const valBusc = this.frmAgregarMiembroControl.valBuscMiembro.value ? this.frmAgregarMiembroControl.valBuscMiembro.value : '%%';
        this.dataServidor.listaMiembros = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_pares_evaluadores',
            data: [tipoPersona, valBusc]
        });
        if (ctrlModal) {
            this.modalService.open(ctrlModal, { backdrop: 'static', size: 'lg' });
        }
    }  ////////
    seleccionarMiembro(regPer, i) {
        this.pers_seleccionada = regPer;
        if (this.tipoPersModal == 1) {
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue(regPer.cPersDescripcion);
            this.frmAgregarMiembroControl.idMiembro.setValue(regPer.iMiembroId);
        }
    } ////////

    async llamarAccion(data) {
        switch (data[0]) {
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'evaluadores_proyecto',
                    data: [data[2].iParEvaluadorProyectoId]
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                }
                break;
        }
    }


    /*******AQUI GUARDA PROCEDIMIENTO A PROYECTO ID*****/
    async guardarMiembro(){
        // console.log(this.pers_seleccionada);
        const acGuardarParEvaluador = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'evaluadores_proyecto',
            data: {
                idProyecto: this.idProyecto, // localStorage.getItem('proysel'),
                idParEvaluador: this.pers_seleccionada.iParEvaluadorId,
                idParEvaluadorProyecto: '',
                dtFechaEntrega: this.frmAgregarMiembroControl.dtFechaEntrega.value,

                auditoria: {
                    nombre_equipo: '',
                    mac: '',
                    credencial_id: this._dataService.getOption().credencialActual.iCredId,
                    ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                },
            }
        }).catch(error => {
            // console.log(error);
        });
        this.cargarLista();
        // console.log(acGuardarParEvaluador);
    }  /////////
    /************************************************************** */
    abrirModal(ctrModal, nuevo = true, indice = null) {

        if (nuevo) {
            this.frmAgregarMiembroControl.valBuscMiembro.setValue('');
            this.frmAgregarMiembroControl.idMiembro.setValue('');
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue('');

            /////aqui podria poner la fecha
            this.frmAgregarMiembroControl.idTipoMiembro.setValue('');
            this.frmAgregarMiembroControl.txtTipoMiembro.setValue('');

            this.modalDestinatario = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });

        } else {
            this.editandoMiembro = true;
            this.modalDestinatario = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });
            // console.log('editando');
            // console.log(this.dataExtraProyecto.miembros[indice]);
            this.llenarFrmAgregarMiembro(this.dataExtraProyecto.miembros[indice]);
        }

    }  ///////

    llenarFrmAgregarMiembro(data: any = false) {
        if (data) {
            this.frmAgregarMiembro.patchValue(data);
        } else {
            this.frmAgregarMiembro.reset();

        }

    } /*******/

    accModalAgregarMiembro(accion) {
        switch (accion) {
            case 'agregar':
                // console.log(this.frmAgregarMiembro.value);
                if (this.frmAgregarMiembro.valid) {
                    let error = false;
                    this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                        if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                            error = true;
                        }
                    });
                    if (!error) {
                        this.dataExtraProyecto.miembros.push(this.frmAgregarMiembro.value);
                        console.warn(this.dataExtraProyecto.miembros);
                    }
                }
                break;
            case 'del':
                this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                    if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                        this.dataExtraProyecto.miembros.splice(index, 1);
                    }
                });
                break;
            case 'save':
                this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                    if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                        this.dataExtraProyecto.miembros[index] = this.frmAgregarMiembro.value;
                    }
                });
                break;
        }
        if (this.modalDestinatario) {
            this.modalDestinatario.close('guardar');
        }
        this.editandoMiembro = false;
    }  ///////

    /************************************************ */









}








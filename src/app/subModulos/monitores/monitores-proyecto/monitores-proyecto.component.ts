import {Component, OnInit} from '@angular/core';
import {ConstantesService} from '../../../servicios/constantes.service';
import {MessageService} from 'primeng/api';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {DataServices} from '../../../servicios/data.services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {LocalService} from '../../../servicios/local.services';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-monitores-proyecto',
    templateUrl: './monitores-proyecto.component.html',
    styleUrls: ['./monitores-proyecto.component.scss'],
    providers: [MessageService],
})
export class MonitoresProyectoComponent implements OnInit {
    dataServidor = {
        mostrarLista: null,
        listaMiembros: null,
    };
    modelos = {
        sel_en_lista: null,
        sel_en_lista_persona: null
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

    idParEvaluador: any;
    nomProyecto;
    perfilActual = null;
    perfilesDeUsuarios;
    idProyecto;
    modalMonitor: any;

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

    frmAgregarMonitor: FormGroup;
    frmRegistro: FormGroup;
    p: any;

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.parEvaluador].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.idProyecto = this._dataService.idProySel;
            this.nomProyecto = this._dataService.nombProySel;
            this.cargarLista();
            this.crearFormulario();
            //  this.frmRegistro.updateValueAndValidity();
        }
    }

    get frmAgregarMonitorControl() {
        return this.frmAgregarMonitor.controls;
    } /////

    crearFormulario() {
        this.frmAgregarMonitor = this.formBuilder.group({
            iProyectoId: ['', Validators.required],
            iMonitorId: ['', Validators.required],
            valBuscMonitor: [''],
            txtNomApeMonitor: ['', Validators.required],
            cDocAsignacion: [''],
            dtFechaAsignacion: [''],
            cEstadoMonitor: [''],

            iMonitorProyectoId: '',

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

    }

    cargarLista() {
        const idProyecto = this.idProyecto;
        // const idProyecto = localStorage.getItem('proysel');
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_monitores_proyecto',
            data: [idProyecto, (this.idParEvaluador)]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            if (this.dataServidor.mostrarLista.length > 1) {
                this.idParEvaluador = this.dataServidor.mostrarLista[0].iParEvaluadorId;
            }
            console.log(data);
        });
    }

    async abrirMonitorModal(tipoPersona, ctrlModal = null) {
        this.tipoPersModal = tipoPersona;
        const valBusc = this.frmAgregarMonitorControl.valBuscMonitor.value ? this.frmAgregarMonitorControl.valBuscMonitor.value : '%%';
        this.dataServidor.listaMiembros = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_monitores',
            data: [tipoPersona, valBusc]
        });
        if (ctrlModal) {
            this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg'});
        }
    }

    seleccionarMonitor(regPer, i) {
        this.pers_seleccionada = regPer;
        if (this.tipoPersModal == 1) {
            this.frmAgregarMonitorControl.txtNomApeMonitor.setValue(regPer.cPersDescripcion);
            this.frmAgregarMonitorControl.iMonitorId.setValue(regPer.iMonitorId);
        }
    }

    async guardarMonitor() {
        // console.log(this.pers_seleccionada);
        const frmTratarControl = this.frmAgregarMonitorControl;
        const frmTratar = this.frmAgregarMonitor;
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            if (frmTratar.invalid) {
                // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                await Swal.fire({
                    title: 'Error:',
                    text: 'Faltan datos en el formulario. por favor verifique',
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                return false;
            } else {
                console.warn(frmTratar.getRawValue());
                const retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: 'monitores_proyecto',
                    data: frmTratar.value
                });
                // @ts-ignore
                if (!retorno.error) {
                    // this.limpiarFormularioPersona();
                    // this.modalPesona.close();
                    this.modalMonitor.close('guardar');
                    this.cargarLista();
                    // this.limpiarFormulario();
                    // this.modalActivo.close();
                    // this.modalService.dismissAll();
                }
            }

        }

        /* const acGuardarParEvaluador = await this.queryInvestigacion.guardarDatosAsync({
             tipo: 'evaluadores_proyecto',
             data: {
                 idProyecto: this.idProyecto,
                 idParEvaluador: this.pers_seleccionada.iParEvaluadorId,
                 idParEvaluadorProyecto: '',
                 dtFechaEntrega: this.frmAgregarMonitorControl.dtFechaAsignacion.value,
                 docDesignacion: this.frmAgregarMonitorControl.docDesignacion.value,

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
         this.cargarLista();*/
        // console.log(acGuardarParEvaluador);
    }

    llamarAccion(data) {
        switch (data[0]) {
            case 'nuevo':
                // this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
                // this.imprimir.modalPreTitulo = 'Nueva Convocatoria | ';
                // this.imprimirModalTitulo('');
                this.limpiarFormulario();
                this.modalMonitor = this.modalService.open(data[1], {
                    backdrop: 'static',
                    windowClass: 'modal-small',
                    centered: true
                });
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                // this.imprimir.modalPreTitulo = 'Editar Convocatoria | ';
                // this.imprimirModalTitulo('');
                this.modalMonitor = this.modalService.open(data[1], {
                    centered: true,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-small'
                });
                break;
            case 'cambiar_estado':
                Swal.fire({
                    title: 'Desea cambiar el Estado del Monitor?',
                    html: 'El estado actual del Monitor es <strong>' + (data[2].cEstadoMonitor == 1 ? 'Activo' : 'Inactivo') + '</strong>',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si',
                    cancelButtonText: 'No',
                }).then((result) => {
                    if (result.value) {
                        this.cambiarEstadoMonitor(data[2].iMonitorProyectoId, data[2].cEstadoMonitor);
                    }
                });
                break;
        }

    }
    async cambiarEstadoMonitor(iMonitorProyectoId, cEstadoMonitor) {
        const data = {
            iMonitorProyectoId: iMonitorProyectoId,
            cEstadoMonitor: (cEstadoMonitor == 1 ? 0 : 1),
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'monitores_proyecto_estado',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            this.cargarLista();
            // console.log('enviado para guardar');
        }
    }


    limpiarFormulario(data: any = false) {
        console.log(data);
        this.frmAgregarMonitorControl.iProyectoId.setValue(this.idProyecto);
        this.frmAgregarMonitorControl.iMonitorProyectoId.setValue(data ? data.iMonitorProyectoId : '');
        this.frmAgregarMonitorControl.iMonitorId.setValue(data ? data.iMonitorId : '');

        this.frmAgregarMonitorControl.valBuscMonitor.setValue(data ? data.valBuscMonitor : '');
        this.frmAgregarMonitorControl.txtNomApeMonitor.setValue(data ? (data.cPersPaterno + ' ' + data.cPersMaterno + ' ' + data.cPersNombre ) : '');

        this.frmAgregarMonitorControl.cDocAsignacion.setValue(data ? data.cDocAsignacion : '');
        this.frmAgregarMonitorControl.dtFechaAsignacion.setValue(data ? data.dtFechaAsignacion : '');
        this.frmAgregarMonitorControl.cEstadoMonitor.setValue(data ? data.cEstadoMonitor : '');

    }
}

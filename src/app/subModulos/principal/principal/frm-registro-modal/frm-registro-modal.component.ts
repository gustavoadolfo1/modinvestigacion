import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataServices} from '../../../../servicios/data.services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QueryInvestigacionServices} from '../../../../servicios/query-investigacion.services';
import {formatDate} from '@angular/common';
import {combineLatest, Observable} from 'rxjs';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {SharedAnimations} from '../../../../shared/animations/shared-animations';
import {environment} from '../../../../../environments/environment';
import {HtSearchService} from '../../../../hynotech/services/ht-search.service';
import swal from 'sweetalert2';
import {LocalStoreService} from '../../../../shared/services/local-store.service';

@Component({
    selector: 'app-frm-registro-modal',
    templateUrl: './frm-registro-modal.component.html',
    styleUrls: ['./frm-registro-modal.component.scss'],
    animations: [SharedAnimations]
})
export class FrmRegistroModalComponent implements OnInit {
    // @Input() nomApeMiembro: string;
    @Input() id: number;
    @Input() titulo: string;
    @Input() tipo_tramite_id: string;
    @Input() credencial_id: string;
    @Input() accion: string;
    @Input() dataRecibido: any;

    @Input() customTitle: any;

    @Output() accionesRetorno = new EventEmitter<string>();

    dataServidor = {
        listaCarreras: null,
        listaLineasInvestigacion: null,
        listaTipoProyecto: null,
        listaEstadoProyecto: null,
        listaFuenteProyecto: null,
        listaAnyoAprobado: null,

        listaMiembros: null,
        listaTipoMiembro: null,

        listaDocumentosGestion: null,

        listaPersonas: null,

        tipoPersonas: null,
        tipoIdentificacion: null,
        dataRenic: null,

        listaSelecReferencias: null,
        listaConvocatoria: null
    };

    dataExtraProyecto = {
        miembros: [],
        objEspecifico: [],
    };

    pers_seleccionada = {
        i: null,
        foto: null,
        nombres_completos: null,
        dni: null,
        persona_id: null
    };

    /*
        buffer = {
            listaDocumentosGestion: [],
            mostrarLista: [],

            tamanio: 50,
            itemsAntesFinParaCargar: 10,
        };*/

    frmRegistro: FormGroup;
    tipoPersModal = null;
    isVisibleDiv = false;

    frmAgregarMiembro: FormGroup;
    frmAgregarObjEspecifico: FormGroup;
    frmDestinatario: FormGroup;
    frmPersona: FormGroup;

    editandoMiembro = false;
    editandoObjEsp = false;
    modalMiembro = null;
    modalObjEsp = null;
    listaBusqueda: Observable<any[]>;
    imgsDomain = environment.urlPublic + 'fotografia/';
    page = 1;
    pageSize = 6;

    enviandoFormulario = false;
    loading = false;
    data: any;
    tipoUsuario: any;
    docMiembroDirector: undefined;

    constructor(
        private queryInvestigacion: QueryInvestigacionServices,
        public _dataService: DataServices,
        private queryTramite: QueryInvestigacionServices,
        public busquedaService: HtSearchService,
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        private store: LocalStoreService,
    ) {
    }

    ngOnInit() {
        this.crearFormulario();
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_carreras',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaCarreras = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipoProyecto = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'estado_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaEstadoProyecto = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'fuente_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaFuenteProyecto = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_anyo',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaAnyoAprobado = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_miembro',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipoMiembro = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'convocatorias_activa',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaConvocatoria = data;
        });

        // Validaciones
        if (this.dataRecibido) {
            this.dataExtraProyecto.miembros.length = 0;
            this.dataExtraProyecto.miembros = this.dataRecibido.miembros;
            this.dataExtraProyecto.objEspecifico.length = 0;
            this.dataExtraProyecto.objEspecifico = this.dataRecibido.objEspecifico;
            // console.log(this.dataExtraProyecto.objEspecifico.length);
            // if (this.dataRecibido.miembros) {
            console.log('recibido miembros');
            console.log(this.dataExtraProyecto.miembros);
            // }
            this.mostrarLineaInv(this.dataRecibido.idCarrera);
            // console.log(JSON.stringify(this.dataExtraProyecto.objEspecifico));
            this.frmRegistro.patchValue(this.dataRecibido);
            this.validarObjEspecificos();
            console.log(this.dataExtraProyecto.objEspecifico.length);

        }

        this.frmRegistro.updateValueAndValidity();

        // carlos chong
        let timerInterval;
        swal.fire({
            title: 'Cargando',
            html: '<br><strong></strong>',
            timer: 2000,
            onBeforeOpen: () => {
                swal.showLoading();
                timerInterval = setInterval(() => {
                    const impr = Math.ceil((swal.getTimerLeft() / 1000));
                    swal.getContent().querySelector('strong').textContent = String(impr);
                }, 100);
            },
            onClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            if (
                /* Read more about handling dismissals below */
                result.dismiss === swal.DismissReason.timer
            ) {
                this.isVisibleDiv = true;
                console.log('I was closed by the timer');
            }
        });
        this.AsignarDirector();
    }

    get frmRegistroControl() {
        return this.frmRegistro.controls;
    }

    get frmAgregarMiembroControl() {
        return this.frmAgregarMiembro.controls;
    }

    get frmAgregarObjEspecificoControl() {
        return this.frmAgregarObjEspecifico.controls;
    }

    get frmPersonaControl() {
        return this.frmPersona.controls;
    }

    crearFormulario() {
        this.frmRegistro = this.formBuilder.group({
            idCarrera: ['', Validators.required],
            idLineaInvestigacion: ['', Validators.required],
            idTipoProyecto: ['', Validators.required],
            idEstadoProyecto: ['', Validators.required],
            idFuenteProyecto: ['', Validators.required],
            idAnyoAprobado: ['', Validators.required],

            resolucionProyecto: [''],
            presupuestoProyecto: [''],
            nombreProyecto: ['', Validators.required],
            objetivoGeneral: ['', Validators.required],
            objetivoEspecifico: [''],
            observacionProyecto: [''],
            archivoProyecto: ['', Validators.required],
            idConvocatoria: ['', Validators.required],
            idDependencia: [localStorage.getItem('ofsel')],
            // idDependencia: [this._dataService.getOption().ofSeleccionada.iDepenId],

            countObjEspecifico: ['', Validators.required],
            concepto: [false],
            idConcepto: [''],

            // PARA EDITAR
            iProyectoId: [''],

            // EXTRAS ENVIAR
            miembros: [],
            objEspecifico: [],

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });

        this.frmAgregarMiembro = this.formBuilder.group({
            valBuscMiembro: [''],
            idMiembro: ['', Validators.required],
            txtNomApeMiembro: ['', Validators.required],
            idTipoMiembro: ['', Validators.required],
            txtTipoMiembro: ['', Validators.required],
        });

        this.frmAgregarObjEspecifico = this.formBuilder.group({
            iObjetivoId: [''],
            cObjetivo: ['', Validators.required],
            indexDataExtra: [''],
        });

        this.frmPersona = this.formBuilder.group({
            idTipoPersona: ['', Validators.required],
            idTipoIdentidad: ['', Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],

            apellidoPaterno: ['', Validators.required],
            apellidoMaterno: ['', Validators.required],
            nombres: ['', Validators.required],
            sexo: ['', Validators.required],
            fechaNacimiento: [''],

            razonSocial: [''],
            razonSocialCorto: [''],
            razonSocialSigla: [''],
            representanteLegal: [''],

            // PARA EDIT
            iPersId: '',

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }

    mostrarLineaInv(idCarrera) {
        this.frmRegistroControl.idLineaInvestigacion.setValue('');
        const idCar = (idCarrera > 0) ? idCarrera : this.frmRegistroControl.idCarrera.value;
        console.log('idcar');
        console.log(idCarrera);
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_linea_inv',
            data: [idCar]
        }).subscribe(data => {
            this.dataServidor.listaLineasInvestigacion = data;
            // console.warn(data);
        });
    }

    cambioSelecTipoMiembro($event = null) {
        // console.warn("evetno"+$event);
        this.frmAgregarMiembroControl.txtTipoMiembro.setValue($event.cTipoMiembroDescripcion);
    }

    async accionesProyecto(tipo) {
        switch (tipo) {
            case 'guardar':
                // tslint:disable-next-line:forin
                for (const propertyName in this.dataExtraProyecto) {
                    this.frmRegistroControl[propertyName].setValue(this.dataExtraProyecto[propertyName]);
                }
                this.frmRegistroControl.idDependencia.setValue(this._dataService.getOption().ofSeleccionada.iDepenId);
                const ret = await this.enviarFormulario('mantenimiento_proyecto');
                // @ts-ignore
                if (!ret.error) {
                    this.activeModal.dismiss('cancel');
                    this.retornarValor({accion: 'recargarLista', data: ret});
                }
                this.enviandoFormulario = false;
                break;
        }
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        let envioProyecto = 0;
        switch (tipo_form) {
            case 'mantenimiento_proyecto':
                frmTratarControl = this.frmRegistroControl;
                frmTratar = this.frmRegistro;
                envioProyecto = 1;
                break;
            case 'mantenimiento_persona':
                frmTratarControl = this.frmPersonaControl;
                frmTratar = this.frmPersona;
                break;
        }
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            this.enviandoFormulario = true;
            if (frmTratar.invalid) {
                // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                await swal.fire({
                    title: 'Error:',
                    text: 'Faltan datos en el formulario. por favor verifique',
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                this.enviandoFormulario = false;
                return false;
            } else {
                let retorno = null;
                if (envioProyecto == 1) {
                    const data2 = {
                        carpeta: 'Proyectos',
                        prefijo: 'Proy',
                        sufijo: 'suf',
                        controlArchivo: 'archivoProyecto'
                        //  data: JSON.stringify(frmTratar.getRawValue())
                    };
                    const dataExtra = {...frmTratar.getRawValue(), ...data2};
                    retorno = await (await this.queryInvestigacion.enviarArchivo(
                        tipo_form,
                        this.frmRegistro,
                        ['archivoProyecto'],
                        dataExtra
                    ));
                } else {
                    // console.warn(frmTratar.getRawValue());
                    retorno = await this.queryInvestigacion.guardarDatosAsync({
                        tipo: tipo_form,
                        data: frmTratar.getRawValue()
                    });
                }
                // @ts-ignore
                if (!retorno.error) {
                    return retorno;
                }
            }
            this.enviandoFormulario = false;
        }
    }

    seleccionarResultado(item) {
        this.busquedaService.abrirBusqueda = false;
        this.frmRegistroControl[this.busquedaService.controlActual].setValue(item.iPersId);


        let actualizado = false;
        this.busquedaService.seleccionado.filter((value, index, arr) => {
            if (value.control == this.busquedaService.controlActual) {
                this.busquedaService.seleccionado[index].value = item.iPersId;
                this.busquedaService.seleccionado[index].text = item.cPersDescripcion + ' (' + item.cPersDocumento + ')';
                actualizado = true;
            }
        });
        if (!actualizado) {
            this.busquedaService.seleccionado.push({
                control: this.busquedaService.controlActual,
                value: item.iPersId,
                text: item.cPersDescripcion + ' (' + item.cPersDocumento + ')'
            });
        }
    }

    async abrirMiembroModal(tipoPersona, ctrlModal = null) {
        this.tipoPersModal = tipoPersona;
        const valBusc = this.frmAgregarMiembroControl.valBuscMiembro.value ? this.frmAgregarMiembroControl.valBuscMiembro.value : '%%';
        this.dataServidor.listaMiembros = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_miembros',
            data: [tipoPersona, valBusc]
        });
        if (ctrlModal) {
            this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg'});
        }
    }

    seleccionarMiembro(regPer, i) {
        if (this.tipoPersModal == 1) {
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue(regPer.cPersDescripcion);
            this.frmAgregarMiembroControl.idMiembro.setValue(regPer.iMiembroId);
        }
    }

    abrirModal(ctrModal, nuevo = true, indice = null) {
        if (nuevo) {
            this.frmAgregarMiembroControl.valBuscMiembro.setValue('');
            this.frmAgregarMiembroControl.idMiembro.setValue('');
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue('');
            this.frmAgregarMiembroControl.idTipoMiembro.setValue('');
            this.frmAgregarMiembroControl.txtTipoMiembro.setValue('');

            this.modalMiembro = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });
        } else {
            this.editandoMiembro = true;
            this.modalMiembro = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });
            console.log('editando');
            console.log(this.dataExtraProyecto.miembros[indice]);
            this.llenarFrmAgregarMiembro(this.dataExtraProyecto.miembros[indice]);
        }
    }

    abrirModalObjEsp(ctrModal, nuevo = true, indice = null) {
        if (nuevo) {
            this.frmAgregarObjEspecificoControl.iObjetivoId.setValue('');
            this.frmAgregarObjEspecificoControl.cObjetivo.setValue('');

            this.modalObjEsp = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });

        } else {
            this.editandoObjEsp = true;
            this.modalObjEsp = this.modalService.open(ctrModal, {
                backdrop: 'static',
                windowClass: 'modal-small',
                centered: true
            });
            console.log(this.dataExtraProyecto.objEspecifico[indice]);
            console.log(indice);
            this.llenarFrmAgregarObjEsp(this.dataExtraProyecto.objEspecifico[indice], indice);
        }
    }

    llenarFrmAgregarObjEsp(data: any = false, index = false) {
        console.log(index);
        if (data) {
            this.frmAgregarObjEspecificoControl.indexDataExtra.setValue(index);
            this.frmAgregarObjEspecifico.patchValue(data);
            console.log(this.frmAgregarObjEspecifico);
        } else {
            this.frmAgregarObjEspecifico.reset();
        }
    }

    abrirCualquierModal(ctrModal: object = {modal: null, opciones: null}, nuevo = true, indice = null) {
        const opDef = {backdrop: 'static', centered: true};
        // @ts-ignore
        const newOpc = {...opDef, ...ctrModal.opciones};
        // @ts-ignore
        this.modalMiembro = this.modalService.open(ctrModal.modal, newOpc);

    }

    AsignarDirector() {
        const doc = undefined;
        this.data = this.store.getItem('userInfo');
        if (this.data != undefined || this.data != null) {
            // @ts-ignore
            doc = this.data['grl_persona']['cPersDocumento'];
        }
        this.data = this.store.getItem('tipUs');
        if (this.data != undefined || this.data != null) {
            this.tipoUsuario = this.data['tipUs'];
        }
        switch (this.tipoUsuario) {
            case '0':
                break;
            case '1':
                this.docMiembroDirector = doc;
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'data_miembros',
                    data: [1, this.docMiembroDirector]
                }).subscribe(data => {
                    this.frmAgregarMiembroControl.valBuscMiembro.setValue('');
                    this.frmAgregarMiembroControl.idMiembro.setValue(data[0].iMiembroId);
                    this.frmAgregarMiembroControl.txtNomApeMiembro.setValue(data[0].cPersDescripcion);
                    this.frmAgregarMiembroControl.idTipoMiembro.setValue('1');
                    this.frmAgregarMiembroControl.txtTipoMiembro.setValue('DIRECTOR');
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
                });
                break;
            case '2':
                break;
        }
    }

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
        if (this.modalMiembro) {
            this.modalMiembro.close('guardar');
        }
        this.editandoMiembro = false;
    }

    llenarFrmAgregarMiembro(data: any = false) {
        if (data) {
            this.frmAgregarMiembro.patchValue(data);
        } else {
            this.frmAgregarMiembro.reset();
        }
    }

    // RETORNAR VALORES
    retornarValor(data) {
        console.log(data);
        this.accionesRetorno.emit(data);
    }

    // PARA SELECT
    // SELECT
    /* onScrollToEnd() {
         this.fetchMore();
     }

     onScroll({end}) {
         if (this.loading || this.dataServidor.listaDocumentosGestion.length <= this.buffer.listaDocumentosGestion.length) {
             return;
         }

         if (end + this.buffer.itemsAntesFinParaCargar >= this.buffer.listaDocumentosGestion.length) {
             this.fetchMore();
         }

     }

     private fetchMore() {
         const len = this.buffer.listaDocumentosGestion.length;
         const more = this.dataServidor.listaDocumentosGestion.slice(len, this.buffer.tamanio + len);
         this.loading = true;
         // using timeout here to simulate backend API delay
         setTimeout(() => {
             this.loading = false;
             this.buffer.listaDocumentosGestion = this.buffer.listaDocumentosGestion.concat(more);
         }, 200);
     }*/

    llamarAccion(data) {
        switch (data[0]) {
            case 'agregar_miembro':
                if (!this.estaEnMiembros(data[1])) {
                    this.dataExtraProyecto.miembros.push(data[1]);
                }
                break;
            case 'nuevo_persona':
                this.queryTramite.datosInvestigacionServidor({
                    tipo: 'tipo_persona',
                    data: []
                }).subscribe(dataP => {
                    this.dataServidor.tipoPersonas = dataP;
                    this.frmPersonaControl.idTipoPersona.setValue(this.tipoPersModal);
                });

                this.queryTramite.datosInvestigacionServidor({
                    tipo: 'tipo_identificacion',
                    data: []
                }).subscribe(dataI => {
                    this.dataServidor.tipoIdentificacion = dataI;
                    this.frmPersonaControl.idTipoIdentidad.setValue(dataI[0].iTipoIdentId);
                });
                // CREAR PERSONA
                this.modalService.open(data[1], {backdrop: 'static', size: 'lg'});
                break;
            case 'consultar_reniec':
                this.queryTramite.datosPideServidor(
                    'reniec',
                    '',
                    {dni: this.frmPersonaControl.numeroDocumento.value}
                ).subscribe(dataDNI => {
                    // @ts-ignore
                    if (!dataDNI.error) {
                        // @ts-ignore
                        this.dataServidor.dataRenic = dataDNI.data;
                        // @ts-ignore
                        this.frmPersonaControl.apellidoPaterno.setValue(dataDNI.data.cReniecApel_pate);
                        // @ts-ignore
                        this.frmPersonaControl.apellidoMaterno.setValue(dataDNI.data.cReniecApel_mate);
                        // @ts-ignore
                        this.frmPersonaControl.nombres.setValue(dataDNI.data.cReniecNombres);
                    }
                });
                break;
        }
    }

    keytab(event) {
        const element = event.srcElement.nextElementSibling; // get the sibling element

        if (element == null) {  // check if its null
            return;
        } else {
            element.focus();
        }   // focus if not null
    }

    estaEnMiembros(data, eliminar = false) {
        let varRetorno = false;
        this.dataExtraProyecto.miembros.filter((value, index, arr) => {
            if (value.iTramId == data.iTramId) {
                if (eliminar) {
                    this.dataExtraProyecto.miembros.splice(index);
                }
                varRetorno = true;
            }
        });
        return varRetorno;
    }

    agregarObjEspecifico() {
        if (this.frmRegistroControl.objetivoEspecifico.value != '') {
            const objE = {
                iObjetivoId: null,
                cObjetivo: this.frmRegistroControl.objetivoEspecifico.value,
                indexDataExtra: this.dataExtraProyecto.objEspecifico.length
            };
            this.frmRegistroControl.objetivoEspecifico.setValue('');
            this.dataExtraProyecto.objEspecifico.push(objE);
        }
        console.warn(this.dataExtraProyecto.objEspecifico);
        this.validarObjEspecificos();
    }

    validarObjEspecificos(){
        if (this.dataExtraProyecto.objEspecifico.length == 0){
            this.frmRegistroControl.countObjEspecifico.setValue('');
        }else{
            this.frmRegistroControl.countObjEspecifico.setValue(this.dataExtraProyecto.objEspecifico.length);
        }
    }

    accModalAgregarObjEsp(accion) {
        switch (accion) {
            case 'agregar':
                break;
            case 'del':
                console.log(this.frmAgregarObjEspecificoControl.indexDataExtra.value);
                this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {
                    if (value.indexDataExtra == this.frmAgregarObjEspecificoControl.indexDataExtra.value) {
                        this.dataExtraProyecto.objEspecifico.splice(index, 1);
                    }
                });
                break;
            case 'save':
                this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {
                    if (value.indexDataExtra == this.frmAgregarObjEspecificoControl.indexDataExtra.value) {
                        this.dataExtraProyecto.objEspecifico[index] = this.frmAgregarObjEspecifico.value;
                    }
                });
                break;
        }
        this.validarObjEspecificos();
        if (this.modalObjEsp) {
            this.modalObjEsp.close('guardar');
        }
        this.editandoObjEsp = false;
    }
}

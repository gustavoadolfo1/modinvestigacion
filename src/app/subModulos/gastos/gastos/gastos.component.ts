import {Component, OnInit, ViewChild} from '@angular/core';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import swal from 'sweetalert2';
import {LocalService} from '../../../servicios/local.services';
import {Objetivo} from '../../proyecto/programacion-tecnica/models/objetivo';
import {Indicador} from '../../proyecto/programacion-tecnica/models/indicador';
import {Actividad} from '../../proyecto/programacion-tecnica/models/actividad';
import {Cronograma} from '../../proyecto/programacion-tecnica/models/cronograma';
import {MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';
import {environment} from '../../../../environments/environment';
import {endianness} from 'os';

@Component({
    selector: 'app-gastos',
    templateUrl: './gastos.component.html',
    styleUrls: ['./gastos.component.scss'],
    providers: [MessageService],
})
export class GastosComponent implements OnInit {
    @ViewChild('modalPersonaEdit', {static: false}) modalPersonaEdit;
    urlAPI: string;
    dataExtraProyecto = {
        objEspecifico: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        }
    };
    listaMeses = {
        numMes: [],
    };
    dataServidor = {
        mostrarLista: null,
        listaActividades: null,
        listaAnyo: null,
        listaMes: null,
        listaDia: null,
        mostrarListaDetalle: null,
        mostrarAvancePresupuestal: null,
        listaDatosSiga: null,
        listaUnidadMedida: undefined,
        listaTipoDocGasto: undefined,
        listaDatosProveedor: undefined,
        tipoPersonas: null,
        tipoIdentificacion: undefined,
        listaHito: null,
        proveedor: null,
        listaAnyoAprobado: null
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
        modalTituloPresupuesto: null,
        detalleTitulo: null

    };
    modelos = {
        sel_en_lista: null,
        sel_en_lista_act: undefined,
        sel_en_lista_ind: undefined,
        sel_en_lista_prov: undefined,
        sel_en_lista_siga: undefined

    };
    frmGastoProyecto: FormGroup;
    frmPersona: FormGroup;

    enviandoFormulario = false;
    loading: false;
    verDetalle: boolean;
    PedidoSIGA = null;
    idProyecto: string;
    nomProyecto: any;
    dataConvocatoria: Object;
    avanceActidad = 0;
    avanceObjInd = 0;
    idActividadAvance = 0;
    idObjIndAvance = 0;
    infoSiga = {
        SecEje: 1230,
        centroCosto: '1230.19.05',
        empleado: '', // '23984603',
    };
    modalPesona: any;
    perfilActual = null;
    perfilesDeUsuarios;
    itemsExp;
    disable = {
        integrante: false,
    };
    iCalendarioId;
    p: number;
    iNumMesesProyecto;
    dataProyecto: Object;
    conProveedor = true;
    constructor(
        private _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private modalActivo: NgbActiveModal,
        private formBuilder: FormBuilder,
        private local: LocalService,
        private router: Router,
        private _constantes: ConstantesService,
    ) {
        if (!this._dataService.idProySel){
            this.router.navigate(['/investigacion/']);
        }
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.urlAPI = environment.urlAPI;
    }

    get frmGastoProyectoControl() {
        return this.frmGastoProyecto.controls;
    }

    get frmPersonaControl() {
        return this.frmPersona.controls;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.monitor].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.idProyecto = this._dataService.idProySel;
            this.nomProyecto = this._dataService.nombProySel;
            // this.idProyecto = localStorage.getItem('proysel');
            // await this.getProyecto(this.idProyecto);
            // this.nomProyecto = this.local.getItem('proyselNom');
            await this.crearFormulario();
            await this.cargarLista();
            await this.getNumeroMeses(this.idProyecto);
            await this.getObjEspecifico(this.idProyecto);
            this.opcionExportar();
        }
    }

    opcionExportar() {
        this.itemsExp = [
            {
                label: 'Presupuesto y Gasto x Rubro Resumen', icon: 'pi pi-file-pdf', command: () => {
                    this.generarPdf('repPptGtXrubroResumen'); // data_rubro_presupuesto_gasto_resumen
                }
            },
            {
                label: 'Presupuesto y Gasto x Rubro Detallado', icon: 'pi pi-file-pdf', command: () => {
                    this.generarPdf('repPptGtXrubroDetallado'); // data_rubro_presupuesto_gasto_resumen
                }
            },
        ];
    }

    async crearFormulario() {
        this.frmGastoProyecto = this.formBuilder.group({
            anyoSIGA: [''],
            tipoBSSIGA: [''],
            valBuscSIGA: [''],
            valBuscProveedor: [''],
            cRazonSocial: [''],

            iHitoId: ['', Validators.required],
            idProyecto: ['', Validators.required],
            iRubroId: ['', Validators.required],
            iActividadId: ['', Validators.required],
            iCalendarioId: ['', Validators.required],
            iPresupuestoId: [''], // restringido?
            iTipoDocGastoId: ['', Validators.required],
            iPersId: [''],
            cDocAprueba: ['', Validators.required],
            cNroDocGasto: ['', Validators.required],
            dtGasto: [''],
            nGasto: [''],
            cAccion: ['', Validators.required],
            cDocRend: [''],
            cRendDeta: [''],
            cFueraFecha: [''],
            iAvanceAct: [''],

            cSigaAnoEje: [''],
            cSigaSecEjec: [''],
            cSigaTipoBien: [''],
            cSigaNroPedido: [''],
            cSigaFechaPedido: [''],
            cSigaCodigoEstadoPed: [''],
            cSigaMotivoPedido: [''],
            cSigaCentroCosto: [''],
            cSigaEmpleado: [''],
            cSigaFteFto: [''],
            cSigaActProy: [''],
            cSigaTipoActProy: [''],
            cSigaMetaPresupuestal: [''],
            cSigaCodigoTarea: [''],
            cSigaNroOrden: [''],
            cSigaFechaCompra: [''],
            cSigaNroRequer: [''],
            cSigaSubTotalSoles: [''],
            cSigaIgvSoles: [''],
            cSigaTotalFactSoles: [''],
            cSigaEstadoSiaf: [''],
            cSigaExpSiaf: [''],
            cSigaExpSiga: [''],
            cSigaNroCertifica: [''],
            cSigaNroRuc: [''],
            // PARA EDIT
            idGastoProy: '',

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),

        });
        this.frmPersona = this.formBuilder.group({
            idTipoPersona: ['', Validators.required],
            idTipoIdentidad: ['', Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(11)]],

            apellidoPaterno: [''],
            apellidoMaterno: [''],
            nombres: [''],
            sexo: [''],
            fechaNacimiento: [''],

            razonSocial: ['', Validators.required],
            razonSocialCorto: ['', Validators.required],
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

    async llamarAccion(data) {
        // console.log(data);
        switch (data[0]) {
            case 'nuevo_persona':
                this.frmPersonaControl.idTipoPersona.setValue(2);
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'tipo_identificacion',
                    data: []
                }).subscribe(dataI => {
                    this.dataServidor.tipoIdentificacion = dataI;
                    this.frmPersonaControl.idTipoIdentidad.setValue(dataI[1].iTipoIdentId);
                });
                // CREAR PERSONA
                this.modalPesona = this.modalService.open(data[1], {backdrop: 'static', size: 'lg'});
                break;
            case 'nuevo':
                this.limpiarFormulario();
                const index = +this.dataServidor.listaAnyoAprobado.length - 1;
                this.frmGastoProyectoControl.anyoSIGA.setValue(this.dataServidor.listaAnyoAprobado[index].iYearId);
                // this.frmGastoProyecto.controls['cRazonSocial'].disable();
                this.frmGastoProyectoControl.iRubroId.reset(data[2] ? data[2].iRubroId : '');
                this.frmGastoProyectoControl.idProyecto.reset(this.idProyecto ? this.idProyecto : '');
                this.imprimir.modalPreTitulo = 'Nuevo Gasto del Proyecto | ' + data[2].cRubroDescripcion;
                if (this.dataServidor.listaHito.length > 0) {
                    if ([this.perfilesDeUsuarios.integrante].includes(this.perfilActual)) {
                        const primero = this.dataServidor.listaHito[0];
                        this.dataServidor.listaHito = [];
                        this.dataServidor.listaHito[0] = primero;
                    }
                    this.frmGastoProyectoControl.iHitoId.setValue(+this.dataServidor.listaHito[0].iHitoId);
                    // console.log(this.dataServidor.listaHito);
                    // console.log(+this.dataServidor.listaHito[0].iHitoId);
                }
                this.imprimirModalTitulo('');
                this.buscarPresupuesto(data[2].iRubroId);
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'detalle':
                this.imprimir.detalleTitulo = 'Detalle del Rubro: ' + data[2].cRubroDescripcion;
                this.cargarListaDetalle(data[2].iRubroId);
                this.verDetalle = true;
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.iCalendarioId = data[2].iCalendarioId;
                this.getObjEspecifico(this.idProyecto);
                this.imprimir.modalPreTitulo = 'Editar Gasto del Proyecto | ';
                this.imprimirModalTitulo('');
                this.buscarPresupuesto(data[2].iRubroId);
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_gasto_proyecto',
                    data: [data[2].iGastoId]
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                    this.cargarListaDetalle(data[2].iRubroId);
                }
                break;
        }
    }

// REUTILIZABLES
    async cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_rubro_presupuesto_gasto_resumen',
            data: [this.idProyecto]
        }).subscribe(data => {
            // console.log(data);
            this.dataServidor.mostrarLista = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_avance_presupuestal',
            data: [this.idProyecto]
        }).subscribe(data => {
            // console.log(data);
            this.dataServidor.mostrarAvancePresupuestal = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_unidad_medida',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaUnidadMedida = data;
        });

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_tipo_documento_gasto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipoDocGasto = data;
        });

        this.dataServidor.listaHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [this.idProyecto, null, 1]
        });
        this.dataServidor.listaAnyoAprobado = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_anyo',
            data: ['%%']
        });


    }

    cargarListaDetalle(iRubroId) {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_rubro_presupuesto_gasto_detalle',
            data: [this.idProyecto, iRubroId]
        }).subscribe(data => {
            this.dataServidor.mostrarListaDetalle = data;
        });
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        let dataGuardar;
        switch (tipo_form) {
            case 'mantenimiento_persona':
                frmTratarControl = this.frmPersonaControl;
                frmTratar = this.frmPersona;
                break;
            case 'mantenimiento_gasto_proyecto':
                frmTratarControl = this.frmGastoProyectoControl;
                frmTratar = this.frmGastoProyecto;
                const dataIndcador = {
                    indicador: []
                };
                // console.log(this.dataExtraProyecto.objEspecifico);
                this.frmGastoProyectoControl.iCalendarioId.reset(this.iCalendarioId);
                this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {
                    // if (value.iObjetivoId == this.idObjIndAvance) {
                    value.actividad.filter((value2, index2, arr2) => {
                        value2.cronograma.filter((value3, index3, arr3) => {
                            if (+value3.iCalendarioId == +this.iCalendarioId) {
                                this.frmGastoProyectoControl.iActividadId.reset(value3.iActividadId);
                            }
                            //   if (value2.iActividadId == this.idActividadAvance) {
                            //   this.frmGastoProyectoControl.iActividadId.reset(value2.iActividadId);
                            // this.frmGastoProyectoControl.iAvanceAct.reset(value2.iAvance);
                            // this.frmGastoProyectoControl.iCalendarioId.reset(value2.mesCalGasto);
                            //  }
                        });
                    });
                    /* value.indicador.filter((value3, index3, arr3) => {
                         if (value3.iAvance > 0) {
                             dataIndcador.indicador.push(value3);
                         }
                     });*/
                    // }
                });

                if (this.conProveedor == true){
                    const valBuscProv = this.frmGastoProyectoControl.valBuscProveedor.value ? this.frmGastoProyectoControl.valBuscProveedor.value : '';
                    if (valBuscProv.length == 11){
                        // console.log(valBuscProv.length);
                        this.dataServidor.proveedor = await this.queryInvestigacion.datosServidorAsync({
                            tipo: 'data_personas_x_documento',
                            data: [2, valBuscProv]
                        });
                        if (this.dataServidor.proveedor.length == 0) {
                            await swal.fire({
                                title: 'Error:',
                                text: 'El Proveedor no se encuentra registrado. por favor registrelo',
                                type: 'error',
                                confirmButtonText: 'Registrar',
                            });

                            this.frmPersonaControl.numeroDocumento.reset(this.frmGastoProyectoControl.valBuscProveedor.value);
                            this.frmPersonaControl.razonSocial.reset(this.frmGastoProyectoControl.cRazonSocial.value);
                            this.frmPersonaControl.razonSocialCorto.reset(this.frmGastoProyectoControl.cRazonSocial.value);
                            this.llamarAccion(['nuevo_persona', this.modalPersonaEdit]);
                            return false;
                        } else {
                            this.frmGastoProyectoControl.iPersId.reset(this.dataServidor.proveedor[0].iPersId);
                            // console.log(' registrado');
                        }
                    }else{
                        await swal.fire({
                            title: 'Error:',
                            text: 'El RUC no es valido. Verifique por favor...',
                            type: 'error',
                            confirmButtonText: 'Verificar',
                        });
                        return false;
                    }
                }



                /*if ( this.frmGastoProyectoControl.iPersId.value ==){


                }*/

                // dataGuardar = {...dataIndcador};

                // console.log(dataIndcador);
                // console.log(frmTratar.value);
                // console.log(dataGuardar);
                //  return false;
                break;
        }
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            dataGuardar = {...frmTratar.value, ...dataGuardar};
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
                const retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: tipo_form,
                    data: dataGuardar
                });
                // @ts-ignore
                if (!retorno.error) {

                    this.verDetalle = false;
                    switch (tipo_form) {
                        case 'mantenimiento_persona':
                            this.frmGastoProyectoControl.valBuscProveedor.reset(this.frmPersonaControl.numeroDocumento.value);
                            this.buscarProveedor();
                            this.limpiarFormularioPersona();
                            this.modalPesona.close();
                            break;
                        case 'mantenimiento_gasto_proyecto':
                            this.cargarLista();
                            this.limpiarFormulario();
                            this.modalService.dismissAll();
                            break;
                    }
                }
            }
            this.enviandoFormulario = false;
        }
    }

    limpiarFormularioPersona() {
        this.frmPersonaControl.numeroDocumento.reset('');
        this.frmPersonaControl.razonSocial.reset('');
        this.frmPersonaControl.razonSocialCorto.reset('');
        this.frmPersonaControl.razonSocialSigla.reset('');
        this.frmPersonaControl.representanteLegal.reset('');
    }

    limpiarFormulario(data: any = false) {
        console.log(data);
        this.PedidoSIGA = null;
        if (data == false) {
            this.frmGastoProyecto.reset();
        } else {
            this.conProveedor = (+data.iPersId > 0 ? true : false);
            this.frmGastoProyecto.patchValue(data);
        }

        this.frmGastoProyectoControl.valBuscSIGA.reset();
        this.frmGastoProyectoControl.valBuscProveedor.reset();
        this.frmGastoProyectoControl.cAccion.reset(data ? data.cAccion : '');

        this.frmGastoProyectoControl.idGastoProy.reset(data ? data.iGastoId : '');
        this.frmGastoProyectoControl.iHitoId.reset(data ? data.iHitoId : '');
        this.frmGastoProyectoControl.idProyecto.reset(data ? data.iProyectoId : '');
        this.frmGastoProyectoControl.iRubroId.reset(data ? data.iRubroId : '');
        this.frmGastoProyectoControl.iActividadId.reset(data ? data.iActividadId : '');
        this.frmGastoProyectoControl.iCalendarioId.reset(data ? data.iCalendarioId : '');
        this.frmGastoProyectoControl.iPresupuestoId.reset(data ? data.iPresupuestoId : '');
        this.frmGastoProyectoControl.iTipoDocGastoId.reset(data ? data.iTipoDocGastoId : '');
        this.frmGastoProyectoControl.iPersId.reset(data ? data.iPersId : '');

        this.frmGastoProyectoControl.cDocAprueba.reset(data ? data.cDocAprueba : '');
        this.frmGastoProyectoControl.cNroDocGasto.reset(data ? data.cNroDocGasto : '');
        this.frmGastoProyectoControl.dtGasto.reset(data ? data.dtGasto : '');
        this.frmGastoProyectoControl.nGasto.reset(data ? data.nGasto : '');
        this.frmGastoProyectoControl.cAccion.reset(data ? data.cAccion : '');
        this.frmGastoProyectoControl.cDocRend.reset(data ? data.cDocRend : '');
        this.frmGastoProyectoControl.cRendDeta.reset(data ? data.cRendDeta : '');
        this.frmGastoProyectoControl.cFueraFecha.reset(data ? data.cFueraFecha : '');
        this.frmGastoProyectoControl.iAvanceAct.reset(data ? data.iAvanceAct : '');

        this.limpiarAvanceTenico();
        this.iCalendarioId = data ? data.iCalendarioId : '';


        this.frmGastoProyectoControl.valBuscSIGA.reset(data ? data.cSigaNroPedido : '');
        this.frmGastoProyectoControl.valBuscProveedor.reset(data ? data.cPersDocumento : '');
        this.frmGastoProyectoControl.cRazonSocial.reset(data ? data.cPersRazonSocialNombre : '');

        this.frmGastoProyectoControl.cAccion.reset(data ? data.cAccion : '');

        this.frmGastoProyectoControl.cSigaAnoEje.reset(data ? data.cSigaAnoEje : '');
        this.frmGastoProyectoControl.cSigaSecEjec.reset(data ? data.cSigaSecEjec : '');

        this.frmGastoProyectoControl.cSigaTipoBien.reset(data ? data.cSigaTipoBien : '');
        this.frmGastoProyectoControl.cSigaNroPedido.reset(data ? data.cSigaNroPedido : '');
        this.frmGastoProyectoControl.cSigaFechaPedido.reset(data ? data.cSigaFechaPedido : '');
        this.frmGastoProyectoControl.cSigaCodigoEstadoPed.reset(data ? data.cSigaCodigoEstadoPed : '');
        this.frmGastoProyectoControl.cSigaMotivoPedido.reset(data ? data.cSigaMotivoPedido : '');
        this.frmGastoProyectoControl.cSigaCentroCosto.reset(data ? data.cSigaCentroCosto : '');
        this.frmGastoProyectoControl.cSigaEmpleado.reset(data ? data.cSigaEmpleado : '');
        this.frmGastoProyectoControl.cSigaFteFto.reset(data ? data.cSigaFteFto : '');
        this.frmGastoProyectoControl.cSigaActProy.reset(data ? data.cSigaActProy : '');
        this.frmGastoProyectoControl.cSigaTipoActProy.reset(data ? data.cSigaTipoActProy : '');
        this.frmGastoProyectoControl.cSigaMetaPresupuestal.reset(data ? data.cSigaMetaPresupuestal : '');
        this.frmGastoProyectoControl.cSigaCodigoTarea.reset(data ? data.cSigaCodigoTarea : '');
        this.frmGastoProyectoControl.cSigaNroOrden.reset(data ? data.cSigaNroOrden : '');
        this.frmGastoProyectoControl.cSigaFechaCompra.reset(data ? data.cSigaFechaCompra : '');
        this.frmGastoProyectoControl.cSigaNroRequer.reset(data ? data.cSigaNroRequer : '');
        this.frmGastoProyectoControl.cSigaSubTotalSoles.reset(data ? data.cSigaSubTotalSoles : '');
        this.frmGastoProyectoControl.cSigaIgvSoles.reset(data ? data.cSigaIgvSoles : '');
        this.frmGastoProyectoControl.cSigaTotalFactSoles.reset(data ? data.cSigaTotalFactSoles : '');
        this.frmGastoProyectoControl.cSigaEstadoSiaf.reset(data ? data.cSigaEstadoSiaf : '');
        this.frmGastoProyectoControl.cSigaExpSiaf.reset(data ? data.cSigaExpSiaf : '');
        this.frmGastoProyectoControl.cSigaExpSiga.reset(data ? data.cSigaExpSiga : '');
        this.frmGastoProyectoControl.cSigaNroCertifica.reset(data ? data.cSigaNroCertifica : '');
        this.frmGastoProyectoControl.cSigaNroRuc.reset(data ? data.cSigaNroRuc : '');




    }

    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }

    /*
        mostrarAnyo(iActividadId = 0) {
            this.frmGastoProyectoControl.idAnyo.setValue('');
            const idAct = (iActividadId > 0) ? iActividadId : this.frmGastoProyectoControl.iActividadId.value;
            this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_calendario_anyos',
                data: [idAct]
            }).subscribe(data => {
                this.dataServidor.listaAnyo = data;
                this.frmGastoProyectoControl.idMes.setValue('');
            });
        }
    */


    async mostrarMes(iActividadId = 0, idAnyo = 0, idMes = 0) {
        this.frmGastoProyectoControl.idMes.setValue('');
        const idAct = (iActividadId > 0) ? iActividadId : this.frmGastoProyectoControl.iActividadId.value;
        const idAy = (idAnyo > 0) ? idAnyo : this.frmGastoProyectoControl.idAnyo.value;
        this.dataServidor.listaMes = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_calendario_meses',
            data: [idAct, idAy]
        });
        if (idMes !== 0) {
            this.frmGastoProyectoControl.idMes.reset(idMes ? idMes : '');
            this.llenarDatosAdic();
        }
    }

    llenarDatosAdic(iActividadId = 0, idAnyo = 0, idMes = 0) {
        // console.log('datos adicionales');
        // this.frmGastoProyectoControl.idMes.setValue('');
        const idProy = this.frmGastoProyectoControl.idProyecto.value;
        const idRub = this.frmGastoProyectoControl.iRubroId.value;
        const idAct = (iActividadId > 0) ? iActividadId : this.frmGastoProyectoControl.iActividadId.value;
        const idAy = (idAnyo > 0) ? idAnyo : this.frmGastoProyectoControl.idAnyo.value;
        const idMe = (idMes > 0) ? idMes : this.frmGastoProyectoControl.idMes.value;
        if (idAct !== '' && idAy !== '' && idMe !== '') {

            this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_calendario_id',
                data: [idAct, idAy, idMe]
            }).subscribe(data => {
                this.frmGastoProyectoControl.iCalendarioId.reset(data[0].iCalendarioId ? data[0].iCalendarioId : '');
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'data_presupuesto',
                    data: [idProy, idRub, data[0].iCalendarioId, idAct]
                }).subscribe(data2 => {
                    // @ts-ignore
                    if (data2.length > 0) {
                        this.imprimir.modalTituloPresupuesto = 'Asignado ' + data2[0].nPresupuesto;
                        this.frmGastoProyectoControl.iPresupuestoId.setValue(data2[0].iPresupuestoId);
                    } else {
                        this.imprimir.modalTituloPresupuesto = 'No se asigno presupuesto ';
                        this.frmGastoProyectoControl.iPresupuestoId.setValue('');
                    }
                    this.imprimirModalTitulo(this.imprimir.modalTituloPresupuesto);
                });
            });
        }
    }

    async abrirModal(tipo: string, ctrlModal = null) {
        switch (tipo) {
            case 'SIGA':
                const valBusc = this.frmGastoProyectoControl.valBuscSIGA.value ? this.frmGastoProyectoControl.valBuscSIGA.value : '%%';
                const anyoSIGA = this.frmGastoProyectoControl.anyoSIGA.value ? this.frmGastoProyectoControl.anyoSIGA.value : '';
                const tipoBSSIGA = this.frmGastoProyectoControl.tipoBSSIGA.value ? this.frmGastoProyectoControl.tipoBSSIGA.value : '';
                this.dataServidor.listaDatosSiga = await this.queryInvestigacion.datosServidorAsync({
                    tipo: 'data_pedidos_SIGA',
                    data: [anyoSIGA, this.infoSiga.SecEje, valBusc, this.infoSiga.empleado, tipoBSSIGA, this.infoSiga.centroCosto, '', '']
                });
                break;
            case 'Proveedor':
                this.buscarProveedor();
                break;

        }

        // console.log(this.dataServidor.listaDatosSiga);
        if (ctrlModal) {
            this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg'});
        }
    }

    seleccionarPedidoSIGA(regPer: any, i: number) {
        if (i !== -1){
            this.conProveedor = true;
            this.PedidoSIGA = regPer;
        }
        // console.log(this.PedidoSIGA);
        this.frmGastoProyectoControl.valBuscProveedor.reset(regPer.NRO_RUC ? regPer.NRO_RUC : '');
        this.frmGastoProyectoControl.cRazonSocial.reset(regPer.NOMBRE_PROV ? regPer.NOMBRE_PROV : '');

        this.frmGastoProyectoControl.cAccion.reset(regPer.NOMBRE_BSO ?
            '(' + Math.round(regPer.CANTIDAD) + ' ' + regPer.UNIDAD_MEDIDA + ') ' + regPer.NOMBRE_BSO + ' - ' + regPer.NOMBRE_MARCA : '');


        this.frmGastoProyectoControl.cDocAprueba.reset(regPer.DOCUMENTO_REF_OAD ? regPer.DOCUMENTO_REF_OAD : '');
        this.frmGastoProyectoControl.nGasto.reset(regPer.TOTAL_FACT_SOLES ? regPer.TOTAL_FACT_SOLES : '');
        this.frmGastoProyectoControl.dtGasto.reset(regPer.FECHA_ORDEN_OAD ? regPer.FECHA_ORDEN_OAD : '');
        this.frmGastoProyectoControl.cRendDeta.reset(regPer.EXP_SIAF ? 'EXP. SIAF N° ' + regPer.EXP_SIAF : '');

        // this.frmGastoProyectoControl.iPersonaId.reset(regPer.FECHA_ORDEN_OAD ? regPer.FECHA_ORDEN_OAD : '');
        this.frmGastoProyectoControl.cSigaAnoEje.reset(regPer.ANO_EJE ? regPer.ANO_EJE : '');
        this.frmGastoProyectoControl.cSigaSecEjec.reset(regPer.SEC_EJEC ? regPer.SEC_EJEC : '');

        this.frmGastoProyectoControl.cSigaTipoBien.reset(regPer.TIPO_BIEN ? regPer.TIPO_BIEN : '');
        this.frmGastoProyectoControl.cSigaNroPedido.reset(regPer.NRO_PEDIDO ? regPer.NRO_PEDIDO : '');
        this.frmGastoProyectoControl.cSigaFechaPedido.reset(regPer.FECHA_PEDIDO ? regPer.FECHA_PEDIDO : '');
        this.frmGastoProyectoControl.cSigaCodigoEstadoPed.reset(regPer.CODIGO_ESTADO_PED ? regPer.CODIGO_ESTADO_PED : '');
        this.frmGastoProyectoControl.cSigaMotivoPedido.reset(regPer.MOTIVO_PEDIDO ? regPer.MOTIVO_PEDIDO : '');
        this.frmGastoProyectoControl.cSigaCentroCosto.reset(regPer.CENTRO_COSTO ? regPer.CENTRO_COSTO : '');
        this.frmGastoProyectoControl.cSigaEmpleado.reset(regPer.EMPLEADO ? regPer.EMPLEADO : '');
        this.frmGastoProyectoControl.cSigaFteFto.reset(regPer.FTE_FTO ? regPer.FTE_FTO : '');
        this.frmGastoProyectoControl.cSigaActProy.reset(regPer.ACT_PROY ? regPer.ACT_PROY : '');
        this.frmGastoProyectoControl.cSigaTipoActProy.reset(regPer.TIPO_ACT_PROY ? regPer.TIPO_ACT_PROY : '');
        this.frmGastoProyectoControl.cSigaMetaPresupuestal.reset(regPer.META_PRESUPUESTAL ? regPer.META_PRESUPUESTAL : '');
        this.frmGastoProyectoControl.cSigaCodigoTarea.reset(regPer.CODIGO_TAREA ? regPer.CODIGO_TAREA : '');
        this.frmGastoProyectoControl.cSigaNroOrden.reset(regPer.NRO_ORDEN ? regPer.NRO_ORDEN : '');
        this.frmGastoProyectoControl.cSigaFechaCompra.reset(regPer.FECHA_COMPRA ? regPer.FECHA_COMPRA : '');
        this.frmGastoProyectoControl.cSigaNroRequer.reset(regPer.NRO_REQUER ? regPer.NRO_REQUER : '');
        this.frmGastoProyectoControl.cSigaSubTotalSoles.reset(regPer.SUBTOTAL_SOLES ? regPer.SUBTOTAL_SOLES : '');
        this.frmGastoProyectoControl.cSigaIgvSoles.reset(regPer.TOTAL_IGV_SOLES ? regPer.TOTAL_IGV_SOLES : '');
        this.frmGastoProyectoControl.cSigaTotalFactSoles.reset(regPer.TOTAL_FACT_SOLES ? regPer.TOTAL_FACT_SOLES : '');
        this.frmGastoProyectoControl.cSigaEstadoSiaf.reset(regPer.ESTADO_SIAF ? regPer.ESTADO_SIAF : '');
        this.frmGastoProyectoControl.cSigaExpSiaf.reset(regPer.EXP_SIAF ? regPer.EXP_SIAF : '');
        this.frmGastoProyectoControl.cSigaExpSiga.reset(regPer.EXP_SIGA ? regPer.EXP_SIGA : '');
        this.frmGastoProyectoControl.cSigaNroCertifica.reset(regPer.NRO_CERTIFICA ? regPer.NRO_CERTIFICA : '');
        this.frmGastoProyectoControl.cSigaNroRuc.reset(regPer.NRO_RUC ? regPer.NRO_RUC : '');


        /*this.frmGastoProyecto.controls['cDocAprueba'].disable();
        this.frmGastoProyecto.controls['nGasto'].disable();
        this.frmGastoProyecto.controls['dtGasto'].disable();*/
        // this.buscarXRuc();

    }

    seleccionarProveedor(regProv: any, i: number) {
        // console.log(regProv);
        this.frmGastoProyectoControl.iPersId.reset(regProv.iPersId ? regProv.iPersId : '');
        this.frmGastoProyectoControl.valBuscProveedor.reset(regProv.cPersDocumento ? regProv.cPersDocumento : '');
        this.frmGastoProyectoControl.cRazonSocial.reset(regProv.cPersRazonSocialNombre ? regProv.cPersRazonSocialNombre : '');
    }

    eliminarPedidoSIGA() {
        this.PedidoSIGA = null;
        // this.frmGastoProyectoControl.cDocAprueba.reset('');
        // this.frmGastoProyectoControl.nGasto.reset('');
        // this.frmGastoProyectoControl.dtGasto.reset('');

        // this.frmGastoProyecto.controls['cDocAprueba'].enable();
        // this.frmGastoProyecto.controls['gasto'].enable();
        // this.frmGastoProyecto.controls['dtGasto'].enable();
        this.seleccionarPedidoSIGA({},-1);
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
        this.dataExtraProyecto.objEspecifico = [];
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            //  const ind = await this.getIndicadorObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const act = await this.getActividadObjetivo(idProyecto, dataObjEspecifico[index].iObjetivoId);
            const obj = new Objetivo();
            obj.iObjetivoId = dataObjEspecifico[index].iObjetivoId;
            obj.iProyectoId = dataObjEspecifico[index].iProyectoId;
            obj.cObjetivo = dataObjEspecifico[index].cObjetivo;
            obj.iTipoObjetivoId = dataObjEspecifico[index].iTipoObjetivoId;
            // obj.indicador = ind;
            obj.actividad = act;
            if (dataObjEspecifico[index].iTipoObjetivoId == 2) {
                await this.dataExtraProyecto.objEspecifico.push(obj);
            }
        }
        // console.log(this.dataExtraProyecto.objEspecifico);
    }

    async getIndicadorObjetivo(idProyecto: any = false, idObjetivo: any = false) {
        const iGastoId = (this.frmGastoProyectoControl.idGastoProy.value ? this.frmGastoProyectoControl.idGastoProy.value : 0);
        const dataIndicador = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_indicador_obj_proyecto_det_avance',
            data: [idProyecto, idObjetivo, iGastoId]
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
            ind.iEjecutado = dataIndicador[index].iEjecutado;
            ind.nEjecutadoPorcentaje = dataIndicador[index].nEjecutadoPorcentaje;
            // ind.iAvance = dataIndicador[index].iCantidad;
            ind.iGastoAvanIndtId = dataIndicador[index].iGastoAvanIndtId;
            await aInd.push(ind);
        }
        return aInd;
    }

    async getActividadObjetivo(idProyecto: any = false, idObjetivo: any = false) {
        const iGastoId = (this.frmGastoProyectoControl.idGastoProy.value ? this.frmGastoProyectoControl.idGastoProy.value : 0);
        const dataActividad = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_actividad_obj_proyecto_det_avance',
            data: [idProyecto, idObjetivo, iGastoId]
        });
        const aAct = [];
        // tslint:disable-next-line:forin
        for (const index in dataActividad) {
            const cro = await this.getCronogramaActividad(dataActividad[index].iActividadId);
            const act = new Actividad();
            act.iActividadId = dataActividad[index].iActividadId;
            act.iObjetivoId = dataActividad[index].iObjetivoId;
            act.cActividadDescripcion = dataActividad[index].cActividadDescripcion;
            act.iCantidad = dataActividad[index].iCantidad;
            act.iUnidadMedidaId = dataActividad[index].iUnidadMedidaId;
            act.cUnidadMedida = dataActividad[index].cUnidadMedida;
            act.iAvanceCantidad = dataActividad[index].iAvanceCantidad;
            // act.iAvance = dataActividad[index].iAvanceAct;
            act.iCalendarioId = dataActividad[index].iCalendarioId;
            act.cronograma = cro;

            act.mesCalGasto = act.iCalendarioId;
            await aAct.push(act);


        }
        return aAct;
    }

    async getCronogramaActividad(iActividadId: any = false) {
        const dataCronograma = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_cronograma_actividad',
            data: [iActividadId]
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
                cro.iCalendarioId = dataCronograma[index].iCalendarioId;
                cro.cCaleAnyo = dataCronograma[index].cCaleAnyo;
                cro.cCaleMes = dataCronograma[index].cCaleMes;
                cro.cMesDescripcion = dataCronograma[index].cMesDescripcion;

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

    selActividadAvance(iAvance: any, iActividadId: any, actividad: any, iObjetivoId: any, objEspecifico: any[]) {
        this.avanceActidad = iAvance;
        this.idActividadAvance = iActividadId;
        this.idObjIndAvance = iObjetivoId;
        actividad.filter((value, index, arr) => {
            if (value.iActividadId !== iActividadId) {
                value.iAvance = null;
            } else {
                this.frmGastoProyectoControl.iCalendarioId.reset(value.mesCalGasto);
            }
        });

        objEspecifico.filter((value1, index1, arr1) => {
            if (value1.iObjetivoId !== iObjetivoId) {
                value1.indicador.filter((value2, index2, arr2) => {
                    value2.iAvance = null;
                });
            }
        });
        this.idObjIndAvance = iObjetivoId;
        this.frmGastoProyectoControl.iActividadId.reset(iActividadId);
        this.frmGastoProyectoControl.iAvanceAct.reset(iAvance);

    }

    selObjIndEspAvance(iAvance: any, iObjetivoId: any, objEspecifico: any[]) {
        this.avanceObjInd = iAvance;
        this.idObjIndAvance = iObjetivoId;
        objEspecifico.filter((value1, index1, arr1) => {
            if (value1.iObjetivoId !== iObjetivoId) {
                value1.indicador.filter((value2, index2, arr2) => {
                    value2.iAvance = null;
                });
            }
        });
    }

    private async buscarProveedor() {
        const valBuscProv = this.frmGastoProyectoControl.valBuscProveedor.value ? this.frmGastoProyectoControl.valBuscProveedor.value : '%%';
        const valTipoDoc = this.frmGastoProyectoControl.valBuscProveedor.value ? this.frmGastoProyectoControl.valBuscProveedor.value : '2';
        this.dataServidor.listaDatosProveedor = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_personas',
            data: [2, valBuscProv, null]
        });
    }
    limpiarAvanceTenico() {
        this.dataExtraProyecto.objEspecifico.filter((value, index, arr) => {

            value.actividad.filter((value2, index2, arr2) => {
                value2.iAvance = null;
                value2.mesCalGasto = null;
                value2.iCalendarioId = null;
            });
            /*value.indicador.filter((value3, index3, arr3) => {
                value3.iAvance = null;
                value3.iGastoAvanIndtId = null;
            });*/
        });
        this.idActividadAvance = null;
        this.avanceActidad = null;
        this.idObjIndAvance = null;
        this.avanceObjInd = null;
    }

    generarPdf(tipo: string) {
        let rutaRep;
        let data;
        data = [this.idProyecto];
        switch (tipo) {
            case 'repPptGtXrubroResumen':
                rutaRep = '/inv/gestion/descargas/repPptGtXrubroResumen/' + this.idProyecto;
                break;
            case 'repPptGtXrubroDetallado':
                rutaRep = '/inv/gestion/descargas/repPptGtXrubroDetallado/' + this.idProyecto;
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

    buscarPresupuesto(idRubro) {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'busca_presupuesto',
            data: [this.idProyecto, idRubro]
        }).subscribe(data2 => {
            // @ts-ignore
            if (data2.length > 0) {
                this.imprimir.modalTituloPresupuesto = ' Presupuesto Asignado ' + data2[0].nPresupuesto;
                this.frmGastoProyectoControl.iPresupuestoId.setValue(data2[0].iPresupuestoId);
            } else {
                this.imprimir.modalTituloPresupuesto = ' No se asigno presupuesto ';
                this.frmGastoProyectoControl.iPresupuestoId.setValue('');
            }
            this.imprimirModalTitulo(this.imprimir.modalTituloPresupuesto);
            // console.log(this.frmGastoProyectoControl.iPresupuestoId);

        });
    }

    seguimiento(ctrlModal: any) {
        // console.log(url);
       // const ur = encodeURI(this.baseUrl + url);
       // this.modalAbierto = true;
        this.modalService.open(ctrlModal, {size: 'lg', backdrop: 'static', windowClass: 'modalPDF'});
    }
}


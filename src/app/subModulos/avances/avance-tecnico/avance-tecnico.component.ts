import {Component, OnInit} from '@angular/core';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {DataServices} from '../../../servicios/data.services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {environment} from '../../../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {LocalService} from '../../../servicios/local.services';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-avance-tecnico',
    templateUrl: './avance-tecnico.component.html',
    styleUrls: ['./avance-tecnico.component.scss']
})
export class AvanceTecnicoComponent implements OnInit {
    dataServidor = {
        dataActividadesAvaTec: null,
        listaActividades: null,
        mostrarLista: null,
        listaAnyo: null,
        listaMes: null,
        listaDia: null,
        mostrarListaDetalle: null,
        mostrarAvancePresupuestal: null,
        listaDatosSiga: null
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
        modalTituloPresupuesto: null,
        detalleTitulo: null,
        detalle2Titulo: null

    };
    modelos = {
        sel_en_lista: null,
    };
    frmAvanceTecnico: FormGroup;
    frmAvanceTecnicoDetalle: FormGroup;
    enviandoFormulario = false;
    loading: false;
    editandoPlanAvanTec = false;

    idProyecto: string;
    totalPorcentajeCantidad: number;
    totalPorcentajeAvance: number;
    numeroCalculo: boolean;
    valCheckbox: boolean;
    verDetalle: boolean;
    baseUrl;
    modalAbierto = false;

    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    nomProyecto: any;
    dataAvTecProyecto = {
        actividades: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        },
        porcentajeAutomatico: undefined,
        idProyecto: null,
    };
    enable = {
        iActividadId: true, iCantidad: true,
        nCantPorcentaje: true, iAvanceCantidad: true,
        nAvanceCantidadPorcentaje: true

    };
    porcentajeAutomatico = null;
    perfilActual = null;
    perfilesDeUsuarios;
    primerRegistro: boolean;
    constructor(
        private _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private modalActivo: NgbActiveModal,
        private formBuilder: FormBuilder,
        private sanitizer: DomSanitizer,
        private local: LocalService,
        private router: Router,
        private _constantes: ConstantesService,
    ) {
        if (!this._dataService.idProySel){
            this.router.navigate(['/investigacion/']);
        }
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.baseUrl = environment.urlPublic;
    }

    get frmAvanceTecnicoControl() {
        return this.frmAvanceTecnico.controls;
    }
    get frmAvanceTecnicoDetalleControl() {
        return this.frmAvanceTecnicoDetalle.controls;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.monitor].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            if (!this._dataService.getOption().credencialActual.iCredId) {
                this.queryInvestigacion.obtenerCredencial();
            }
            this.crearFormulario();
            this.idProyecto = this._dataService.idProySel;
            this.nomProyecto = this._dataService.nombProySel;
            // this.idProyecto = localStorage.getItem('proysel');
            // await this.getProyecto(this.idProyecto);
            this.cargarLista();
        }
    }
    async getProyecto(idProyecto: any = false) {
        const dataProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_proyecto',
            data: [idProyecto]
        });
        this.nomProyecto = dataProyecto[0].cNombreProyecto;
    }
    async crearFormulario() {
        this.frmAvanceTecnico = this.formBuilder.group({porcentajeAutomatico: ['']});
        this.frmAvanceTecnicoDetalle = this.formBuilder.group({
            idProyecto: ['', Validators.required],
            idActividad: ['', Validators.required],
            idAnyo: ['', Validators.required],
            idMes: ['', Validators.required],
            avanceCantidad: ['', Validators.required],
            docSustentatorio: ['', Validators.required],
            archivoDocSus: ['', Validators.required],
            observacion: [''],
            fueraFecha: [''],
            fechaAvanceTecnico: [''],

            idCalendario: ['', Validators.required],
            // PARA EDIT
            idAvanTecDet: '',
            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }

    async cargarLista(actualizar = false) {
        const dataObjActividad = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'objetivo_actividad_proyecto',
            data: [this.idProyecto, 2]
        });
        let cCantPorcentajeAutomatico = null;
        let totalPorcentajeCant = 0;
        let totalPorcentajeCantAv = 0;
        this.dataAvTecProyecto.actividades = [];
        // tslint:disable-next-line:forin
        for (const index in dataObjActividad) {
            const objAct = {
                iActividadId: dataObjActividad[index].iActividadId,
                iProyectoId: dataObjActividad[index].iProyectoId,
                cActividadDescripcion: dataObjActividad[index].cActividadDescripcion,
                iCantidad: dataObjActividad[index].iCantidad,
                nCantPorcentaje: dataObjActividad[index].nCantPorcentaje,
                cCantPorcentajeAutomatico: dataObjActividad[index].cCantPorcentajeAutomatico,
                iAvanceCantidad: dataObjActividad[index].iAvanceCantidad,
                nAvanceCantidadPorcentaje: dataObjActividad[index].nAvanceCantidadPorcentaje,
                dtInicio: dataObjActividad[index].dtInicio,
                dtFin: dataObjActividad[index].dtFin,
                cNombreProyecto: dataObjActividad[index].cNombreProyecto,
                nPresupuestoProyecto: dataObjActividad[index].nPresupuestoProyecto,
                nPresupuestoEjecucion: dataObjActividad[index].nPresupuestoEjecucion,
                nAvanceTecnico: dataObjActividad[index].nAvanceTecnico,
                iObjetivoId: dataObjActividad[index].iObjetivoId,
                cObjetivo: dataObjActividad[index].cObjetivo,
            };
            cCantPorcentajeAutomatico = dataObjActividad[index].cCantPorcentajeAutomatico;
            totalPorcentajeCant += +dataObjActividad[index].nCantPorcentaje;
            totalPorcentajeCantAv += +dataObjActividad[index].nAvanceCantidadPorcentaje;
            await this.dataAvTecProyecto.actividades.push(objAct);
        }
        this.totalPorcentajeCantidad = +totalPorcentajeCant;
        this.totalPorcentajeAvance = +totalPorcentajeCantAv;
        this.valCheckbox = (cCantPorcentajeAutomatico == 'A' ? true : false);
        this.primerRegistro = ([0, null, ''].includes(totalPorcentajeCant) ? true : false);
        this.frmAvanceTecnicoControl.porcentajeAutomatico.setValue(this.valCheckbox);
    }

    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }

    async llamarAccion(data) {
        // console.log(data[0]);
        switch (data[0]) {
            case 'registrarPlanAvanceTecnico':
                this.editandoPlanAvanTec = true;
                // console.log(this.frmAvanceTecnicoControl.porcentajeAutomatico.value);
                if (this.frmAvanceTecnicoControl.porcentajeAutomatico.value == true || this.valCheckbox == true) {
                } else {
                    this.enable.nCantPorcentaje = false;
                }
                break;
            case 'cancelarPlanAvanceTecnico':
                this.editandoPlanAvanTec = false;
                this.enable.nCantPorcentaje = true;
                const a = this.cargarLista();
                break;
            case 'guardarPlanAvanceTecnico':
                this.editandoPlanAvanTec = false;
               // this.registrarPlanAvanceTecnico();
                this.dataAvTecProyecto.idProyecto = this.idProyecto;
                this.dataAvTecProyecto.porcentajeAutomatico = (this.porcentajeAutomatico == true ? 'A' : 'M');
                this.dataAvTecProyecto.auditoria.credencial_id = this._dataService.getOption().credencialActual.iCredId;
                this.dataAvTecProyecto.auditoria.ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
                // console.log(this.dataAvTecProyecto);

                const retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: 'registrarPlanAvanTec',
                    data: this.dataAvTecProyecto
                });
                // const retorno = await this.enviarFormulario('registrarPlanAvanTec');
                // @ts-ignore
                if (!retorno.error) {
                    const c = this.cargarLista(true);
                    this.editandoPlanAvanTec = false;
                    this.enable.nCantPorcentaje = true;
                } else {
                    this.editandoPlanAvanTec = true;
                }
                break;
            case 'nuevo':
                this.limpiarFormulario('', data[2].iActividadId);
                // console.log(data[2].iActividadId);
                // this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
                this.imprimir.modalPreTitulo = 'Nuevo Avance Tecnico del Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'detalleAvanceTecnico':
                this.imprimir.detalleTitulo = 'Detalle de Avance Tecnico de la Actividad: ' + data[2].cActividadDescripcion
                this.imprimir.detalle2Titulo = 'Programado del ' + data[2].dtInicio + ' al ' + data[2].dtFin;
                this.cargarListaDetalle(data[2].iActividadId);
                this.verDetalle = true;
                break;
            case 'editarAvanceTecnico':
                this.limpiarFormulario(data[2], '');
                this.imprimir.modalPreTitulo = 'Editar Avance Tecnico | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminarAvanceTecnico':
                // console.log('eliminar avance');
                const info = {
                    iAvanTecDetId: data[2].iAvanTecDetId,
                    accionBd: 'borrar',
                    auditoria: {
                        credencial_id: this._dataService.getOption().credencialActual.iCredId,
                        ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local
                    }
                };
                const retorno2 = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_avance_tecnico_detalle',
                    data: info
                });
                // @ts-ignore
                if (!retorno2.error) {
                    const b = this.cargarLista(true);
                    this.verDetalle = false;
                    this.limpiarFormulario();
                    this.modalActivo.close();
                    this.modalService.dismissAll();
                    // this.cargarLista();
                }
                break;
        }
    }

    limpiarFormulario(data: any = false, idAct = '') {
        this.frmAvanceTecnicoDetalleControl.idProyecto.reset(this.idProyecto ? this.idProyecto : '');
        this.frmAvanceTecnicoDetalleControl.idActividad.reset(data.iActividadId ? data.iActividadId : idAct);
        this.mostrarAnyo();
        this.frmAvanceTecnicoDetalleControl.idAnyo.reset(data ? data.cCaleAnyo : '');
        this.mostrarMes(null, null, data.cCaleMes);
        this.frmAvanceTecnicoDetalleControl.idMes.reset(data ? data.cCaleMes : '');
        this.frmAvanceTecnicoDetalleControl.avanceCantidad.reset(data ? data.iAvanceCantidad : '');
        this.frmAvanceTecnicoDetalleControl.docSustentatorio.reset(data ? data.cDocSustentatorio : '');
        this.frmAvanceTecnicoDetalleControl.archivoDocSus.reset(data ? data.cArchivoDocSus : '');
        this.frmAvanceTecnicoDetalleControl.observacion.reset(data ? data.cObservacion : '');
        this.frmAvanceTecnicoDetalleControl.fueraFecha.reset(data ? data.cFueraFecha : '');
        this.frmAvanceTecnicoDetalleControl.fechaAvanceTecnico.reset(data ? data.dtAvanceTecnico : '');
        this.frmAvanceTecnicoDetalleControl.idCalendario.reset(data ? data.iCalendarioId : '');
        this.frmAvanceTecnicoDetalleControl.idAvanTecDet.reset(data ? data.iAvanTecDetId : '');
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        let editAvaTec = 0;
        let envioArchivo = 0;
        switch (tipo_form) {

            case 'mantenimiento_avance_tecnico_detalle':
                frmTratarControl = this.frmAvanceTecnicoDetalleControl;
                frmTratar = this.frmAvanceTecnicoDetalle;
                editAvaTec = 1;
                envioArchivo = 1;
                break;
        }
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });

            this.enviandoFormulario = true;
            if (frmTratar.invalid) {
                // console.warn(frmTratar.getRawValue());
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
                if (envioArchivo == 1) {
                    const data2 = {
                        carpeta: this.idProyecto,
                        prefijo: 'ATec',
                        sufijo: 'suf',
                        controlArchivo: 'archivoDocSus'
                        //  data: JSON.stringify(frmTratar.getRawValue())
                    };
                    const dataExtra = {...frmTratar.getRawValue(), ...data2};
                    retorno = await (await this.queryInvestigacion.enviarArchivo(
                        tipo_form,
                        this.frmAvanceTecnicoDetalle,
                        ['archivoDocSus'],
                        dataExtra
                    ));
                    // @ts-ignore
                    if (!retorno.error) {
                        const a = this.cargarLista(true);
                        this.verDetalle = false;
                        this.limpiarFormulario();
                        // this.modalActivo.close();
                        this.modalService.dismissAll();
                    }
                } else {
                    // console.warn(frmTratar.getRawValue());
                    retorno = await this.queryInvestigacion.guardarDatosAsync({
                        tipo: tipo_form,
                        data: this.dataAvTecProyecto
                    });
                }
                this.enviandoFormulario = false;
                return retorno;
            }
        }
    }

    calculoPorcentaje() {
        this.numeroCalculo = false;
        let TotalCantidad = 0;
        let totalPorcentajeCant = 0;
        this.totalPorcentajeCantidad = 0;
        this.dataAvTecProyecto.actividades.filter((value, index) => {
            TotalCantidad += +value.iCantidad;
            totalPorcentajeCant += +value.nCantPorcentaje;
        });
        if (this.porcentajeAutomatico == true) {
            this.enable.nCantPorcentaje = true;
            totalPorcentajeCant = 0;
            this.totalPorcentajeCantidad = 0;
            this.dataAvTecProyecto.actividades.filter((value, index) => {
                const porcentaje = (+value.iCantidad / TotalCantidad) * 100;
                value.nCantPorcentaje = porcentaje.toFixed(2);
                totalPorcentajeCant += +value.nCantPorcentaje;
            });
        } else {
            this.enable.nCantPorcentaje = false;
        }
        this.numeroCalculo = true;
        this.totalPorcentajeCantidad = +totalPorcentajeCant;
    }

    editCantCalculoPorcentaje(data: any) {
        data.nAvanceCantidadPorcentaje = (data.iAvanceCantidad / data.iCantidad) * data.nCantPorcentaje;
        this.calculoPorcentaje();
    }

    cargarListaDetalle(idActividad) {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_avance_tecnico_detalle',
            data: [this.idProyecto, idActividad]
        }).subscribe(data => {
            this.dataServidor.mostrarListaDetalle = data;
        });
    }

    mostrarAnyo(idActividad = 0) {
        this.frmAvanceTecnicoDetalleControl.idAnyo.setValue('');
        const idAct = (idActividad > 0) ? idActividad : this.frmAvanceTecnicoDetalleControl.idActividad.value;
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_calendario_anyos',
            data: [idAct]
        }).subscribe(data => {
            this.dataServidor.listaAnyo = data;
            this.frmAvanceTecnicoDetalleControl.idMes.setValue('');
        });
    }

    async mostrarMes(idActividad = 0, idAnyo = 0, idMes = 0) {
        this.frmAvanceTecnicoDetalleControl.idMes.setValue('');
        const idAct = (idActividad > 0) ? idActividad : this.frmAvanceTecnicoDetalleControl.idActividad.value;
        const idAy = (idAnyo > 0) ? idAnyo : this.frmAvanceTecnicoDetalleControl.idAnyo.value;
        this.dataServidor.listaMes = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_calendario_meses',
            data: [idAct, idAy]
        });
        if (idMes !== 0) {
            this.frmAvanceTecnicoDetalleControl.idMes.reset(idMes ? idMes : '');
            this.llenarDatosAdic();
        }
    }

    llenarDatosAdic(idActividad = 0, idAnyo = 0, idMes = 0) {
        const idAct = (idActividad > 0) ? idActividad : this.frmAvanceTecnicoDetalleControl.idActividad.value;
        const idAy = (idAnyo > 0) ? idAnyo : this.frmAvanceTecnicoDetalleControl.idAnyo.value;
        const idMe = (idMes > 0) ? idMes : this.frmAvanceTecnicoDetalleControl.idMes.value;
        if (idAct !== '' && idAy !== '' && idMe !== '') {
            this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_calendario_id',
                data: [idAct, idAy, idMe]
            }).subscribe(data => {
                this.frmAvanceTecnicoDetalleControl.idCalendario.reset(data[0].iCalendarioId ? data[0].iCalendarioId : '');
            });
        }
    }

    mostrarPDF(ctrlModal, url) {
        // console.log(url);
        const ur = encodeURI
        (this.baseUrl + url);
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
}

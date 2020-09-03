import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';
import swal from 'sweetalert2';
import {LocalService} from '../../../servicios/local.services';
import {ConstantesService} from '../../../servicios/constantes.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-informes',
    templateUrl: './informes.component.html',
    styleUrls: ['./informes.component.scss']
})
export class InformesComponent implements OnInit {
    dataServidor = {
        mostrarLista: null,
        mostrarAvancePresupuestal: null,

    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
    };
    frmInformeProyecto: FormGroup;
    enviandoFormulario = false;

    idProyecto: string;
    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    baseUrl;
    modalAbierto = false;
    nomProyecto: any;
    perfilActual = null;
    perfilesDeUsuarios;
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
        this.baseUrl = environment.urlPublic;
    }

    get frmInformeProyectoControl() {
        return this.frmInformeProyecto.controls;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            if (!this._dataService.getOption().credencialActual.iCredId) {
                this.queryInvestigacion.obtenerCredencial();
            }
            this.crearFormulario();
            this.idProyecto = this._dataService.idProySel;
            this.nomProyecto = this._dataService.nombProySel;
            // this.idProyecto = this.local.getItem('proysel');
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
    crearFormulario() {
        this.frmInformeProyecto = this.formBuilder.group({
            iProyectoId: ['', Validators.required],
            dtFechaInicio: ['' ],
            dtFechaFin: ['' ],
            // dtFechaInfAvan
            cArchivoInf: ['', Validators.required],
            // iEstado
            iInfSistAceptada: ['', Validators.required],
            nPresupuestoProyecto: [''],
            nPresupuestoRubros: [''],
            nPresupuestoDisponible: [''],
            nPresupuestoEjecutado: [''],
            nPresupuestoPorcAvance: [''],
            nPorcAvanceTenico: [''],
            cObservacion: [''],
            // PARA EDIT
            iInformeFinalId: '',
            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }

    async limpiarFormulario(data: any = false, nuevaEntrega = false) {
        this.frmInformeProyectoControl.iProyectoId.reset(data ? data.iProyectoId : '');
        this.frmInformeProyectoControl.dtFechaInicio.reset(data ? data.dtFechaInicio : '');
        this.frmInformeProyectoControl.dtFechaFin.reset(data ? data.dtFechaFin : '');
        this.frmInformeProyectoControl.cArchivoInf.reset(data ? data.cArchivoInf : '');
        this.frmInformeProyectoControl.iInfSistAceptada.reset(data ? data.iInfSistAceptada : '');
        if (nuevaEntrega) {
            // await this.llenarAvancePresupuestal();

            await this.queryInvestigacion.datosInvestigacionServidor({
                tipo: 'data_avance_presupuestal',
                data: [this.idProyecto]
            }).subscribe(data2 => {
                this.dataServidor.mostrarAvancePresupuestal = data2;
                this.frmInformeProyectoControl.nPresupuestoProyecto.reset(data2 ? data2[0].nPresupuestoProyecto : '');
                this.frmInformeProyectoControl.nPresupuestoRubros.reset(data2 ? data2[0].totalPresupuesto : '');
                this.frmInformeProyectoControl.nPresupuestoDisponible.reset(data2 ? data2[0].saldo : '');
                this.frmInformeProyectoControl.nPresupuestoEjecutado.reset(data2 ? data2[0].totalGasto : '');
                this.frmInformeProyectoControl.nPresupuestoPorcAvance.reset(data2 ? data2[0].avance : '');
                this.frmInformeProyectoControl.nPorcAvanceTenico.reset(data2 ? data2[0].nPorcAvanceTenico : '');
            });
        } else {
            this.frmInformeProyectoControl.nPresupuestoProyecto.reset(data ? data.nPresupuestoProyecto : '');
            this.frmInformeProyectoControl.nPresupuestoRubros.reset(data ? data.nPresupuestoRubros : '');
            this.frmInformeProyectoControl.nPresupuestoDisponible.reset(data ? data.nPresupuestoDisponible : '');
            this.frmInformeProyectoControl.nPresupuestoEjecutado.reset(data ? data.nPresupuestoEjecutado : '');
            this.frmInformeProyectoControl.nPresupuestoPorcAvance.reset(data ? data.nPresupuestoPorcAvance : '');
            this.frmInformeProyectoControl.nPorcAvanceTenico.reset(data ? data.nPorcAvanceTenico : '');
            this.frmInformeProyectoControl.cObservacion.reset(data ? data.cObservacion : '');
        }
        this.frmInformeProyectoControl.iInformeFinalId.reset(data ? data.iInformeFinalId : '');
    }

    async llenarAvancePresupuestal() {
        await this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_avance_presupuestal',
            data: [this.idProyecto]
        }).subscribe(data => {
            this.dataServidor.mostrarAvancePresupuestal = data;
            this.frmInformeProyectoControl.nPresupuestoProyecto.reset(data ? data[0].nPresupuestoProyecto : '');
            this.frmInformeProyectoControl.nPresupuestoRubros.reset(data ? data[0].totalPresupuesto : '');
            this.frmInformeProyectoControl.nPresupuestoDisponible.reset(data ? data[0].saldo : '');
            this.frmInformeProyectoControl.nPresupuestoEjecutado.reset(data ? data[0].totalGasto : '');
            this.frmInformeProyectoControl.nPresupuestoPorcAvance.reset(data ? data[0].avance : '');
            this.frmInformeProyectoControl.nPorcAvanceTenico.reset(data ? data[0].avance : '');
        });
    }

    async llamarAccion(data) {
        switch (data[0]) {
            case 'agregarEntrega':
                this.imprimir.modalPreTitulo = 'Enviar Informe Final del Proyecto | ';
                this.limpiarFormulario(data[2], true);
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                // console.warn(this.frmInformeProyectoControl);
                break;
            case 'nuevo':
                // this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
                this.imprimir.modalPreTitulo = 'Nuevo Informe de Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Informe de Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_Informe_proyecto',
                    data: [data[2].iInformeProyectoId]
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                }
                break;
        }
    }

// REUTILIZABLES
    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'informe_final_proyecto',
            data: [this.idProyecto]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
        });
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_informe_final':
                // console.warn(this.frmInformeProyecto.value);
                frmTratarControl = this.frmInformeProyectoControl;
                frmTratar = this.frmInformeProyecto;
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
                const data2 = {
                    carpeta: this.idProyecto,
                    prefijo: 'InfFinal',
                    sufijo: 'suf',
                    controlArchivo: 'cArchivoInf'
                    //  data: JSON.stringify(frmTratar.getRawValue())
                };
                const dataExtra = {...frmTratar.getRawValue(), ...data2};
                const retorno = await (await this.queryInvestigacion.enviarArchivo(
                    tipo_form,
                    this.frmInformeProyecto,
                    ['cArchivoInf'],
                    dataExtra
                ));
                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                    this.limpiarFormulario();
                    // this.modalActivo.close();
                    this.modalService.dismissAll();
                }
            }
            this.enviandoFormulario = false;
        }
    }


    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }

    mostrarPDF(ctrlModal, url) {
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

    verificaFechaPresentacion(dtFechaInicio: string, dtFechaFin: string, iEstado: number) {
        const dateStart = new Date(dtFechaInicio);
        const dateEnd = new Date(dtFechaFin);
        const dateActual = new Date();
        // Verificamos que la fecha no sea posterior a la actual
        if (iEstado == 1){
            return 'v'; // verde
        }else{
            if (dateStart <= dateActual && dateActual <= dateEnd)
            {
                return 'r'; // rojo
            }
            return 'a'; // azul
        }

    }
}

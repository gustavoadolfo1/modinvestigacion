import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';
import {LocalStoreService} from '../../../shared/services/local-store.service';


import {MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';
import {DecimalPipe, formatCurrency, formatNumber} from '@angular/common';
import swal from "sweetalert2";

@Component({
  selector: 'app-propuestas',
  templateUrl: './propuestas.component.html',
  styleUrls: ['./propuestas.component.scss'],
    providers: [MessageService, DecimalPipe],
})
export class PropuestasComponent implements OnInit {
    @Input() idParEvaluador;
    text: string;
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    disabled = true;
    disabled1 = true;
    idProyecto;
    dataProyecto: Object;
    perfilActual = null;
    perfilesDeUsuarios;
    dataServidor = {
        mostrarLista: null,
        mostrarLista1: null,
        mostrarLista2: null,
    };
    modelos = {
        sel_en_lista: null,
    };
    archivos = {
        archivoProyecto: '',
        cArchivoPlanOp: '',
        archivoAnexo: '',
        archivoProyectoDoc: '',
        cArchivoPlanOpDoc: '',
        archivoAnexoDoc: '',
        cArchivoSimilitud: '',
        cArchivoContrato: '',
        cArchivoDJPostulacion: '',
        cDoc: null,
    };
    idConvocatoria: any;
    baseUrl: any;
    pdfActual: any;
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    convocatoria: string;
    data: string;
    frmEvaluacion: FormGroup;
    constructor(
        private _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private modalActivo: NgbActiveModal,
        private formBuilder: FormBuilder,
        private local: LocalStoreService,

        private _constantes: ConstantesService,
        private messageService: MessageService,
        public activeModal: NgbActiveModal,
        private router: Router,
        private _decimalPipe: DecimalPipe
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.baseUrl = environment.urlPublic;
    }
    get frmEvaluacionControl() {
        return this.frmEvaluacion.controls;
    }
    loading = false;
    frmPersona: FormGroup;

    enviandoFormulario = false;
    ngOnInit() {
        this.crearFormulario();
        this.idProyecto = this._dataService.idProySel;
        this.idParEvaluador = this.local.getItem('idParEval');
        //  this.cargarLista();
        this.frmEvaluacionControl.iProyectoId.setValue(this.idProyecto);
        this.cargarLista();
        this.frmEvaluacionControl.idParEvaluador.setValue(this.idParEvaluador);
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.parEvaluador].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        }
        else {
            this.idConvocatoria = this.local.getItem('idConv');
            if ([this.perfilesDeUsuarios.parEvaluador].includes(this.perfilActual)) {
                this.convocatoria = 'convocatoria';
                this.idConvocatoria = '%';
                this.disabled1 = false;
            }
            else{
                this.convocatoria = 'convocatorias_activa';
                this.disabled1 = true;
            }
            this.idProyecto = this._dataService.idProySel;

            if (this.idProyecto > 0) {
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'data_proyecto',
                    data: [this.idProyecto]
                }).subscribe(data => {
                    console.log(data);
                    this.dataProyecto = data;
                    this.archivos.archivoProyecto = (data ? data[0].cArchivoProyecto : '');
                    this.archivos.cArchivoPlanOp = (data ? data[0].cArchivoPlanOp : '');
                    this.archivos.archivoAnexo = (data ? data[0].cArchivoAnexo : '');
                    this.archivos.archivoProyectoDoc = (data ? data[0].cArchivoProyectoDoc : '');
                    this.archivos.cArchivoPlanOpDoc = (data ? data[0].cArchivoPlanOpDoc : '');
                    this.archivos.archivoAnexoDoc = (data ? data[0].cArchivoAnexoDoc : '');
                    this.archivos.cArchivoSimilitud = (data ? data[0].cArchivoSimilitud : '');
                    this.archivos.cArchivoContrato = (data ? data[0].cArchivoContrato : '');
                    this.archivos.cArchivoDJPostulacion = (data ? data[0].cArchivoDJPostulacion : '');
                });
            }
        }
    }
    crearFormulario() {
        this.frmEvaluacion = this.formBuilder.group({
            idParEvaluador: [''],
            idEstadoEvaluacion: [3],
            iProyectoId: [''],
            cDoc: ['', Validators.required],
            cResultados: ['' , Validators.required],
            nPuntajeTotal: ['' , Validators.required],
            nPuntajePonderado: ['' , Validators.required],
            // PARA EDIT
            idEvaluacion: '',

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }
    async llamarAccion(data) {
        switch (data[0]) {
            case 'nuevo':
                // this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
                this.imprimir.modalPreTitulo = 'Nueva Convocatoria | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
        }
    }
    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'evaluaciones',
            data: [this.idParEvaluador, this.idProyecto]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            // console.log(data);

        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'fechas_entregas',
            data: [this.idProyecto, this.idParEvaluador]
        }).subscribe(data => {
            this.dataServidor.mostrarLista1 = data;
            // console.log(data);

        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'informe_final_proyecto',
            data: [this.idProyecto]
        }).subscribe(data => {
            this.dataServidor.mostrarLista2 = data;
        });
    }
    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_evaluacion':
                // console.warn(this.frmEvaluacion.value);
                frmTratarControl = this.frmEvaluacionControl;
                frmTratar = this.frmEvaluacion;
                break;
        }
        // console.log('trata'+frmTratarControl);
        if (frmTratarControl != null) {
            // console.warn(this.frmEvaluacionControl);
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
                const arch = ['cDoc'];
                const data2 = {
                    carpeta: 'convocatorias',
                    prefijo: 'Conv',
                    sufijo: 'suf',
                    controlArchivo: ['cDoc']
                    //  data: JSON.stringify(frmTratar.getRawValue())
                };
                const dataExtra = {...frmTratar.getRawValue(), ...data2};
                const retorno = await (await this.queryInvestigacion.enviarArchivo(
                    tipo_form,
                    this.frmEvaluacion,
                    ['cDoc'],
                    dataExtra
                ));


                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                    this.limpiarFormulario({iParEvaluadorId: this.idParEvaluador});
                    // this.modalActivo.close();
                    this.modalService.dismissAll();
                }
            }
            this.enviandoFormulario = false;
        }
    }
    limpiarFormulario(data: any = false) {
        // console.log(data);
        this.frmEvaluacionControl.idParEvaluador.reset(data ? data.iParEvaluadorId : '');
        this.frmEvaluacionControl.idEstadoEvaluacion.reset(data ? data.idEstadoEvaluacion : '');
        //   this.frmEvaluacionControl.iProyectoId.reset(data ? data.iProyectoId : '');
        this.frmEvaluacionControl.cDoc.reset(data ? data.cDoc : '');
        this.frmEvaluacionControl.cResultados.reset(data ? data.cResultados : '');
        this.archivos.cDoc = (data ? data.cDoc : '');
        this.frmEvaluacionControl.nPuntajeTotal.reset(data ? data.nPuntajeTotal : '');
        this.frmEvaluacionControl.nPuntajePonderado.reset(data ? data.nPuntajePonderado : '');
        this.frmEvaluacionControl.idEvaluacion.reset(data ? data.iEvaluacionProyId : '');
    }
    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
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
}

import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {environment} from '../../../../environments/environment';
import {LocalService} from '../../../servicios/local.services';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
  selector: 'app-convocatoria',
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.scss']
})
export class ConvocatoriaComponent implements OnInit {
    dataServidor = {
        mostrarLista: null,
        listaFuenteProyecto: null,
        listaTipoProyecto: null,
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
    };
    frmConvocatoria: FormGroup;
    enviandoFormulario = false;
    private baseUrl;
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    private archivos = {
        cArchivoBases: null,
        cArchivoCronograma: null,
        cArchivoFormato: null,
        cArchivoResEvalExp: null,
        cArchivoRectResEvaExp: null,
        cArchivoResEvTec: null,
        cArchivoRecResEvaTec: null,
        cArchivoResFinal: null,
    };
    perfilActual = null;
    perfilesDeUsuarios;
    variableCriterio = '';
    p: number;
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
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.baseUrl = environment.urlPublic;
    }

    get frmConvocatoriaControl() {
        return this.frmConvocatoria.controls;
    }

    ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.crearFormulario();
            this.llenarSelect();
            this.cargarLista();
        }
    }

    crearFormulario() {
        this.frmConvocatoria = this.formBuilder.group({
            descripcion: ['', Validators.required],
            detalle: [''],
            fechaInicio: ['', Validators.required],
            fechaFin: ['', Validators.required],
            fechaFinPostulacion: ['', Validators.required],
            iNumMesesProyecto: ['', Validators.required],
            iNumMesesHito: ['', Validators.required],
            cArchivoBases: [''],
            cArchivoCronograma: [''],
            cArchivoFormato: [''],
            cArchivoResEvalExp: [''],
            cArchivoRectResEvaExp: [''],
            cArchivoResEvTec: [''],
            cArchivoRecResEvaTec: [''],
            cArchivoResFinal: [''],
            iTipoProyectoId: ['', Validators.required],
            iFuenteProyectoId: ['', Validators.required],
            cResolucion: ['', Validators.required],
            iNumIntegrantes: ['', Validators.required],
            nPresupuesto: ['', Validators.required],

            // PARA EDIT
            idConvocatoria: '',

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
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Convocatoria | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const info = {
                    idConvocatoria: data[2].iConvocatoriaId,
                    accionBd: 'borrar',
                    auditoria: {
                        credencial_id: this._dataService.getOption().credencialActual.iCredId,
                        ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local
                    }
                };
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_convocatoria',
                    data: info
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
        let valBus = this.variableCriterio;
        if (this.variableCriterio == ''){
            valBus = '%%';
        }
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'convocatoria',
            data: [valBus]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            // console.log(data);
        });
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_convocatoria':
                // console.warn(this.frmConvocatoria.value);
                frmTratarControl = this.frmConvocatoriaControl;
                frmTratar = this.frmConvocatoria;
                break;
        }
        // console.log('trata'+frmTratarControl);
        if (frmTratarControl != null) {
            // console.warn(this.frmConvocatoriaControl);
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
                    carpeta: 'convocatorias',
                    prefijo: 'Conv',
                    sufijo: 'suf',
                    controlArchivo: ['cArchivoBases',
                        'cArchivoCronograma',
                        'cArchivoFormato',
                        'cArchivoResEvalExp',
                        'cArchivoRectResEvaExp',
                        'cArchivoResEvTec',
                        'cArchivoRecResEvaTec',
                        'cArchivoResFinal']
                    //  data: JSON.stringify(frmTratar.getRawValue())
                };
                const arch = ['cArchivoBases',
                    'cArchivoCronograma',
                    'cArchivoFormato',
                    'cArchivoResEvalExp',
                    'cArchivoRectResEvaExp',
                    'cArchivoResEvTec',
                    'cArchivoRecResEvaTec',
                    'cArchivoResFinal'];
                const dataExtra = {...frmTratar.getRawValue(), ...data2};
                const retorno = await (await this.queryInvestigacion.enviarArchivo(
                    tipo_form,
                    this.frmConvocatoria,
                    ['cArchivoBases',
                        'cArchivoCronograma',
                        'cArchivoFormato',
                        'cArchivoResEvalExp',
                        'cArchivoRectResEvaExp',
                        'cArchivoResEvTec',
                        'cArchivoRecResEvaTec',
                        'cArchivoResFinal'],
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

    limpiarFormulario(data: any = false) {
        // console.log(data);
        this.frmConvocatoriaControl.descripcion.reset(data ? data.cConvocatoria : '');
        this.frmConvocatoriaControl.detalle.reset(data ? data.cDescripcion : '');
        this.frmConvocatoriaControl.fechaInicio.reset(data.dtFechaInicio ? data.dtFechaInicio.replace(' ', 'T') : '');
        this.frmConvocatoriaControl.fechaFin.reset(data.dtFechaFin ? data.dtFechaFin.replace(' ', 'T') : '');
        this.frmConvocatoriaControl.fechaFinPostulacion.reset(data.dtFechaFinPostulacion ? data.dtFechaFinPostulacion.replace(' ', 'T') : '');
        this.frmConvocatoriaControl.iNumMesesProyecto.reset(data ? data.iNumMesesProyecto : '');
        this.frmConvocatoriaControl.iNumMesesHito.reset(data ? data.iNumMesesHito : '');

        this.frmConvocatoriaControl.cArchivoBases.reset(data ? data.cArchivoBases : '');
        this.frmConvocatoriaControl.cArchivoCronograma.reset(data ? data.cArchivoCronograma : '');
        this.frmConvocatoriaControl.cArchivoFormato.reset(data ? data.cArchivoFormato : '');
        this.frmConvocatoriaControl.cArchivoResEvalExp.reset(data ? data.cArchivoResEvalExp : '');
        this.frmConvocatoriaControl.cArchivoRectResEvaExp.reset(data ? data.cArchivoRectResEvaExp : '');
        this.frmConvocatoriaControl.cArchivoResEvTec.reset(data ? data.cArchivoResEvTec : '');
        this.frmConvocatoriaControl.cArchivoRecResEvaTec.reset(data ? data.cArchivoRecResEvaTec : '');
        this.frmConvocatoriaControl.cArchivoResFinal.reset(data ? data.cArchivoResFinal : '');
        this.frmConvocatoriaControl.iTipoProyectoId.reset(data ? data.iTipoProyectoId : '');
        this.frmConvocatoriaControl.iFuenteProyectoId.reset(data ? data.iFuenteProyectoId : '');
        this.frmConvocatoriaControl.cResolucion.reset(data ? data.cResolucion : '');
        this.frmConvocatoriaControl.iNumIntegrantes.reset(data ? data.iNumIntegrantes : '');
        this.frmConvocatoriaControl.nPresupuesto.reset(data ? data.nPresupuesto : '');

        this.archivos.cArchivoBases = (data ? data.cArchivoBases : '');
        this.archivos.cArchivoCronograma = (data ? data.cArchivoCronograma : '');
        this.archivos.cArchivoFormato = (data ? data.cArchivoFormato : '');
        this.archivos.cArchivoResEvalExp = (data ? data.cArchivoResEvalExp : '');
        this.archivos.cArchivoRectResEvaExp = (data ? data.cArchivoRectResEvaExp : '');
        this.archivos.cArchivoResEvTec = (data ? data.cArchivoResEvTec : '');
        this.archivos.cArchivoRecResEvaTec = (data ? data.cArchivoRecResEvaTec : '');
        this.archivos.cArchivoResFinal = (data ? data.cArchivoResFinal : '');

        this.frmConvocatoriaControl.idConvocatoria.reset(data ? data.iConvocatoriaId : '');
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

    private llenarSelect() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'fuente_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaFuenteProyecto = data;
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipoProyecto = data;
        });
    }
}


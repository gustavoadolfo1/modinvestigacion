import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {ConstantesService} from '../../../servicios/constantes.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-informe-hito',
    templateUrl: './informe-hito.component.html',
    styleUrls: ['./informe-hito.component.scss'],
    providers: [MessageService],
})
export class InformeHitoComponent implements OnInit {
    nomProyecto: any;
    idProyecto: any;
    modelos = {
        sel_en_lista_hito: null,
        sel_en_lista_obs: null
    };
    dataServidor = {
        listaHito: null,
        listaTipoObservacion: null,
        listaEstadoObservacion: null,
        listaEstadoRevision: null,
        listaObs: null

    };
    private dataProyecto: Object;
    private dataInfTecObs = {
        iHitoId: '',
        observacion: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        },
    };
    dataHito = {
        dtFechaInicio: null,
        dtFechaFin: null,
        iNumeroHito: null,
        cNombre: null
    };
    private modalObservacion: any;
    private modalMantenimientoObs: any;
    private urlAPI: string;
    perfilActual = null;
    perfilesDeUsuarios;
    iMonitorId: any;
    frmObservacion: FormGroup;
    archivos = {
        cArchivoActa: '',
    };
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    private baseUrl;
    private docPersona;
    imprimir = {
        modalMantenimientoObs: null,
        modalObservacion: null,
    };
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
        if (!this._dataService.idProySel){
            this.router.navigate(['/investigacion/']);
        }
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.urlAPI = environment.urlAPI;
        this.baseUrl = environment.urlPublic;
    }

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.monitor].includes(this.perfilActual)){
            this.router.navigate(['/investigacion']);
        }else{
            this.idProyecto = this._dataService.idProySel;
            this.nomProyecto = this._dataService.nombProySel;
            // this.idProyecto = 1180;

            await this.getHitos(this.idProyecto);
            await this.cargaLista();
            this.perfilActual = this.local.getItem('perfilSeleccionado');
            this.crearFormulario();
        }
    }
    get frmObservacionControl() {
        return this.frmObservacion.controls;
    }
    crearFormulario() {
        this.frmObservacion = this.formBuilder.group({
            iHitoId: ['', Validators.required],
            iTipoObservacionId: ['', Validators.required],
            iEstadoObservacionId: ['', Validators.required],
            dtFechaActa: ['', Validators.required],
            cNumActa: ['', Validators.required],
            cLugar: ['', Validators.required],
            cRecomendacion: ['', Validators.required],
            cResultado: [''],
            cArchivoActa: [''],

            // PARA EDIT
            iObservacionHitoId: '',

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }
    limpiarFormulario(data: any = false) {
        this.frmObservacionControl.iHitoId.reset(data ? data.iHitoId : '');
        this.frmObservacionControl.iTipoObservacionId.reset(data ? data.iTipoObservacionId : '');
        this.frmObservacionControl.iEstadoObservacionId.reset(data ? data.iEstadoObservacionId : '');
        this.frmObservacionControl.dtFechaActa.reset(data ? data.dtFechaActa : '');
        this.frmObservacionControl.cNumActa.reset(data ? data.cNumActa : '');
        this.frmObservacionControl.cLugar.reset(data ? data.cLugar : '');
        this.frmObservacionControl.cRecomendacion.reset(data ? data.cRecomendacion : '');
        this.frmObservacionControl.cResultado.reset(data ? data.cResultado : '');
        this.frmObservacionControl.cArchivoActa.reset(data ? data.cArchivoActa : '');

        this.frmObservacionControl.iObservacionHitoId.reset(data ? data.iObservacionHitoId : '');
        this.archivos.cArchivoActa = (data ? data.cArchivoActa : '');
    }
    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_observacion':
                 console.warn(this.frmObservacion.value);
                frmTratarControl = this.frmObservacionControl;
                frmTratar = this.frmObservacion;
                break;
        }
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
                const data2 = {
                    carpeta: this.idProyecto,
                    prefijo: 'ActaObs',
                    sufijo: 'suf',
                    controlArchivo: ['cArchivoActa']
                    //  data: JSON.stringify(frmTratar.getRawValue())
                };
                const dataExtra = {...frmTratar.getRawValue(), ...data2};
                const retorno = await (await this.queryInvestigacion.enviarArchivo(
                    tipo_form,
                    this.frmObservacion,
                    ['cArchivoActa'],
                    dataExtra
                ));
                // @ts-ignore
                if (!retorno.error) {
                    this.mostarListaObs(this.frmObservacionControl.iHitoId.value);
                    this.limpiarFormulario();
                    this.modalMantenimientoObs.close();
                    // this.modalService.dismissAll();
                }
            }
        }
    }
    async cargaLista() {
        this.dataServidor.listaTipoObservacion = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'tipo_observacion',
            data: ['%']
        });
        this.dataServidor.listaEstadoObservacion = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'estado_observacion',
            data: ['%']
        });
        this.dataServidor.listaEstadoRevision = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'estado_revision',
            data: ['%']
        });
    }

    async getHitos(idProyecto: any = false) {
        this.dataServidor.listaHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [idProyecto, null, null]
        });
        // console.log(this.dataServidor.listaHito);
    }

    async getProyecto(idProyecto: any = false) {
        this.dataProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_proyecto',
            data: [this.idProyecto]
        });
        this.nomProyecto = this.dataProyecto[0].cNombreProyecto;
    }

    gestionarDocumento(data) {
        switch (data[0]) {
            case 'doc_tecnico':
                this.local.setItem('ht', +data[1].iHitoId);
                this.router.navigate(['/informes/informe_tecnico']);
                break;
        }
    }

    async abrirModal(tipo: string, ctrlModal = null, data) {
        switch (tipo) {
            case 'observacion':
                this.mostarListaObs(data.iHitoId);
                this.frmObservacionControl.iHitoId.reset(data.iHitoId);
                this.imprimir.modalObservacion = 'Gestión de Observaciones en el Hito N° ' + data.iNumeroHito + ': ' + data.cNombre;
                this.dataHito.iNumeroHito = data.iNumeroHito;
                this.dataHito.cNombre = data.cNombre;
                this.modalObservacion = this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg', centered: true});

                break;
            case 'nuevo':
                this.imprimir.modalMantenimientoObs = 'Nueva Observación en el Hito N° ' + this.dataHito.iNumeroHito + ': ' + this.dataHito.cNombre;
                this.modalMantenimientoObs = this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg', centered: true});
                break;
        }
    }
    async mostarListaObs(idHito: any = false) {
        if ([this.perfilesDeUsuarios.oficina].includes(this.perfilActual)){
            this.dataServidor.listaObs = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'data_avance_tecnico_obs',
                data: [this.idProyecto, idHito]
            });
        }
        if ([this.perfilesDeUsuarios.monitor].includes(this.perfilActual)){
            this.docPersona = this._dataService.doc;
            this.docPersona = '45239846';
            this.dataServidor.listaObs = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'data_avance_tecnico_obsXMonitor',
                data: [this.idProyecto, idHito, this.docPersona]
            });
        }
        console.log(this.dataServidor.listaObs);
    }
    // async agregarObservacion() {
    //     const obs = {
    //         iObservacionHitoId: null,
    //         iInfoAvTecId: null,
    //         iHitoId: null,
    //         iTipoObservacionId: null,
    //         iEstadoObservacionId: null,
    //         dtFechaActa: null,
    //         cNumActa: null,
    //         cLugar: null,
    //         cRecomendacion: null,
    //         cResultado: null,
    //         cArchivoActa: null,
    //         iMonitorId: ([this.perfilesDeUsuarios.monitor].includes(this.perfilActual) ? this.iMonitorId : null),
    //
    //         iRiesgoHitoId: null,
    //     };
    //     await this.dataInfTecObs.observacion.push(obs);
    //     this.activarBt();
    // }

    // eliminarObservacion(indexObs: any = false) {
    //     this.dataInfTecObs.observacion.splice(indexObs, 1);
    //     this.activarBt();
    // }

    // async guardar(tipo: string) {
    //     let valCampoLLenos = true;
    //     let msj1 = '';
    //     this.dataInfTecObs.observacion.filter((value, index, arr) => {
    //         if (value.iTipoObservacionId == null || value.iEstadoObservacionId == null || value.dtFechaActa == null || value.cNumActa == null || value.cLugar == null) {
    //             valCampoLLenos = false;
    //             msj1 = 'Faltan datos de la observación en el formulario.';
    //         }
    //     });
    //     if (valCampoLLenos) {
    //         const credencial_id = this._dataService.getOption().credencialActual.iCredId;
    //         const ip = this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local;
    //         this.dataInfTecObs.auditoria.credencial_id = credencial_id;
    //         this.dataInfTecObs.auditoria.ip = ip;
    //         let retorno;
    //         switch (tipo) {
    //             case 'observacion':
    //                 retorno = await this.queryInvestigacion.guardarDatosAsync({
    //                     tipo: 'mantenimiento_observacion_hito',
    //                     data: this.dataInfTecObs
    //                 });
    //                 break;
    //         }
    //         // @ts-ignore
    //         if (!retorno.error) {
    //             // console.log('enviado para guardar');
    //             this.limpiar();
    //             this.modalObservacion.close();
    //         } else {
    //             /* this.editandoActividades = true;
    //              this.disableForm = false;*/
    //         }
    //     } else {
    //         await Swal.fire({
    //             title: 'Error:',
    //             text: msj1 + ' por favor verifique.',
    //             type: 'error',
    //             confirmButtonText: 'Verificar',
    //         });
    //     }
    // }

    // async getObservacionesHito(idHito: any = false) {
    //     // this.limpiar();
    //     const dataObservacionHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
    //         tipo: 'data_avance_tecnico_obs',
    //         data: [this.idProyecto, idHito]
    //     });
    //     // tslint:disable-next-line:forin
    //     for (const index in dataObservacionHito) {
    //         const obs = {
    //             iObservacionHitoId: dataObservacionHito[index].iObservacionHitoId,
    //             iInfoAvTecId: dataObservacionHito[index].iInfoAvTecId,
    //             iHitoId: dataObservacionHito[index].iHitoId,
    //             iTipoObservacionId: dataObservacionHito[index].iTipoObservacionId,
    //             iEstadoObservacionId: dataObservacionHito[index].iEstadoObservacionId,
    //             dtFechaActa: dataObservacionHito[index].dtFechaActa,
    //             cNumActa: dataObservacionHito[index].cNumActa,
    //             cLugar: dataObservacionHito[index].cLugar,
    //             cRecomendacion: dataObservacionHito[index].cRecomendacion,
    //             cResultado: dataObservacionHito[index].cResultado,
    //             cArchivoActa: dataObservacionHito[index].cResultado,
    //             iMonitorId: dataObservacionHito[index].iMonitorId,
    //
    //             iRiesgoHitoId: dataObservacionHito[index].iRiesgoHitoId,
    //         };
    //         await this.dataInfTecObs.observacion.push(obs);
    //     }
    // }

    // limpiar() {
    //     this.dataInfTecObs.observacion = [];
    //     this.activoBtGd = false;
    // }

    // activarBt() {
    //     if (this.dataInfTecObs.observacion.length > 0) {
    //         this.activoBtGd = false;
    //     } else {
    //         this.activoBtGd = true;
    //     }
    //     // console.log(this.activoBtGd);
    //
    // }

    generarPdf(tipo: string, dataHt) {
        let rutaRep;
        let data;
        data = [this.idProyecto, dataHt.iInfoAvTecId, dataHt.iHitoId];
        switch (tipo) {
            case 'infAvTec':
                rutaRep = '/inv/gestion/descargas/infAvTec/' + this.idProyecto + '/' + dataHt.iInfoAvTecId + '/' + dataHt.iHitoId;
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

    async enviarAvTec(dataHt) {
        // console.log(dataHt);
        Swal.fire({
            title: 'Desea enviar el informe de avance del Hito N° ' + dataHt.iNumeroHito + ': ' + dataHt.cNombre + '?',
            html: 'Una vez enviadao el informe de avance, no podra registrar modificaciones ni gastos en el Hito N° ' + dataHt.iNumeroHito + '!',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                Swal.fire(
                    'Enviado',
                    'El Informe de Avance fue enviado',
                    'success'
                );
                this.enviar(dataHt);
            }
        });
    }
    async enviar(dataHt){
        const data = {
            iInfoAvTecId : dataHt.iInfoAvTecId,
            iHitoId : dataHt.iHitoId,
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'enviar_informe_avance_tecnico',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            // console.log('enviado para guardar');
        } else {
            /*  await swal.fire({
                title: 'Error:',
                text: msj1 + ' por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });*/
        }
        await this.getHitos(this.idProyecto);
    }
    async RevisarAvTec(dataHt, iEstadoRevisionId: string) {
        let cEstadoRevision;
        this.dataServidor.listaEstadoRevision.filter((value, index, arr) => {
            if (value.iEstadoRevisionId == iEstadoRevisionId) {
                cEstadoRevision = value.cEstadoRevision;
            }
        });
        Swal.fire({
            title: 'Desea guardar la revisión del informe de avance del Hito N° ' + dataHt.iNumeroHito + ': ' + dataHt.cNombre + '?',
            html: 'El estado para la revisión para el informe es: <br> <b>' + cEstadoRevision + '</b>',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                this.revisar(dataHt);
            }
        });
    }
    async revisar(dataHt){
        const data = {
            iInfoAvTecId : dataHt.iInfoAvTecId,
            iEstadoRevisionId : dataHt.iEstadoRevisionId,
            iHitoId : dataHt.iHitoId,
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'revisar_informe_avance_tecnico',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            // console.log('enviado para guardar');
        } else {
            /*  await swal.fire({
                title: 'Error:',
                text: msj1 + ' por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });*/
        }
        await this.getHitos(this.idProyecto);
    }

    mostrarPDF(ctrlModal, url) {
        // console.log(url);
        const ur = encodeURI(this.baseUrl + url);
        this.pdfActual = ur.replace(' ', '%20');
        this.modalAbierto = true;
        this.modalService.open(ctrlModal, {size: 'lg', backdrop: 'static', windowClass: 'modalPDF'});
    }

    async llamarAccion(data) {
        switch (data[0]) {
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalMantenimientoObs = 'Nueva Observación en el Hito N° ' + this.dataHito.iNumeroHito + ': ' + this.dataHito.cNombre;
                this.modalMantenimientoObs = this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const info = {
                    iObservacionHitoId: data[2].iObservacionHitoId,
                    accionBd: 'borrar',
                    auditoria: {
                        credencial_id: this._dataService.getOption().credencialActual.iCredId,
                        ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local
                    }
                };
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_observacion',
                    data: info
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.mostarListaObs(data[2].iHitoId);
                }
                break;
        }
    }
}


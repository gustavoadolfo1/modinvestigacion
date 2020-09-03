import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbModal, NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {DataServices} from '../../../servicios/data.services';
import {interval, Subscription} from 'rxjs';
import swal from 'sweetalert2';
import {FrmRegistroModalComponent} from './frm-registro-modal/frm-registro-modal.component';
import {MdbTableDirective} from 'angular-bootstrap-md';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Router} from '@angular/router';
import {LocalService} from '../../../servicios/local.services';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {environment} from '../../../../environments/environment';
import {ConstantesService} from '../../../servicios/constantes.service';
import Swal from 'sweetalert2';
import {Hito} from '../../proyecto/hito/models/hito';

@Component({
    selector: 'app-principal',
    templateUrl: './principal.component.html',
    styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {
    @ViewChild('filtroBusquedaComponent', {static: false}) filtroBusqueda;


    @ViewChild('swalSelectTipoTramite', {static: false}) private swalSelTTramite: SwalComponent;
    @ViewChild(MdbTableDirective, {static: true}) mdbTable: MdbTableDirective;

    perfilesDeUsuarios;
    perfilActual = null;

    elements: any = [];
    searchText = '';
    previous: string;

    titulo_datosRespuesta = 'Proyectos de la Dependencia';
    // fechaActual = formatDate(new Date(), 'MM/dd/yyyy', 'en');
    tabs = [
        {label: 'Proyectoaaaa', icon: 'home'},
        {label: 'Externo', icon: 'business'},
    ];
    modelos = {
        sel_en_lista: null, sel_en_lista_hito: null

    };

    // map: {id: number; name: string}[] = [];
    miembrosProyectoActual: any = [];
    objEspecificosProyectoActual: any = [];

    listaTabActual;

    reg_proyecto_propuestas = null;
    reg_proyecto_propuestas_all = null;

    datosProyectosN = {
        proyectos: [],
        propuestas: []
    };


    p: any;

    regSeleccionado = null;

    data: any;
    tipoUsuario: any;
    docMiembro: any;
    docMonitor: any;
    docParEvaluador: any;
    docPostulante: any;
    idDepen: any;
    private baseUrl;
    modalAbierto = false;

    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    private frmAprobarPropuesta: FormGroup;
    dataServidor = {
        listaAnyoAprobado: null,
        listaConvocatoria: null,
        datosConvocatoria: null,
        actPendiente: []

    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    dataExtraAprobar = {
        hito: [],
        auditoria: {
            credencial_id: '',
            nombre_equipo: '',
            ip: '',
            mac: '',
        }
    };
    duracionHitos = 0;
    dataConvocatoria: any;
    duracion: number;
    iPersIdPostulacion: any;

    get frmAprobarPropuestaControl() {
        return this.frmAprobarPropuesta.controls;
    }


    suscripcionDatosMostrar: Subscription;


    loading: false;
    constructor(
        private _dataService: DataServices,
        private _constantes: ConstantesService,
        private queryInvestigacion: QueryInvestigacionServices,
        private local: LocalService,
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private toastr: ToastrService,
        private router: Router,
        private store: LocalStoreService,
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.baseUrl = environment.urlPublic;

        console.log(JSON.stringify(_constantes.perfilesDeUsuarios));
        // console.log(JSON.stringify(this.perfilesDeUsuarios));
    }

    @HostListener('input') oninput() {
        this.searchItems();
    }

    ngOnInit() {
        this.crearFormulario();
        this.getPreDatosPrincipal();

        this.perfilActual = this.local.getItem('perfilSeleccionado');
        let reintentos = 0;
        this.suscripcionDatosMostrar = interval(1000).subscribe(val => {

            if (this._dataService.getOption().ofSeleccionada != null) {
                this.elegirFormFiltro ();

                if (this.filtroBusqueda) {
                    // console.log('ESTA FILTRO BUSQUEDA');
                    this.filtroBusqueda.llenarLista();
                }

                if (this.reg_proyecto_propuestas_all || reintentos > 10) {
                    this.actividadesPendientes();
                    // tslint:disable-next-line:no-unused-expression
                    this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
                }else{

                }
                reintentos++;
            }
        });

        // console.log(this._dataService.getOption());
    }
    private getPreDatosPrincipal() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'get_preData_principal',
            data: ['%']
        }).subscribe(data => {
            console.log(data);
            this.dataServidor.listaAnyoAprobado = data['anyos']; // lista de años para la aprobación de propuestas
            this.dataServidor.listaConvocatoria = data['convActivas']; // lista de convocatorias activas


            // this.obtenerDatosServidor({
            //     tipo: 'data_anyo',
            //     data: ['%%']
            // }, 'dataAnios');
        });

    }

    actividadesPendientes() {
        // console.log('pendiente');
        this.dataServidor.actPendiente = [];
        const dataCons = {
            idDependencia: ((this.perfilActual == this.perfilesDeUsuarios.oficina) ? this.idDepen : null),
            docMiembro: ((this.perfilActual == this.perfilesDeUsuarios.integrante) ? this.docMiembro : null) ,
            docMonitor: ((this.perfilActual == this.perfilesDeUsuarios.monitor) ? this.docMonitor : null) ,
            docParEvaluador: ((this.perfilActual == this.perfilesDeUsuarios.parEvaluador) ? this.docParEvaluador : null)
        };
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'informes_pendientes_fecha_vigente',
            data: dataCons
        }).subscribe(data => {
            this.dataServidor.actPendiente.push({
                titulo: 'Próximos 7 días',
                data: data['pendiente0a7']
            });
            this.dataServidor.actPendiente.push({
                titulo: 'Próximos 30 días',
                data: data['pendiente8a30']
            });
            // console.log(data);
        });
        // dataCons = {
        //     idDependencia: ((this.perfilActual == this.perfilesDeUsuarios.oficina) ? this.idDepen : null),
        //     docMiembro: ((this.perfilActual == this.perfilesDeUsuarios.integrante) ? this.docMiembro : null) ,
        //     docMonitor: ((this.perfilActual == this.perfilesDeUsuarios.monitor) ? this.docMonitor : null) ,
        //     docParEvaluador: ((this.perfilActual == this.perfilesDeUsuarios.parEvaluador) ? this.docParEvaluador : null),
        //     minDiasVigentes: 8,
        //     maxDiasVigentes: 30
        // };
        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'informes_pendientes_fecha_vigente',
        //     data: dataCons
        // }).subscribe(data => {
        //     this.dataServidor.actPendiente.push({
        //         titulo: 'Próximos 30 días',
        //         data: data
        //     });
        // });
        // console.log(this.dataServidor.actPendiente);
    }
    // private mostrarConvocatorias() {
    //     this.queryInvestigacion.datosInvestigacionServidor({
    //         tipo: 'convocatorias_activa',
    //         data: ['']
    //     }).subscribe(data => {
    //         this.dataServidor.listaConvocatoria = data;
    //     });
    // }

    // private llenarSelect() {
    //     this.queryInvestigacion.datosInvestigacionServidor({
    //         tipo: 'data_anyo',
    //         data: ['%%']
    //     }).subscribe(data => {
    //         this.dataServidor.listaAnyoAprobado = data;
    //         // console.log(data);
    //     });
    // }


        searchItems() {
        const prev = this.mdbTable.getDataSource();
        if (!this.searchText) {
            this.mdbTable.setDataSource(this.previous);
            this.reg_proyecto_propuestas = this.mdbTable.getDataSource();
        }

        if (this.searchText) {
            this.reg_proyecto_propuestas = this.mdbTable.searchLocalDataBy(this.searchText);
            this.mdbTable.setDataSource(prev);
        }
    }

    crearFormulario() {
        this.frmAprobarPropuesta = this.formBuilder.group({
            iProyectoId: ['', Validators.required],
            iEstadoPropuesta: ['', Validators.required],
            iYearId: ['', Validators.required],
            cResProyecto: ['', Validators.required],
            dtInicio: ['', Validators.required],
            dtFin: ['', Validators.required],
            auditoria: {
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }
        });
    }

    abrirFormNuevo(idx, data = null) {
        // console.log(FrmRegistroModalComponent);

        const modalRef = this.modalService.open(FrmRegistroModalComponent, {
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            centered: true
        });
        modalRef.componentInstance.id = 10; // should be the id
        modalRef.componentInstance.tipo_tramite_id = idx;
        modalRef.componentInstance.titulo = this.tabs[(idx - 1)].label;

        modalRef.componentInstance.accionesRetorno.subscribe(($e) => {
            // console.log($e);
            switch ($e.accion) {
                case 'recargarLista':
                    // console.log('cargo');
                    break;
            }
        }, error => {
            // console.log('ERROR');
            // console.log(error);
        }, comp => {

            // console.log('COMP');
            // console.log(comp);
        });


        // this.swalSelTTramite.nativeSwal.close();
        if (data) {
            modalRef.componentInstance.dataRecibido = data;
        }
    }


    abrirFormRegistro(idx, data = null, titulo = null, accion = null) {
        const modalRef = this.modalService.open(FrmRegistroModalComponent, {
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            centered: true
        });
        modalRef.componentInstance.id = 10; // should be the id
        modalRef.componentInstance.tipo_tramite_id = idx;

        modalRef.componentInstance.titulo = this.tabs[(idx - 1)].label;
        modalRef.componentInstance.accionesRetorno.subscribe(($e) => {
            // console.log($e);
            switch ($e.accion) {
                case 'recargarLista':
                    this.filtroBusqueda.llenarLista();
                    break;
            }
        }, error => {
            // console.log('ERROR');
            // console.log(error);
        }, comp => {

            // console.log('COMP');
            // console.log(comp);
        });

        if (titulo) {
            // modalRef.componentInstance.titulo = titulo;
            modalRef.componentInstance.customTitle = titulo;
        }

        modalRef.componentInstance.accion = accion;
        // this.swalSelTTramite.nativeSwal.close();
        if (data) {
            // console.log('datos para edit');
            // console.log(data);
            modalRef.componentInstance.dataRecibido = data;
        }
    }


    getRango(content) {
        this.modalService.open(content, {size: 'sm'});

    }



    cambioTab($event: NgbTabChangeEvent) {
        this.listaTabActual = $event.nextId;
        if ($event.nextId != 'todos') {
            this.reg_proyecto_propuestas = this.datosProyectosN[$event.nextId];

        } else {
            this.reg_proyecto_propuestas = this.reg_proyecto_propuestas_all;

        }
    }
    obtenerDatosServidor(dataEnviar: object, controlLlenar: string = null, ejecutarFuncion = {
        funcion: null,
        variables: null
    }) {
        this.queryInvestigacion.datosInvestigacionServidor(dataEnviar).subscribe(data => {
            if (controlLlenar != null) {
                this[controlLlenar] = data;
            }
            if (ejecutarFuncion.funcion != null) {
                this[ejecutarFuncion.funcion](data, ejecutarFuncion.variables);
            }
        });
    }
    abrirModal(content = null, propiedades = {}, fnOK = {funcion: null, variables: null}, fnCancel = {
        funcion: null,
        variables: null
    }) {
        const prop = {
            ariaLabelledBy: 'modal-basic-title',
            centered: true,
            size: 'lg',
            backdrop: 'static',
        };
        propiedades = {...prop, ...propiedades};
        this.modalService.open(content, propiedades);

    }

    getMiembros() {

        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_miembros_proyecto', data: [
                this.regSeleccionado.iProyectoId
            ]
        }).subscribe(dataMiembros => {
            this.miembrosProyectoActual.length = 0;
            // tslint:disable-next-line:forin
            for (const index in dataMiembros) {
                this.miembrosProyectoActual.push({
                    idMiembro: dataMiembros[index].iMiembroId,
                    txtNomApeMiembro: dataMiembros[index].cPersDescripcion,
                    idTipoMiembro: dataMiembros[index].iTipoMiembroId,
                    txtTipoMiembro: dataMiembros[index].cTipoMiembroDescripcion,
                    idMiembroProyecto: dataMiembros[index].iMiembroProyectoId,
                });
            }
        });
    }

    async getObjEspcifico() {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_obj_especifico_proyecto', data: [
                this.regSeleccionado.iProyectoId
            ]
        });
        let indexDataExtra = 0;
        this.objEspecificosProyectoActual.length = 0;
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            this.objEspecificosProyectoActual.push({
                iObjetivoId: dataObjEspecifico[index].iObjetivoId,
                cObjetivo: dataObjEspecifico[index].cObjetivo,
                indexDataExtra: indexDataExtra
            });
            indexDataExtra++;
        }
    }

    async llamarAccion(data) {
        let dataEnv;


        switch (data[0]) {

            case 'editar':
                this.regSeleccionado = data[1];
                this.getMiembros();
                await this.getObjEspcifico();
                dataEnv = {
                    iProyectoId: data[1].iProyectoId,

                    idCarrera: data[1].iCarreraId,
                    idLineaInvestigacion: data[1].iLineaInvestigacionId,
                    idTipoProyecto: data[1].iTipoProyectoId,
                    idEstadoProyecto: data[1].iEstadoProyectoId,
                    idFuenteProyecto: data[1].iFuenteProyectoId,
                    objetivoGeneral: data[1].cObjetivoGeneral,
                    objetivoEspecifico: data[1].cObjetivoEspecifico,
                    idAnyoAprobado: data[1].iYearId,
                    resolucionProyecto: data[1].cResProyecto,
                    nombreProyecto: data[1].cNombreProyecto,
                    presupuestoProyecto: data[1].nPresupuestoProyecto,
                    observacionProyecto: data[1].cObservacionProyecto,
                    idConvocatoria: data[1].iConvocatoriaId,

                    miembros: this.miembrosProyectoActual,
                    objEspecifico: this.objEspecificosProyectoActual,

                    iTramId: data[1].iProyectoId
                };
                this.abrirFormRegistro(1, dataEnv, 'EDITANDO PROYECTO N° ' + data[1].iProyectoId);
                break;

            case 'eliminar_proyecto':
                const info = {
                    iProyectoId: data[1].iProyectoId,
                    accionBd: 'borrar',
                    auditoria: {
                        credencial_id: this._dataService.getOption().credencialActual.iCredId,
                        ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local
                    }
                };
                await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_proyecto',
                    data: info
                }, 'Se eliminará el Proyecto:' + data[1].iProyectoId + ' ' + data[1].cNombreProyecto);
                // this.cargarDatos();
                break;
            case 'nuevo':
                const iConvocatoriaId = data[1];
                this._dataService.idProySel = null;
                this._dataService.nombProySel = null;
                this.local.setItem('idConv', iConvocatoriaId);
                // this.local.setItem('proysel', '');
                this.router.navigate(['/proyecto/datos_proyecto']);
                break;
            case 'nuevo_registro':
           //     this._dataService.idProySel = null;
             //   this._dataService.nombProySel = null;
                // this.local.setItem('proysel', '');
                this.router.navigate(['/proyecto/datos_proyecto']);
                break;
            case 'verConvocatoria':
                const idConvocatoria = data[1];
                this.dataServidor.datosConvocatoria = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                    tipo: 'convocatorias_activa',
                    data: [idConvocatoria]
                });
                this.imprimir.modalTitulo = 'Datos de la Convocatoria';
                this.modalService.open(data[2], {centered: true, windowClass: 'modalSize', backdrop: 'static'});
                break;
            case 'editar2':
                // this.local.setItem('proysel', +data[1].iProyectoId);
                this._dataService.idProySel = +data[1].iProyectoId;
                this.router.navigate(['/proyecto/datos_proyecto']);
                break;
            case 'gestionar_proyecto':
                this._dataService.idProySel = +data[1].iProyectoId;
                this._dataService.nombProySel =  data[1].cNombreProyecto;
                // this.local.setItem('proyselNom', data[1].cNombreProyecto);
                // this.local.setItem('proysel', +data[1].iProyectoId);
                this.router.navigate(['/investigacion/gestion/']);
                break;
            case 'gestionar_evaluador':
                // console.log(data[1]);
                this._dataService.idParEval = data[1].iParEvaluadorId;
                this._dataService.idProySel = +data[1].iProyectoId;
                // this.local.setItem('proysel', +data[1].iProyectoId);
               this.local.setItem('idParEval', +data[1].iParEvaluadorId);
                this.router.navigate(['/evaluadores/pares_evaluadores']);
                break;
                 case 'gestionar_Monitor':
                 // console.log(data[1]);
                 // this.local.setItem('proysel', +data[1].iProyectoId);
                 this._dataService.idProySel = +data[1].iProyectoId;
                 this._dataService.nombProySel = data[1].cNombreProyecto;
                 this.router.navigate(['/monitores/monitor_proyecto']);
                 break;

                 case 'gestionar_evaluador_propuesta':
                 // console.log(data[1]);
                 this._dataService.idParEval = data[1].iParEvaluadorId;
                 this._dataService.idProySel = +data[1].iProyectoId;
                 // this.local.setItem('proysel', +data[1].iProyectoId);
                 this.local.setItem('idParEval', +data[1].iParEvaluadorId);
                 this.router.navigate(['/evaluadores/pares_evaluadores']);
                 break;
        }
    }

    retornoListaProyectosPropuestas(proy) {
        // this.reg = data;
        this.datosProyectosN = {
            proyectos: [],
            propuestas: []
        };
        // console.log(proy);
        // @ts-ignore
        for (const pr of proy) {
            if (+pr.iEstadoPropuesta == 1) {// propuesta  2// archivado
                this.datosProyectosN.propuestas.push(pr);
            }
            if (+pr.iEstadoPropuesta == 10) { // propuesta editable
                this.datosProyectosN.propuestas.push(pr);
            }
            if (+pr.iEstadoPropuesta == 0) {// proyecto
                this.datosProyectosN.proyectos.push(pr);
            }
        }
        if (this.listaTabActual && this.listaTabActual != 'todos') {
            this.reg_proyecto_propuestas = this.datosProyectosN[this.listaTabActual];
            // console.log();
        } else {
            this.reg_proyecto_propuestas = proy;
        }
        // console.log(this.reg_proyecto_propuestas);
        this.mdbTable.setDataSource(this.reg_proyecto_propuestas);
        this.elements = this.mdbTable.getDataSource();
        this.previous = this.mdbTable.getDataSource();
        this.reg_proyecto_propuestas_all = proy;
    }






    elegirFormFiltro () {
        let doc;
        this.data = this.store.getItem('userInfo');
        // console.log(JSON.stringify(this.store.getItem('userInfo')));
        if (this.data != undefined || this.data != null) {
            // console.log('ENTRO IF');
            // console.log(this.data.grl_persona.cPersDocumento);
            // @ts-ignore
            doc = this.data.grl_persona.cPersDocumento;
            this._dataService.doc = this.data.grl_persona.cPersDocumento;
        }

        // console.log(this.perfilActual);
        switch (this.perfilActual * 1) {
            case this.perfilesDeUsuarios.oficina:
                // console.log('OFICINA');
                this.data = this.store.getItem('ofsel');
                // console.log(this.data);
                if (this.data != undefined || this.data != null) {
                    // @ts-ignore
                    this.idDepen = this.data;

                }
                break;
            case this.perfilesDeUsuarios.integrante:
                // console.log('MIEMBRO');
                this.docMiembro = doc;
                break;
            case this.perfilesDeUsuarios.monitor:
                // console.log('MONITOR');
                this.docMonitor = doc;
                break;
            case this.perfilesDeUsuarios.parEvaluador:
                // console.log('PAR EVALUADOR');
                this.docParEvaluador = doc;
                break;
            case this.perfilesDeUsuarios.postulante:
                console.log('postulante');
                this.docPostulante = doc;

                this.iPersIdPostulacion = this.data.grl_persona.iPersId;
                console.log(this.docPostulante);
                break;
        }
        // console.log([this.idDepen, this.docMiembro, this.docParEvaluador]);



        /*
        this.data = this.store.getItem('tipUs');
        if (this.data != undefined || this.data != null) {
            this.tipoUsuario = this.data['tipUs'];
        }
       console.log( this.tipoUsuario);
        switch (this.tipoUsuario){
            case undefined:
                const ofSel = undefined;
                this.data = this.store.getItem('ofsel');
                if (this.data != undefined || this.data != null) {
                    // @ts-ignore
                    this.idDepen = this.data;

                }
                break;
            case '1':
                this.docMiembro = doc;
                break;
            case '2':
                this.docParEvaluador = doc;
                break;
        }
        */
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

    async aprobarPropuesta(ctrlModal: any, data: any) {
        // console.log(data);
        await this.getHitos(data.iProyectoId);
        this.limpiarFormulario(data);
        this.dataConvocatoria = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_convocatoria_proyecto',
            data: [data.iProyectoId]
        });
        // console.log(this.dataConvocatoria);
        if (this.dataConvocatoria.length > 0) {
            this.duracion = +this.dataConvocatoria[0].iNumMesesProyecto;
        } else {
            this.duracion = 0;
        }
        this.modalAbierto = true;
        this.modalService.open(ctrlModal, {centered: true, windowClass: 'modalSize', backdrop: 'static'});
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        let dataGuardar;
        switch (tipo_form) {
            case 'mantenimiento_aprobar_propuesta':
                frmTratarControl = this.frmAprobarPropuestaControl;
                frmTratar = this.frmAprobarPropuesta;
                const dataHito = {
                    hito: []
                };
                this.dataExtraAprobar.hito.filter((value, index, arr) => {
                    dataHito.hito.push(value);
                });
                dataGuardar = {...dataHito};
                break;
        }
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            dataGuardar = {...frmTratar.value, ...dataGuardar};
            if (frmTratar.invalid) {
                await swal.fire({
                    title: 'Error:',
                    text: 'Faltan datos en el formulario. por favor verifique',
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                return false;
            } else {
                const retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: tipo_form,
                    data: dataGuardar
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.limpiarFormulario();
                    // this.modalActivo.close();
                    this.modalService.dismissAll();
                    if (this.filtroBusqueda) {
                        this.filtroBusqueda.llenarLista();
                    }
                }
            }
        }
    }

    limpiarFormulario(data: any = false) {
            // console.log(data);
            this.frmAprobarPropuestaControl.iProyectoId.reset(data.iProyectoId);
            this.frmAprobarPropuestaControl.iEstadoPropuesta.reset(data.iEstadoPropuesta);
            this.frmAprobarPropuestaControl.iYearId.reset(data.iYearId);
            this.frmAprobarPropuestaControl.cResProyecto.reset(data.cResProyecto);
            this.frmAprobarPropuestaControl.dtInicio.reset(data.dtInicio);
            this.frmAprobarPropuestaControl.dtFin.reset(data.dtFin);
    }

    async archivarPropuesta(data) {
        let cEstadoRevision;

        Swal.fire({
            title: 'Desea archivar la propuesta?',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                this.archivar(data);
            }
        });
    }
    async archivar(dataHt){
        const data = {
            iProyectoId : dataHt.iProyectoId,
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'archivar_proyecto',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            // console.log('enviado para guardar');
            if (this.filtroBusqueda) {
                this.filtroBusqueda.llenarLista();
            }
        } else {
            /*  await swal.fire({
                title: 'Error:',
                text: msj1 + ' por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });*/
        }
    }

    irActividadPendiente(data) {
        switch (+data.criterio) {
            case 1:
                // this.local.setItem('proysel', +data.iProyectoId);
                this._dataService.idProySel = +data.iProyectoId;
                this.router.navigate(['/informes/informe_hito']);
                break;
            case 2:
                // this.local.setItem('proysel', +data.iProyectoId);
                this._dataService.idProySel = +data.iProyectoId;
                this.router.navigate(['informes/informe_final']);
                break;
            case 3: // informe de par evaluador
                // this.local.setItem('proysel', +data.iProyectoId);
                this._dataService.idProySel = +data.iProyectoId;
                this.router.navigate(['evaluadores/pares_evaluadores']);
                break;
        }
    }
    async getHitos(idProyecto: any = false) {
        const dataHito = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_hitos_proyecto',
            data: [idProyecto, null, null]
        });
        this.dataExtraAprobar.hito = [];
        // console.log(dataHito);
              // tslint:disable-next-line:forin
            for (const index in dataHito) {
                const ht = new Hito();
                ht.iHitoId = dataHito[index].iHitoId;
                ht.iProyectoId = dataHito[index].iProyectoId;
                ht.iNumeroHito = dataHito[index].iNumeroHito;
                ht.cNombre = dataHito[index].cNombre;
                ht.cHitoAnyoInicio = dataHito[index].cHitoAnyoInicio;
                ht.cHitoMesInicio = dataHito[index].cHitoMesInicio;
                ht.cHitoAnyoFin = dataHito[index].cHitoAnyoFin;
                ht.cHitoMesFin = dataHito[index].cHitoMesFin;
                ht.iNumeroMeses = dataHito[index].iNumeroMeses;
                ht.dtFechaInicio = dataHito[index].dtFechaInicio;
                ht.dtFechaFin = dataHito[index].dtFechaFin;

                await this.dataExtraAprobar.hito.push(ht);
            }
        this.duracionHitos = 0;
        this.dataExtraAprobar.hito.filter((value, index, arr) => {
            this.duracionHitos += +value.iNumeroMeses;
        });
            // console.log(this.duracionHitos);
            // console.log(this.dataExtraAprobar.hito);

    }

    fechaPrimerHito() {
        this.dataExtraAprobar.hito[0].dtFechaInicio = this.frmAprobarPropuestaControl.dtInicio.value;
        // console.log( this.dataExtraAprobar.hito);
        let dFin;
        this.duracionHitos = 0;
        this.dataExtraAprobar.hito.filter((value, index, arr) => {
            if (index == 0){
                value.dtFechaInicio = this.frmAprobarPropuestaControl.dtInicio.value;
                const CurrentDate = new Date(this.frmAprobarPropuestaControl.dtInicio.value);
                CurrentDate.setMonth(CurrentDate.getMonth() + +value.iNumeroMeses);
                const day = CurrentDate.getDate();
                const month = CurrentDate.getMonth();
                const year = CurrentDate.getFullYear();
                value.dtFechaFin = year + '-' + this.padTo(month + 1) + '-' + this.padTo(day);
            }else{
                value.dtFechaInicio = this.dataExtraAprobar.hito[index - 1].dtFechaFin;
                const CurrentDate = new Date(value.dtFechaInicio);
                const dias = 2; // Número de días a agregar
                CurrentDate.setDate(CurrentDate.getDate() + dias);
                let day = CurrentDate.getDate();
                let month = CurrentDate.getMonth();
                let year = CurrentDate.getFullYear();
                value.dtFechaInicio = year + '-' + this.padTo(month + 1) + '-' + this.padTo(day) ;

                CurrentDate.setMonth(CurrentDate.getMonth() + +value.iNumeroMeses);
                day = CurrentDate.getDate();
                month = CurrentDate.getMonth();
                year = CurrentDate.getFullYear();
                value.dtFechaFin = year + '-' + this.padTo(month + 1) + '-' + this.padTo(day) ;
                dFin = year + '-' + this.padTo(month + 1) + '-' + this.padTo(day) ;
            }
            this.frmAprobarPropuestaControl.dtFin.reset(dFin);
            this.duracionHitos += (+value.iNumeroMeses);
        });
    }
    padTo(number) {
        if (number <= 9) {
            number = ('0' + number).slice(-2); }
        return number;
    }
}

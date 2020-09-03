import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {environment} from '../../../../environments/environment';
import swal from 'sweetalert2';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';
import {ObjetivoEspecifico} from './models/objetivoEspecifico';
import {ConstantesService} from '../../../servicios/constantes.service';
import Swal from 'sweetalert2';
import {DecimalPipe, formatCurrency, formatNumber} from '@angular/common';
import {saveAs} from 'file-saver';

@Component({
    selector: 'app-proyecto',
    templateUrl: './proyecto.component.html',
    styleUrls: ['./proyecto.component.scss'],
    providers: [MessageService, DecimalPipe],
})
export class ProyectoComponent implements OnInit {
    activeIndex = 0;
    text: string;

    disabled = true;
    disabled1 = true;
    disabled2 = true;
    idProyecto;
    dataProyecto: Object;
    modalMiembro: any;
    idPersonaNaturalEmisor: string;
    perfilActual = null;
    modalPesona: any;
    mostrarPide = 0;
    perfilesDeUsuarios;
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
    };
    idConvocatoria: any;
    baseUrl: any;
    pdfActual: any;
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    convocatoria: string;
    esPostulante = true;
    data: string;
    numMaxMiembros;
    presupuestoMax;
    iEstadoRequisito;
    tab = false;
    iPersIdPostulacion: any;
    tituloModal: any;
    constructor(
        private _constantes: ConstantesService,
        private messageService: MessageService,
        private queryInvestigacion: QueryInvestigacionServices,
        private formBuilder: FormBuilder,
        public activeModal: NgbActiveModal,
        private local: LocalStoreService,
        private modalService: NgbModal,
        public _dataService: DataServices,
        private router: Router,
        private _decimalPipe: DecimalPipe
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
        this.baseUrl = environment.urlPublic;
    }

    dataServidor = {
        listaCarreras: null,
        listaConvocatoria: undefined,
        listaTipoProyecto: undefined,
        listaEstadoProyecto: undefined,
        listaFuenteProyecto: undefined,
        listaAnyoAprobado: undefined,
        listaTipoMiembro: undefined,
        listaLineasInvestigacion: undefined,
        listaMiembros: undefined,
        tipoIdentificacion: undefined,
        tipoPersonas: undefined,
        persona: undefined,
        listaTipoContactos: undefined,
        listaNacionalidades: undefined,
        dataRenic: null
    };
    dataExtraProyecto = {
        miembros: [],
        objEspecifico: [],
    };
    dataContacto = {
        contacto: []
    };
    pers_seleccionada = {
        i: null,
        foto: null,
        nombres_completos: null,
        dni: null,
        persona_id: null
    };
    loading = false;
    frmRegistro: FormGroup;
    frmAgregarMiembro: FormGroup;
    frmPersona: FormGroup;

    enviandoFormulario = false;
    tipoPersModal: number;
    editandoMiembro = false;
    imgsDomain = environment.urlPublic + 'fotografia/';
    modelos = {
        sel_en_lista: null,
        sel_en_lista_contacto: undefined,
        sel_en_lista_persona: undefined

    };
    p: number;

    async ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina, this.perfilesDeUsuarios.integrante, this.perfilesDeUsuarios.postulante].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.idConvocatoria = this.local.getItem('idConv');
            // if ([this.perfilesDeUsuarios.oficina].includes(this.perfilActual)) {
            //     this.convocatoria = 'convocatoria';
            //     this.idConvocatoria = '%';
            //     // this.disabled1 = false;
            //     // this.tab = true;
            // }else{
            //     this.convocatoria = 'convocatorias_activa';
            //     this.asignarDirector();
            //     // this.disabled1 = true;
            //     // this.tab = false;
            // }
            this.crearFormulario();
            // this.idProyecto = this.local.getItem('proysel');
            this.idProyecto = this._dataService.idProySel;
            await this.getPreDatosProyecto();
            await this.llenarSelect();
            // this.perfilActual = this.local.getItem('perfilSeleccionado');
            if (this.idProyecto > 0) {
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'data_proyecto',
                    data: [this.idProyecto]
                }).subscribe(data => {
                    console.log(data);
                    this.dataProyecto = data;
                    this.limpiarFormulario(this.dataProyecto);
                    this.getMiembros(this.idProyecto);
                    this.getObjEspecifico(this.idProyecto);
                });
                await this.getObjEspecifico(this.idProyecto);
            }
        }
    }
    getPreDatosProyecto(){
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'get_preData_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaCarreras = data['carreras'];
            this.dataServidor.listaEstadoProyecto = data['estadoProy'];
            this.dataServidor.listaFuenteProyecto = data['fuenteProy'];
            this.dataServidor.listaAnyoAprobado = data['anyos'];
            this.dataServidor.listaTipoMiembro = data['tipoMiemb'];
            this.dataServidor.listaTipoContactos = data['tipoContacto'];
            this.dataServidor.listaNacionalidades = data['nacionalidades'];

            this.idConvocatoria = this.local.getItem('idConv');
            if ([this.perfilesDeUsuarios.oficina].includes(this.perfilActual)) {
                this.dataServidor.listaConvocatoria = data['convocatorias'];
            }else{
                this.dataServidor.listaConvocatoria = data['convActivas'];
                this.asignarDirector();
            }
            console.log( this.frmRegistroControl.idConvocatoria.value);



            if ([this.perfilesDeUsuarios.postulante, this.perfilesDeUsuarios.integrante].includes(this.perfilActual) &&  this.frmRegistroControl.idConvocatoria.value == 10) {
                this.frmRegistroControl.idEstadoProyecto.setValue(8); // iEstadoPropuesta
                this.numMaxMiembros = 0;
                this.presupuestoMax = 0;
                this.frmRegistroControl.idConvocatoria.setValue(10);
                let data1;
                data1 = this.local.getItem('userInfo');
                if (data1 != undefined || data1 != null) {
                    // @ts-ignore
                    this.iPersIdPostulacion = this.data.grl_persona.iPersId;
                    this.frmRegistroControl.iPersIdPostulacion.reset(this.iPersIdPostulacion);
                }
                this.dataServidor.listaTipoProyecto = data['tipoProyNoConc'];
                // this.dataServidor.listaTipoProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                //     tipo: 'tipo_proyecto_bConcursable',
                //     data: ['%%', 0]
                // });
            }else{
                this.dataServidor.listaTipoProyecto = data['tipoProy'];
                this.frmRegistroControl.idEstadoProyecto.setValue(8); // iEstadoPropuesta
                this.mostraDatosConvocatoria(this.frmRegistroControl.idConvocatoria.value);
                // if (this.dataServidor.listaConvocatoria.length == 1){
                //     // console.log(this.dataServidor.listaConvocatoria);
                //     this.frmRegistroControl.idConvocatoria.setValue(this.idConvocatoria);
                //     this.frmRegistroControl.idTipoProyecto.setValue(this.dataServidor.listaConvocatoria[0].iTipoProyectoId);
                //     this.frmRegistroControl.idFuenteProyecto.setValue(this.dataServidor.listaConvocatoria[0].iFuenteProyectoId);
                //
                //     this.numMaxMiembros = this.dataServidor.listaConvocatoria[0].iNumIntegrantes;
                //     this.presupuestoMax = this.dataServidor.listaConvocatoria[0].nPresupuesto;
                //     console.log( 'otro');
                // }

            }
        });

    }
    async llenarSelect() {

        /*
                 this.dataServidor.listaTipoProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                    tipo: 'tipo_proyecto',
                    data: ['%%']
                });
        */
        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'estado_proyecto',
        //     data: ['%%']
        // }).subscribe(data => {
        //     this.dataServidor.listaEstadoProyecto = data;
        // });

        // this.dataServidor.listaFuenteProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
        //     tipo: 'fuente_proyecto',
        //     data: ['%%']
        // });
        // this.dataServidor.listaConvocatoria = await this.queryInvestigacion.datosInvestigacionServidorAsync({
        //     tipo: this.convocatoria,
        //     data: [this.idConvocatoria]
        // });

      /*  if ([this.perfilesDeUsuarios.postulante].includes(this.perfilActual) &&  this.frmRegistroControl.idConvocatoria.value == '') {
            this.frmRegistroControl.idEstadoProyecto.setValue(8); // iEstadoPropuesta
            this.numMaxMiembros = 0;
            this.presupuestoMax = 0;
            this.frmRegistroControl.idConvocatoria.setValue(10);
            console.log( this.frmRegistroControl.idConvocatoria.value);
            let data1;
            data1 = this.local.getItem('userInfo');
            if (data1 != undefined || data1 != null) {
                // @ts-ignore
                this.iPersIdPostulacion = this.data.grl_persona.iPersId;
                this.frmRegistroControl.iPersIdPostulacion.reset(this.iPersIdPostulacion);
            }

            this.dataServidor.listaTipoProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'tipo_proyecto_bConcursable',
                data: ['%%', 0]
            });
        }else{
            this.dataServidor.listaTipoProyecto = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'tipo_proyecto',
                data: ['%%']
            });
            if (this.dataServidor.listaConvocatoria.length == 1){
                // console.log(this.dataServidor.listaConvocatoria);
                this.frmRegistroControl.idConvocatoria.setValue(this.idConvocatoria);
                this.frmRegistroControl.idTipoProyecto.setValue(this.dataServidor.listaConvocatoria[0].iTipoProyectoId);
                this.frmRegistroControl.idFuenteProyecto.setValue(this.dataServidor.listaConvocatoria[0].iFuenteProyectoId);
                this.frmRegistroControl.idEstadoProyecto.setValue(8); // iEstadoPropuesta
                this.numMaxMiembros = this.dataServidor.listaConvocatoria[0].iNumIntegrantes;
                this.presupuestoMax = this.dataServidor.listaConvocatoria[0].nPresupuesto;
                console.log( 'otro');
            }

        }*/

        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'data_anyo',
        //     data: ['%%']
        // }).subscribe(data => {
        //     this.dataServidor.listaAnyoAprobado = data;
        // });

        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'tipo_miembro',
        //     data: ['%%']
        // }).subscribe(data => {
        //     this.dataServidor.listaTipoMiembro = data;
        // });



        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'data_tipo_contactos',
        //     data: ['%%']
        // }).subscribe(data => {
        //     this.dataServidor.listaTipoContactos = data;
        // });
        // this.queryInvestigacion.datosInvestigacionServidor({
        //     tipo: 'data_nacionalidades',
        //     data: ['%%']
        // }).subscribe(data => {
        //     this.dataServidor.listaNacionalidades = data;
        // });
    }

    get frmRegistroControl() {
        return this.frmRegistro.controls;
    }

    get frmAgregarMiembroControl() {
        return this.frmAgregarMiembro.controls;
    }

    get frmPersonaControl() {
        return this.frmPersona.controls;
    }

    crearFormulario() {
        this.frmRegistro = this.formBuilder.group({
            idCarrera: ['', Validators.required],
            idLineaInvestigacion: ['', Validators.required],
            idTipoProyecto: ['', Validators.required],
            idEstadoProyecto: [''],
            idFuenteProyecto: ['', Validators.required],
            idAnyoAprobado: [''],

            resolucionProyecto: [''],
            presupuestoProyecto: ['', [Validators.required, Validators.min(0)]],
            nombreProyecto: ['', Validators.required],
            objetivoGeneral: ['', Validators.required],
            objetivoEspecifico: [''],
            observacionProyecto: [''],
            archivoProyecto: ['', Validators.required],
            cArchivoPlanOp: ['', Validators.required],
            archivoAnexo: ['', Validators.required],
            cArchivoProyectoDoc: ['', Validators.required],
            cArchivoPlanOpDoc: ['', Validators.required],
            cArchivoAnexoDoc: ['', Validators.required],
            iEstadoRequisito: [''],
            cArchivoSimilitud: [''],
            cArchivoContrato: [''],
            cArchivoDJPostulacion: [''],
            iPersIdPostulacion: [''],


            idConvocatoria: [this.idConvocatoria],
            idDependencia: [localStorage.getItem('ofsel')],

            iEstadoPropuesta: [''],
            resumen: ['', Validators.required],
            antecedentes: ['', Validators.required],
            justificacion: ['', Validators.required],
            problema: ['', Validators.required],
            hipotesis: [''],
            bibliografia: ['', Validators.required],
            palabrasClave: ['', Validators.required],
            resultadosEsperados: ['', Validators.required],

            countObjEspecifico: [''],
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
            txtDocMiembro: ['', Validators.required],
            cDoc: [''],
        });

        this.frmPersona = this.formBuilder.group({
            idTipoPersona: ['', Validators.required],
            idTipoIdentidad: ['', Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],

            apellidoPaterno: ['', Validators.required],
            apellidoMaterno: ['', Validators.required],
            nombres: ['', Validators.required],
            sexo: ['', Validators.required],
            idNacionalidad: ['', Validators.required],
            fechaNacimiento: [''],

            grado: [''],

            razonSocial: [''],
            razonSocialCorto: [''],
            razonSocialSigla: [''],
            representanteLegal: [''],

            // PARA EDIT
            iPersId: '',
            iMiembroId: '',

            // para el tipo de persona
            opTipoPersona: 'miembro',

            auditoria: this.formBuilder.group({
                credencial_id: '',
                nombre_equipo: '',
                ip: '',
                mac: '',
            }),
        });
    }

    mostrarLineaInv(idCarrera: any = false) {
        this.frmRegistroControl.idLineaInvestigacion.setValue('');
        const idCar = (idCarrera > 0) ? idCarrera : this.frmRegistroControl.idCarrera.value;
        // console.log('idcar');
        // console.log(idCarrera);
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_linea_inv_postulacion',
            data: [idCar]
        }).subscribe(data => {
            this.dataServidor.listaLineasInvestigacion = data;
            // console.warn(data);
        });
    }

    limpiarFormulario(data: any = false) {
        console.log(data);
        this.frmRegistroControl.idCarrera.reset(data ? data[0].iCarreraId : '');
        this.frmRegistroControl.idLineaInvestigacion.reset(data ? data[0].iLineaInvestigacionId : '');
        this.frmRegistroControl.idTipoProyecto.reset(data ? data[0].iTipoProyectoId : '');
        this.frmRegistroControl.idEstadoProyecto.reset(data ? data[0].iEstadoProyectoId : '');
        this.frmRegistroControl.idFuenteProyecto.reset(data ? data[0].iFuenteProyectoId : '');
        this.frmRegistroControl.objetivoGeneral.reset(data ? data[0].cObjetivoGeneral : '');
        this.frmRegistroControl.objetivoEspecifico.reset(data ? data[0].cObjetivoEspecifico : ''); ////
        this.frmRegistroControl.idAnyoAprobado.reset(data ? data[0].iYearId : '');
        this.frmRegistroControl.resolucionProyecto.reset(data ? data[0].cResProyecto : '');
        this.frmRegistroControl.nombreProyecto.reset(data ? data[0].cNombreProyecto : '');
        this.frmRegistroControl.presupuestoProyecto.reset(data ? data[0].nPresupuestoProyecto : '');
        this.frmRegistroControl.observacionProyecto.reset(data ? data[0].cObservacionProyecto : '');
        this.frmRegistroControl.idConvocatoria.reset(data ? data[0].iConvocatoriaId : '');
        this.frmRegistroControl.resumen.reset(data ? data[0].cResumen : '');
        this.frmRegistroControl.antecedentes.reset(data ? data[0].cAntecedentes : '');
        this.frmRegistroControl.justificacion.reset(data ? data[0].cJustificacion : '');
        this.frmRegistroControl.problema.reset(data ? data[0].cProblema : '');
        this.frmRegistroControl.hipotesis.reset(data ? data[0].cHipotesis : '');
        this.frmRegistroControl.bibliografia.reset(data ? data[0].cBibliografia : '');
        this.frmRegistroControl.palabrasClave.reset(data ? data[0].cPalabrasClave : '');
        this.frmRegistroControl.resultadosEsperados.reset(data ? data[0].cResultadosEsperados : '');
        this.frmRegistroControl.iEstadoPropuesta.reset(data ? data[0].iEstadoPropuesta : '');

        this.frmRegistroControl.archivoProyecto.reset(data ? data[0].cArchivoProyecto : '');
        this.frmRegistroControl.cArchivoPlanOp.reset(data ? data[0].cArchivoPlanOp : '');
        this.frmRegistroControl.archivoAnexo.reset(data ? data[0].cArchivoAnexo : '');

        this.frmRegistroControl.cArchivoProyectoDoc.reset(data ? data[0].cArchivoProyectoDoc : '');
        this.frmRegistroControl.cArchivoPlanOpDoc.reset(data ? data[0].cArchivoPlanOpDoc : '');
        this.frmRegistroControl.cArchivoAnexoDoc.reset(data ? data[0].cArchivoAnexoDoc : '');
        this.frmRegistroControl.iEstadoRequisito.reset(data ? data[0].iEstadoRequisito : '');
        this._dataService.reqCompProy = (this.frmRegistroControl.iEstadoRequisito.value == 1 ? true : false);

        this.frmRegistroControl.cArchivoSimilitud.reset(data ? data[0].cArchivoSimilitud : '');
        this.frmRegistroControl.cArchivoContrato.reset(data ? data[0].cArchivoContrato : '');
        this.frmRegistroControl.cArchivoDJPostulacion.reset(data ? data[0].cArchivoDJPostulacion : '');
        this.frmRegistroControl.iPersIdPostulacion.reset(data ? data[0].iPersIdPostulacion : '');
        // console.log(data ? data[0].cArchivoProyecto : '');
        this.archivos.archivoProyecto = (data ? data[0].cArchivoProyecto : '');
        this.archivos.cArchivoPlanOp = (data ? data[0].cArchivoPlanOp : '');
        this.archivos.archivoAnexo = (data ? data[0].cArchivoAnexo : '');
        this.archivos.archivoProyectoDoc = (data ? data[0].cArchivoProyectoDoc : '');
        this.archivos.cArchivoPlanOpDoc = (data ? data[0].cArchivoPlanOpDoc : '');
        this.archivos.archivoAnexoDoc = (data ? data[0].cArchivoAnexoDoc : '');
        this.archivos.cArchivoSimilitud = (data ? data[0].cArchivoSimilitud : '');
        this.archivos.cArchivoContrato = (data ? data[0].cArchivoContrato : '');
        this.archivos.cArchivoDJPostulacion = (data ? data[0].cArchivoDJPostulacion : '');
       // this.archivos.archivoProyecto = (data ? data[0].cArchivoProyecto.replace('storage/inv/Proyectos/','') : '');
       // this.archivos.cArchivoPlanOp = (data ? data[0].cArchivoPlanOp.replace('storage/inv/Proyectos/','') : '');
      //  this.archivos.archivoAnexo = (data ? data[0].cArchivoAnexo.replace('storage/inv/Proyectos/','') : '');

        this.frmRegistroControl.iProyectoId.reset(data ? data[0].iProyectoId : '');
    }

    getMiembros(data: any = false) {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_miembros_proyecto',
            data: [data]
        }).subscribe(dataMiembros => {
            // @ts-ignore
            this.dataExtraProyecto.miembros.length = [];
            // tslint:disable-next-line:forin
            for (const index in dataMiembros) {
                this.dataExtraProyecto.miembros.push({
                    idMiembro: dataMiembros[index].iMiembroId,
                    txtNomApeMiembro: dataMiembros[index].cPersDescripcion,
                    idTipoMiembro: dataMiembros[index].iTipoMiembroId,
                    txtTipoMiembro: dataMiembros[index].cTipoMiembroDescripcion,
                    txtDocMiembro: dataMiembros[index].cPersDocumento,
                    idMiembroProyecto: dataMiembros[index].iMiembroProyectoId,
                    cDoc: dataMiembros[index].cDoc,
                });
            }
        });
        // console.log(this.dataExtraProyecto.miembros);
    }

    async getObjEspecifico(idProyecto: any = false) {
        const dataObjEspecifico = await this.queryInvestigacion.datosInvestigacionServidorAsync({
            tipo: 'data_obj_especifico_proyecto',
            data: [idProyecto]
        });
        this.dataExtraProyecto.objEspecifico = [];
        // tslint:disable-next-line:forin
        for (const index in dataObjEspecifico) {
            const objE = new ObjetivoEspecifico();
            objE.iObjetivoId = dataObjEspecifico[index].iObjetivoId;
            objE.iProyectoId = dataObjEspecifico[index].iProyectoId;
            objE.cObjetivo = dataObjEspecifico[index].cObjetivo;
            objE.iTipoObjetivoId = dataObjEspecifico[index].iTipoObjetivoId;

            await this.dataExtraProyecto.objEspecifico.push(objE);
        }
        this.validarObjEspecificos();
    }

    async accModalAgregarMiembro(accion, data: any = false) {
        // console.log(data);
        switch (accion) {
            case 'agregar':
                // console.log(this.frmAgregarMiembro.value);
                let error = false;
                if (this.frmAgregarMiembro.valid) {
                    let msj;
                    this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                        if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                            error = true;
                            msj = 'El miembro ya se encuentra en la lista. <br>Nombre: <strong>' + value.txtNomApeMiembro + '</strong><br>Función en el Proyecto: <strong>' + value.txtTipoMiembro + '</strong>';
                        }
                        if (value.idTipoMiembro == this.frmAgregarMiembroControl.idTipoMiembro.value && value.idTipoMiembro == 1) {
                            error = true;
                            msj = 'Existe un Director para el proyecto. <br>Nombre: <strong>' + value.txtNomApeMiembro + '</strong><br>Función en el Proyecto: <strong>' + value.txtTipoMiembro + '</strong>';
                        }
                    });
                    // console.log(this.frmAgregarMiembroControl.idTipoMiembro);
                    // console.log(error);
                    // console.log(this.dataExtraProyecto.miembros);
                    if (!error) {
                        this.dataExtraProyecto.miembros.push(this.frmAgregarMiembro.value);
                    }else{
                        Swal.fire({
                            title: 'Error:',
                            html: msj,
                            type: 'error',
                            confirmButtonText: 'Verificar',
                        });
                    }
                }else{
                    await swal.fire({
                        title: 'Error:',
                        text: 'Faltan datos en el formulario. por favor verifique',
                        type: 'error',
                        confirmButtonText: 'Verificar',
                    });
                }
                if (this.modalMiembro && this.frmAgregarMiembro.valid && !error) {
                    this.modalMiembro.close('guardar');
                }
                this.editandoMiembro = false;
                break;
            case 'del':
                this.frmAgregarMiembroControl.idMiembro.reset(data ? data.idMiembro : this.frmAgregarMiembroControl.idMiembro.value);
                this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                    if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                        this.dataExtraProyecto.miembros.splice(index, 1);
                    }
                });
                break;
            case 'save':
                // console.log(this.frmAgregarMiembroControl);
                this.dataExtraProyecto.miembros.filter((value, index, arr) => {
                    if (value.idMiembro == this.frmAgregarMiembroControl.idMiembro.value) {
                        this.dataExtraProyecto.miembros[index] = this.frmAgregarMiembro.value;
                    }
                });
                break;
        }

    }

    cambioSelecTipoMiembro($event = null) {
        // console.warn("evetno"+$event);
        this.frmAgregarMiembroControl.txtTipoMiembro.setValue($event.cTipoMiembroDescripcion);
    }

    async abrirMiembroModal(tipoPersona, ctrlModal = null) {
        this.tipoPersModal = tipoPersona;
        const valBusc = await this.frmAgregarMiembroControl.valBuscMiembro.value ? this.frmAgregarMiembroControl.valBuscMiembro.value : '';
        this.dataServidor.listaMiembros = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_miembros',
            data: [tipoPersona, valBusc]
        });
        if (ctrlModal) {
            this.modalService.open(ctrlModal, {backdrop: 'static', size: 'lg'});
        }
    }

    abrirModal(ctrModal, nuevo = true, indice = null) {
        if (nuevo) {
            this.frmAgregarMiembroControl.valBuscMiembro.setValue('');
            this.frmAgregarMiembroControl.idMiembro.setValue('');
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue('');
            this.frmAgregarMiembroControl.idTipoMiembro.setValue('');
            this.frmAgregarMiembroControl.txtTipoMiembro.setValue('');
            this.frmAgregarMiembroControl.txtDocMiembro.setValue('');

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
            this.llenarFrmAgregarMiembro(this.dataExtraProyecto.miembros[indice]);
        }
    }

    llenarFrmAgregarMiembro(data: any = false) {
        if (data) {
            this.frmAgregarMiembro.patchValue(data);
        } else {
            this.frmAgregarMiembro.reset();
        }
    }

    seleccionarMiembro(regPer, i) {
        if (this.tipoPersModal == 1) {
            this.frmAgregarMiembroControl.txtNomApeMiembro.setValue(regPer.cPersDescripcion);
            this.frmAgregarMiembroControl.idMiembro.setValue(regPer.iMiembroId);
            this.frmAgregarMiembroControl.txtDocMiembro.setValue(regPer.cPersDocumento);
            this.frmAgregarMiembroControl.cDoc.setValue(regPer.cDoc);
            this.idPersonaNaturalEmisor = regPer.idPersonaNaturalEmisor;
        }
    }

    async agregarObjEspecifico() {
        const objE = new ObjetivoEspecifico();
        objE.iObjetivoId = null;
        objE.iProyectoId = this.idProyecto;
        objE.cObjetivo = null;
        objE.iTipoObjetivoId = 2;

        await this.dataExtraProyecto.objEspecifico.push(objE);
    }

    eliminarObjEspecifico(indexObjE: any = false) {
        this.dataExtraProyecto.objEspecifico.splice(indexObjE, 1);
    }

    validarObjEspecificos() {
        if (this.dataExtraProyecto.objEspecifico.length == 0) {
            this.frmRegistroControl.countObjEspecifico.setValue('');
        } else {
            this.frmRegistroControl.countObjEspecifico.setValue(this.dataExtraProyecto.objEspecifico.length);
        }
    }

    async accionesProyecto(tipo) {
        switch (tipo) {
            case 'guardar':
                // tslint:disable-next-line:forin
                for (const propertyName in this.dataExtraProyecto) {
                    this.frmRegistroControl[propertyName].setValue(this.dataExtraProyecto[propertyName]);
                }
                if (this.perfilActual == this.perfilesDeUsuarios.oficina){
                    this.frmRegistroControl.idDependencia.setValue(this._dataService.getOption().ofSeleccionada.iDepenId);
                }else{
                    this.frmRegistroControl.idDependencia.setValue(null);
                }
                const ret = await this.enviarFormulario('mantenimiento_proyecto');
                // @ts-ignore
                // console.log(ret);
                if (!ret.error) {
                    this.router.navigate(['/proyecto/hito_proyecto']);
                }
                this.enviandoFormulario = false;
                break;
            case 'cancelar':
                this.router.navigate(['/investigacion']);
                break;
        }
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        let dataGuardar;
        let envioProyecto = 0;
        let error2 = false;
        let msjPpt = '';
        switch (tipo_form) {
            case 'mantenimiento_proyecto':
                frmTratarControl = this.frmRegistroControl;
                frmTratar = this.frmRegistro;
                envioProyecto = 1;
                if (this.frmRegistroControl.presupuestoProyecto.invalid && this.presupuestoMax > 0){
                    msjPpt = 'El Presupuesto ingresado (' + this._decimalPipe.transform(this.frmRegistroControl.presupuestoProyecto.errors.actualValue, '1.2-2') + ') es mayor al de la convocatoria (' +
                        this._decimalPipe.transform(this.frmRegistroControl.presupuestoProyecto.errors.requiredValue, '1.2-2') + ').';
                }
                if (this.dataExtraProyecto.objEspecifico.length == 0){
                    error2 = true;
                    const ret2 = {error: true};
                    // console.log(frmTratar);
                    // console.log(frmTratar.value);
                    // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                    await swal.fire({
                        title: 'Error:',
                        text: 'Falta ingresar Objetivos Específicos',
                        type: 'error',
                        confirmButtonText: 'Verificar',
                    });
                    this.enviandoFormulario = false;
                    return ret2;
                }
                if (this.dataExtraProyecto.miembros.length == 0){
                    error2 = true;
                    const ret2 = {error: true};
                    // console.log(frmTratar);
                    // console.log(frmTratar.value);
                    // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                    await swal.fire({
                        title: 'Error:',
                        text: 'Falta ingresar los miembros para el Proyecto',
                        type: 'error',
                        confirmButtonText: 'Verificar',
                    });
                    this.enviandoFormulario = false;
                    return ret2;
                }
                break;
            case 'mantenimiento_persona':
                frmTratarControl = this.frmPersonaControl;
                frmTratar = this.frmPersona;

                dataGuardar = {...this.dataContacto};
                // console.log(dataGuardar);
                break;
        }
        if (frmTratarControl != null) {
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            this.enviandoFormulario = true;
            const ret = {error: true};
            if (frmTratar.invalid) {
                let msj = 'Faltan datos en el formulario. por favor verifique.';


                    ret.error = true;
                console.log(frmTratar);
                // console.log(frmTratar.value);
                // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                await swal.fire({
                    title: 'Error:',
                    html: msj + '<br>' + msjPpt,
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                this.enviandoFormulario = false;
                return ret;
            } else {
                let retorno = null;
                if (envioProyecto == 1) {
                    const data2 = {
                        carpeta: 'Proyectos',
                        prefijo: 'Proy',
                        sufijo: 'suf',
                        controlArchivo: ['archivoProyecto',
                            'cArchivoPlanOp',
                            'archivoAnexo',
                            'cArchivoProyectoDoc',
                            'cArchivoPlanOpDoc',
                            'cArchivoAnexoDoc',
                            'cArchivoSimilitud', 'cArchivoContrato',
                            'cArchivoDJPostulacion']
                        //  data: JSON.stringify(frmTratar.getRawValue())
                    };
                    const dataExtra = {...frmTratar.getRawValue(), ...data2};
                    retorno = await (await this.queryInvestigacion.enviarArchivo(
                        tipo_form,
                        this.frmRegistro,
                        ['archivoProyecto', 'cArchivoPlanOp', 'archivoAnexo', 'cArchivoProyectoDoc', 'cArchivoPlanOpDoc', 'cArchivoAnexoDoc', 'cArchivoSimilitud', 'cArchivoContrato', 'cArchivoDJPostulacion'],
                        dataExtra
                    ));

                } else {
                    dataGuardar = {...frmTratar.value, ...dataGuardar };
                    // console.warn(frmTratar.getRawValue());
                    retorno = await this.queryInvestigacion.guardarDatosAsync({
                        tipo: tipo_form,
                        data: dataGuardar
                    });
                }
                // console.log(retorno);
                // @ts-ignore
                if (!retorno.error) {
                    switch (tipo_form) {
                        case 'mantenimiento_persona':
                            this.limpiarFormularioPersona();
                            this.modalPesona.close();
                            break;
                        case 'mantenimiento_proyecto':
                            this._dataService.idProySel = +retorno.iProyectoId;
                            // this.local.setItem('proysel', retorno.iProyectoId);
                            ret.error = false;
                            return ret;
                            break;
                    }

                }
            }
            // this.enviandoFormulario = false;
        }
    }

    onTabChange(event) {
        this.messageService.add({severity: 'info', summary: 'Tab Expanded', detail: 'Index: ' + event.index});
    }

    async llamarAccion(data) {
        switch (data[0]) {
            case 'nuevo_persona':
                this.mostrarPide = 0;
                this.limpiarFormularioPersona();
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'tipo_persona',
                    data: []
                }).subscribe(dataP => {
                    this.dataServidor.tipoPersonas = dataP;
                    this.frmPersonaControl.idTipoPersona.setValue(1);
                });
               // this.frmPersonaControl.idTipoPersona.setValue(2);
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'tipo_identificacion',
                    data: []
                }).subscribe(dataI => {
                    this.dataServidor.tipoIdentificacion = dataI;
                    // this.frmPersonaControl.idTipoIdentidad.setValue(dataI[1].iTipoIdentId);
                });
                // CREAR PERSONA
                this.modalPesona = this.modalService.open(data[1], {backdrop: 'static', size: 'lg'});
                break;
            case 'consultar_persona':
                this.limpiarFormularioPersona(1);
                this.disabled = false;
                this.disabled2 = false;
                this.dataServidor.persona = await this.queryInvestigacion.datosServidorAsync({
                    tipo: 'data_personas',
                    data: [1, this.frmPersonaControl.numeroDocumento.value, this.frmPersonaControl.idTipoIdentidad.value]
                });
                if (this.dataServidor.persona.length > 0){
                    this.frmPersonaControl.iPersId.setValue(this.dataServidor.persona[0].iPersId);
                    this.frmPersonaControl.iMiembroId.setValue(this.dataServidor.persona[0].iMiembroId);
                    this.frmPersonaControl.grado.setValue(this.dataServidor.persona[0].cGrado);
                    this.frmPersonaControl.idTipoIdentidad.setValue(this.dataServidor.persona[0].iTipoIdentId);
                    this.frmPersonaControl.apellidoPaterno.setValue(this.dataServidor.persona[0].cPersPaterno);
                    this.frmPersonaControl.apellidoMaterno.setValue(this.dataServidor.persona[0].cPersMaterno);
                    this.frmPersonaControl.nombres.setValue(this.dataServidor.persona[0].cPersNombre);
                    this.frmPersonaControl.fechaNacimiento.setValue(this.dataServidor.persona[0].dPersNacimiento);
                    this.frmPersonaControl.sexo.setValue(this.dataServidor.persona[0].cPersSexo);
                    this.frmPersonaControl.idNacionalidad.setValue(this.dataServidor.persona[0].iNacionId);
                    this.mostrarPide = 0;
                    this.getPersonaContacto(this.dataServidor.persona[0].iPersId);
                    // data miembro
                    this.disabled = true;
                    if (this.dataServidor.persona[0].iMiembroId > 0){
                        Swal.fire({
                            title: 'Error:',
                            html: 'El Sr(a): <strong>' + this.dataServidor.persona[0].cPersPaterno + ' '
                                + this.dataServidor.persona[0].cPersMaterno + ' '
                                + this.dataServidor.persona[0].cPersNombre
                                + '</strong> ya se encuentra registrado(a) como miembro.',
                            type: 'error',
                            confirmButtonText: 'Verificar',
                        });
                        this.disabled2 = true;
                    }
                }else{
                    this.mostrarPide = 1;
                    let criterio;
                    let dataDoc;
                    if (this.frmPersonaControl.idTipoIdentidad.value == 2){
                        criterio = 'sunat';
                        dataDoc = {ruc: this.frmPersonaControl.numeroDocumento.value};
                    }else{
                        criterio = 'reniec';
                        dataDoc = {dni: this.frmPersonaControl.numeroDocumento.value};
                    }
                    this.queryInvestigacion.datosPideServidor(
                        criterio,
                        '',
                        dataDoc
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
                            this.disabled = true;
                        }
                    });
                }
                break;
        }
    }
    getPersonaContacto(data: any = false) {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_persona_contacto',
            data: [data]
        }).subscribe(dataContacto => {
            // @ts-ignore
            this.dataContacto.contacto.length = [];
            // tslint:disable-next-line:forin
            for (const index in dataContacto) {
                this.dataContacto.contacto.push({
                    iPersTipoConId: dataContacto[index].iPersTipoConId,
                    iTipoConId: dataContacto[index].iTipoConId,
                    iPersId: dataContacto[index].iPersId,
                    cPersTipoConDescripcion: dataContacto[index].cPersTipoConDescripcion,
                    bPersTipoConPrincipal: (dataContacto[index].bPersTipoConPrincipal == 1),
                    cUbigeoId: dataContacto[index].cUbigeoId,
                });
            }
        });
        // console.log(this.dataContacto.contacto);
    }

    async agregarContacto() {
        await this.dataContacto.contacto.push({
            iPersTipoConId:  null,
            iTipoConId: null,
            iPersId: this.frmPersonaControl.iPersId.value,
            cPersTipoConDescripcion: null,
            bPersTipoConPrincipal: false,
            cUbigeoId: null,
        });
    }

    eliminarContacto(indexCont: number) {
        this.dataContacto.contacto.splice(indexCont, 1);
    }

    async limpiarFormularioPersona(val = 0) {
        this.dataServidor.dataRenic =[];
        this.frmPersonaControl.idTipoPersona.setValue(1);
        if (val == 0){
            this.frmPersonaControl.idTipoIdentidad.reset('');
            this.frmPersonaControl.numeroDocumento.reset('');
        }
        this.frmPersonaControl.apellidoPaterno.reset('');
        this.frmPersonaControl.apellidoMaterno.reset('');
        this.frmPersonaControl.nombres.reset('');
        this.frmPersonaControl.sexo.reset('');
        this.frmPersonaControl.idNacionalidad.reset('');
        this.frmPersonaControl.fechaNacimiento.reset('');
        this.frmPersonaControl.razonSocial.reset('');
        this.frmPersonaControl.razonSocialCorto.reset('');
        this.frmPersonaControl.razonSocialSigla.reset('');
        this.frmPersonaControl.representanteLegal.reset('');
        this.frmPersonaControl.grado.reset('');
        this.frmPersonaControl.iPersId.reset('');
        this.frmPersonaControl.iMiembroId.reset('');
        this.dataContacto.contacto = [];
    }
    mostrarWord(url) {
        const ur = encodeURI(this.baseUrl + url);
        saveAs(ur, 'image.docx');
    }

    mostrarPDF(ctrlModal, url, titulo: any = false) {
        // console.log(url);
        if (titulo !== false){
            this.tituloModal = titulo;
        }else {
            this.tituloModal = 'Documento del Proyecto';
        }
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


    mayuscula(cObjetivo: any, s: string) {
        cObjetivo.cObjetivo = s;
    }

    async asignarDirector() {
        let doc;
        this.data = this.local.getItem('userInfo');
        if (this.data != undefined || this.data != null) {
            // @ts-ignore
            doc = this.data.grl_persona.cPersDocumento;
        }
        // console.log(doc);
        const mb = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_miembros',
            data: [1, doc]
        });
        // console.log(mb);
        // @ts-ignore
        if (mb.length > 0){
            this.dataExtraProyecto.miembros.push({
                idMiembro: mb[0].iMiembroId,
                txtNomApeMiembro: mb[0].cPersPaterno + ' ' + mb[0].cPersMaterno + ' ' + mb[0].cPersNombre ,
                idTipoMiembro: '1',
                txtTipoMiembro: 'DIRECTOR',
                txtDocMiembro:  mb[0].cPersDocumento,
            });
        }
    }
    async mostraDatosConvocatoria(idConvocatoria: any = false) {
        console.log(this.frmRegistroControl.idConvocatoria.value);
            console.log(idConvocatoria);
        const idCov = (idConvocatoria > 0) ? idConvocatoria : this.frmRegistroControl.idConvocatoria.value;
        if (idCov !== 10){

            // console.log('idcar');
            // console.log(idCarrera);
            const dataConv = await this.queryInvestigacion.datosInvestigacionServidorAsync({
                tipo: 'data_convocatoria',
                data: [idCov]
            });
            console.log(dataConv);
            // @ts-ignore
            if (dataConv.length == 1) {
                // console.log(this.dataServidor.listaConvocatoria);
                this.frmRegistroControl.idTipoProyecto.setValue(dataConv[0].iTipoProyectoId);
                this.frmRegistroControl.idFuenteProyecto.setValue(dataConv[0].iFuenteProyectoId);
                this.numMaxMiembros = dataConv[0].iNumIntegrantes;
                this.presupuestoMax = dataConv[0].nPresupuesto;
            }else{
                this.frmRegistroControl.idTipoProyecto.setValue('');
                this.frmRegistroControl.idFuenteProyecto.setValue('');
                this.numMaxMiembros = null;
                this.presupuestoMax = null;
            }
        }

    }
}

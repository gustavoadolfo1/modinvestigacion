import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';
import swal from 'sweetalert2';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';
import {LocalService} from '../../../servicios/local.services';

@Component({
  selector: 'app-miembro',
  templateUrl: './miembro.component.html',
  styleUrls: ['./miembro.component.scss']
})
export class MiembroComponent implements OnInit {
    dataServidor = {
        listaMiembros: null,
        tipoPersonas: null,
        tipoIdentificacion: null,
        persona: null,
        listaTipoContactos: null,
        listaNacionalidades: null,
        dataRenic: null
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
        sel_en_lista_contacto: null
    };


    frmConvocatoria: FormGroup;
    enviandoFormulario = false;
    private baseUrl;
    modalAbierto = false;
    cargandoPdfError = false;
    cargandoPdf = false;
    pdfActual: any;
    mostrarPide = 0;

    frmPersona: FormGroup;
    dataContacto = {
        contacto: []
    };
    modalPesona: any;
    p: any;
    perfilActual = null;
    perfilesDeUsuarios;

    variableCriterio = '';
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
        this.baseUrl = environment.urlPublic;
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
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
    get frmPersonaControl() {
        return this.frmPersona.controls;
    }
    crearFormulario() {
        this.frmPersona = this.formBuilder.group({
            idTipoPersona: ['', Validators.required],
            idTipoIdentidad: ['', Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],

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

    async llamarAccion(data) {
        switch (data[0]) {
            case 'nuevo':
                // CREAR PERSONA
                this.mostrarPide = 0;
                this.limpiarFormulario();
                this.modalPesona = this.modalService.open(data[1], {backdrop: 'static', size: 'lg'});
                break;
            case 'consultar_persona':
                this.limpiarFormulario(false, 1);
                this.dataServidor.persona = await this.queryInvestigacion.datosServidorAsync({
                    tipo: 'data_personas',
                    data: [1, this.frmPersonaControl.numeroDocumento.value, this.frmPersonaControl.idTipoIdentidad.value]
                } );
                // console.log(this.dataServidor.persona);
                if (this.dataServidor.persona.length > 0){
                    this.frmPersonaControl.iPersId.setValue(this.dataServidor.persona[0].iPersId);
                    this.frmPersonaControl.iMiembroId.setValue(this.dataServidor.persona[0].iMiembroId);
                    this.frmPersonaControl.idTipoIdentidad.setValue(this.dataServidor.persona[0].iTipoIdentId);
                    this.frmPersonaControl.apellidoPaterno.setValue(this.dataServidor.persona[0].cPersPaterno);
                    this.frmPersonaControl.apellidoMaterno.setValue(this.dataServidor.persona[0].cPersMaterno);
                    this.frmPersonaControl.nombres.setValue(this.dataServidor.persona[0].cPersNombre);
                    this.frmPersonaControl.fechaNacimiento.setValue(this.dataServidor.persona[0].dPersNacimiento);
                    this.frmPersonaControl.sexo.setValue(this.dataServidor.persona[0].cPersSexo);
                    this.frmPersonaControl.idNacionalidad.setValue(this.dataServidor.persona[0].iNacionId);
                    this.frmPersonaControl.grado.setValue(this.dataServidor.persona[0].cGrado);
                    this.mostrarPide = 0;
                    this.getPersonaContacto(this.dataServidor.persona[0].iPersId);
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
                        }
                    });
                }
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Miembro ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_persona',
                    data: [data[2].iMiembroId]
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.cargarLista();
                }
                break;
        }
    }

// REUTILIZABLES
    async cargarLista() {
        let valBus = this.variableCriterio;
        if (this.variableCriterio == ''){
            valBus = '%%';
        }
        this.dataServidor.listaMiembros = await this.queryInvestigacion.datosServidorAsync({
            tipo: 'data_miembros',
            data: [1, valBus]
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
                dataGuardar = {...this.dataContacto};
                // console.log(dataGuardar);
                break;
        }
        // console.log('trata'+frmTratarControl);
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
                dataGuardar = {...frmTratar.value, ...dataGuardar };
                // console.warn(frmTratar.getRawValue());
                retorno = await this.queryInvestigacion.guardarDatosAsync({
                    tipo: tipo_form,
                    data: dataGuardar
                });
                // @ts-ignore
                if (!retorno.error) {
                    // this.limpiarFormularioPersona();
                    // this.modalPesona.close();
                    this.cargarLista();
                    this.limpiarFormulario();
                    // this.modalActivo.close();
                    this.modalService.dismissAll();
                }
            }
            this.enviandoFormulario = false;
        }
    }

    limpiarFormulario(data: any = false, val = 0) {
        // console.log(data);
        this.dataServidor.dataRenic =[];
        this.frmPersonaControl.idTipoPersona.setValue(1);
        if (val == 0){
            this.frmPersonaControl.idTipoIdentidad.reset(data ? data.iTipoIdentId : '');
            this.frmPersonaControl.numeroDocumento.reset(data ? data.cPersDocumento : '');
        }
        this.frmPersonaControl.apellidoPaterno.reset(data ? data.cPersPaterno : '');
        this.frmPersonaControl.apellidoMaterno.reset(data ? data.cPersMaterno : '');
        this.frmPersonaControl.nombres.reset(data ? data.cPersNombre : '');
        this.frmPersonaControl.sexo.reset(data ? data.cPersSexo : '');
        this.frmPersonaControl.idNacionalidad.reset(data ? data.iNacionId : '');
        this.frmPersonaControl.fechaNacimiento.reset(data ? data.dPersNacimiento : '');
        this.frmPersonaControl.razonSocial.reset(data ? data.cPersRazonSocialNombre : '');
        this.frmPersonaControl.razonSocialCorto.reset(data ? data.cPersRazonSocialCorto : '');
        this.frmPersonaControl.razonSocialSigla.reset(data ? data.cPersRazonSocialSigla : '');
        this.frmPersonaControl.representanteLegal.reset(data ? data.cPersRepresentateLegal : '');

        this.frmPersonaControl.grado.reset(data ? data.cGrado : '');
        this.frmPersonaControl.iPersId.reset(data ? data.iPersId : '');
        this.frmPersonaControl.iMiembroId.reset(data ? data.iMiembroId : '');

        this.dataContacto.contacto = [];
        this.getPersonaContacto(data ? data.iPersId : '');
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
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_tipo_contactos',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipoContactos = data;
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_nacionalidades',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaNacionalidades = data;
        });
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
         console.log(this.dataContacto.contacto);
    }
}

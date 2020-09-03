import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QueryInvestigacionServices} from '../servicios/query-investigacion.services';
import {SesionService} from '../sesion/services/sesion.service';
import {Router} from '@angular/router';

import {ToastrService} from 'ngx-toastr';
import swal from "sweetalert2";
import {DataServices} from '../servicios/data.services';
import {ConstantesService} from '../servicios/constantes.service';
import {LocalStoreService} from '../shared/services/local-store.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    dataServidor = {
        listaMiembros: null,
        tipoPersonas: null,
        tipoIdentificacion: null,
        persona: null,
        listaTipoContactos: null,
        listaNacionalidades: null,
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
        sel_en_lista_contacto: null
    };

    enviandoFormulario = false;

    loading = false;
    frmPersona: FormGroup;
    dataContacto = {
        contacto: []
    };

    p: any;
    variableCriterio = '';

    private perfilActual = null;
    private perfilesDeUsuarios;
    private mostrarPide = 0;
    private modalPesona: any;

    constructor(
        private _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private formBuilder: FormBuilder,
        private _constantes: ConstantesService,
        private local: LocalStoreService,
        private router: Router,
    ) {
        this.perfilesDeUsuarios = _constantes.perfilesDeUsuarios;
    }
    ngOnInit() {

        this.crearFormulario();
        this.llenarSelect();
        this.cargarLista();
        this.perfilActual = this.local.getItem('perfilSeleccionado');
    }
    get frmPersonaControl() {
        return this.frmPersona.controls;
    }
    crearFormulario() {
        this.frmPersona = this.formBuilder.group({
            idTipoPersona: ['1', Validators.required],
            idTipoIdentidad: ['1', Validators.required],
            numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],

            apellidoPaterno: ['', Validators.required],
            apellidoMaterno: ['', Validators.required],
            nombres: ['', Validators.required],
            sexo: ['', Validators.required],
            idNacionalidad: ['', Validators.required],
            fechaNacimiento: [''],
            grado: [''],
            // PARA EDIT
            iPersId: '',
            iPostulanteId: '',

            razonSocial: [''],
            razonSocialCorto: [''],
            razonSocialSigla: [''],
            representanteLegal: [''],

            // para el tipo de persona
            opTipoPersona: 'postulante',

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
            case 'consultar_persona':
                this.dataServidor.persona = await this.queryInvestigacion.datosServidorAsync({
                    tipo: 'data_personas_anonimo',
                    data: [1, this.frmPersonaControl.numeroDocumento.value]
                }, true);
                //Sp_SEL_personasXiTipoPersIdXcDocumento_cDescripcion
                // console.log(this.dataServidor.persona);
                if (this.dataServidor.persona.length > 0){
                    this.frmPersonaControl.iPersId.setValue(this.dataServidor.persona[0].iPersId);
                    console.log('-------------------' + this.dataServidor.persona[0].iPostulanteId + '----------------');
                    this.frmPersonaControl.iPostulanteId.setValue(this.dataServidor.persona[0].iPostulanteId);
                    this.frmPersonaControl.idTipoIdentidad.setValue(this.dataServidor.persona[0].iTipoIdentId);

                    this.frmPersonaControl.apellidoPaterno.setValue(this.dataServidor.persona[0].cPersPaterno);
                    this.frmPersonaControl.apellidoMaterno.setValue(this.dataServidor.persona[0].cPersMaterno);
                    this.frmPersonaControl.nombres.setValue(this.dataServidor.persona[0].cPersNombre);
                    this.frmPersonaControl.fechaNacimiento.setValue(this.dataServidor.persona[0].dPersNacimiento);
                    this.frmPersonaControl.sexo.setValue(this.dataServidor.persona[0].cPersSexo);
                    this.frmPersonaControl.idNacionalidad.setValue(this.dataServidor.persona[0].iNacionId);
                    this.frmPersonaControl.grado.setValue(this.dataServidor.persona[0].cGrado);
                    this.mostrarPide = 0;
                }else{
                    this.mostrarPide = 1;
                    await this.queryInvestigacion.datosServidorAsync({
                        tipo: 'data_personas_anonimo',
                        data: [1, '42301231']
                    }, true);
                    this.queryInvestigacion.datosPideServidor(
                        'reniec',
                        '',
                        {dni: this.frmPersonaControl.numeroDocumento.value},
                        true
                    ).subscribe(dataDNI => {
                        console.log('Termino de cargar');
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

                            console.log('no hay error');
                        }
                        console.log('__SS__');
                    });
                }
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Miembro ';
                this.imprimirModalTitulo('');
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_persona',
                    data: [data[2].iEncargadoId]
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
                retorno = await this.queryInvestigacion.enviaranonimo({
                    tipo: tipo_form,
                    data: dataGuardar
                });
                // @ts-ignore
                if (!retorno.error) {
                    // this.limpiarFormularioPersona();
                    // this.modalPesona.close();

                    this.cargarLista();
                    this.limpiarFormulario();
                    this.router.navigate(['/sesion/inicio']);
                    // this.modalActivo.close();
                }
            }
            this.enviandoFormulario = false;
        }
    }
    private llenarSelect() {


        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_persona12',
            data: []
        }, true).subscribe(dataP => {
            this.dataServidor.tipoPersonas = dataP;
            this.frmPersonaControl.idTipoPersona.setValue(1);
        });
        // this.frmPersonaControl.idTipoPersona.setValue(2);
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_identificacion12',
            data: []
        }, true).subscribe(dataI => {
            this.dataServidor.tipoIdentificacion = dataI;
            // this.frmPersonaControl.idTipoIdentidad.setValue(dataI[1].iTipoIdentId);
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_nacionalidades12',
            data: ['%%']
        }, true).subscribe(data => {
            this.dataServidor.listaNacionalidades = data;
        });
    }

    limpiarFormulario(data: any = false, val = 0) {
        // console.log(data);
        this.frmPersonaControl.idTipoPersona.setValue(1);
        this.frmPersonaControl.idTipoIdentidad.reset(data ? data.iTipoIdentId : '');
        if (val == 0){
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
        this.frmPersonaControl.iPostulanteId.reset(data ? data.iPostulanteId : '');
    }

    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }


}

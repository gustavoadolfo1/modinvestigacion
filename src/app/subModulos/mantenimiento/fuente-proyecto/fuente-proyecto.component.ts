import {Component, OnInit} from '@angular/core';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import swal from 'sweetalert2';
import {LocalService} from '../../../servicios/local.services';
import {Router} from '@angular/router';
import {ConstantesService} from '../../../servicios/constantes.service';

@Component({
    selector: 'app-fuente-proyecto',
    templateUrl: './fuente-proyecto.component.html',
    styleUrls: ['./fuente-proyecto.component.scss']
})
export class FuenteProyectoComponent implements OnInit {
    dataServidor = {
        mostrarLista: null,
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
    };
    frmFuenteProyecto: FormGroup;
    enviandoFormulario = false;
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
        // queryInvestigacion.verificarAccesoMantenimiento();
    }

    get frmFuenteProyectoControl() {
        return this.frmFuenteProyecto.controls;
    }

    ngOnInit() {
        this.perfilActual = this.local.getItem('perfilSeleccionado');
        if (![this.perfilesDeUsuarios.oficina].includes(this.perfilActual)) {
            this.router.navigate(['/investigacion']);
        } else {
            this.crearFormulario();
            this.cargarLista();
        }
    }

    crearFormulario() {
        this.frmFuenteProyecto = this.formBuilder.group({
            descripcion: ['', Validators.required],

            // PARA EDIT
            idFuentProy: '',

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
                this.imprimir.modalPreTitulo = 'Nueva Fuente de Financiemiento | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Fuente Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_fuente_proyecto',
                    data: [data[2].iFuenteProyectoId]
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
            tipo: 'fuente_proyecto',
            data: [valBus]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;

        });
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_fuente_proyecto':
                // console.warn(this.frmFuenteProyecto.value);
                frmTratarControl = this.frmFuenteProyectoControl;
                frmTratar = this.frmFuenteProyecto;
                break;
        }
        // console.log('trata'+frmTratarControl);
        if (frmTratarControl != null) {
            // console.warn(this.frmFuenteProyectoControl);
            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });
            // console.warn(this._dataService.getOption().credencialActual.iCredId);
            // console.warn(frmTratarControl);

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
                    data: frmTratar.value
                });
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
        this.frmFuenteProyectoControl.descripcion.reset(data ? data.cFuenteProyDescripcion : '');

        this.frmFuenteProyectoControl.idFuentProy.reset(data ? data.iFuenteProyectoId : '');
    }

    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }
}

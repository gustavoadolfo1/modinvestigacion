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
    selector: 'app-estado-proyecto',
    templateUrl: './estado-proyecto.component.html',
    styleUrls: ['./estado-proyecto.component.scss']
})
export class EstadoProyectoComponent implements OnInit {
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
    frmEstadoProyecto: FormGroup;
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

    get frmEstadoProyectoControl() {
        return this.frmEstadoProyecto.controls;
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
        this.frmEstadoProyecto = this.formBuilder.group({
            descripcion: ['', Validators.required],
            detalle: [''],
            // PARA EDIT
            idEstadoProy: '',

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
                 this.imprimir.modalTitulo = 'Nuevo Tipo Documento | '
                this.imprimir.modalPreTitulo = 'Nueva Estado de Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'editar':
                this.limpiarFormulario(data[2]);
                this.imprimir.modalPreTitulo = 'Editar Estado de Proyecto | ';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
            case 'eliminar':
                const retorno = await this.queryInvestigacion.eliminarDatosAsync({
                    tipo: 'mantenimiento_estado_proyecto',
                    data: [data[2].iEstadoProyectoId]
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
            tipo: 'estado_proyecto',
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
            case 'mantenimiento_estado_proyecto':
                frmTratarControl = this.frmEstadoProyectoControl;
                frmTratar = this.frmEstadoProyecto;
                break;
        }

        if (frmTratarControl != null) {
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
        this.frmEstadoProyectoControl.descripcion.reset(data ? data.cEstadoProyDescripcion : '');
        this.frmEstadoProyectoControl.detalle.reset(data ? data.cEstadoProyDetalle : '');

        this.frmEstadoProyectoControl.idEstadoProy.reset(data ? data.iEstadoProyectoId : '');
    }

    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }
}

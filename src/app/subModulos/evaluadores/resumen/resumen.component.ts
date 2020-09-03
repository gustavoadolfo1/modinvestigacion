
import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {environment} from '../../../../environments/environment';
import {LocalStoreService} from '../../../shared/services/local-store.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class ResumenComponent implements OnInit {
    @Input() idParEvaluador;
    dataServidor = {
        mostrarLista: null,
        mostrarLista1: null,
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
        cDoc: null,
    };
    idProyecto;
  constructor(
      private _dataService: DataServices,
      private queryInvestigacion: QueryInvestigacionServices,
      private modalService: NgbModal,
      private modalActivo: NgbActiveModal,
      private formBuilder: FormBuilder,
      private local: LocalStoreService,
  ) {
      this.baseUrl = environment.urlPublic;
  }

    get frmConvocatoriaControl() {
        return this.frmConvocatoria.controls;
    }

  ngOnInit() {
      this.crearFormulario();
      // this.idProyecto = this.local.getItem('proysel');
      this.idProyecto = this._dataService.idProySel;
      this.idParEvaluador = this.local.getItem('idParEval');
      this.frmConvocatoriaControl.iProyectoId.setValue(this.idProyecto);
      this.cargarLista();
      this.frmConvocatoriaControl.idParEvaluador.setValue(this.idParEvaluador);
      // console.log(this._dataService.getOption());
  }
    crearFormulario() {
        this.frmConvocatoria = this.formBuilder.group({
            idParEvaluador: [''],
            idEstadoEvaluacion: [3],
            iProyectoId: [''],
            cDoc: [''],
            cResultados: ['' , Validators.required],
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
// REUTILIZABLES
    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'evaluaciones_oficina',
            data: [this.idProyecto]
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
    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_evaluacion':
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
                    this.frmConvocatoria,
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
        this.frmConvocatoriaControl.idParEvaluador.reset(data ? data.iParEvaluadorId : '');
        this.frmConvocatoriaControl.idEstadoEvaluador.reset(data ? data.idEstadoEvaluacion : '');
        //   this.frmConvocatoriaControl.iProyectoId.reset(data ? data.iProyectoId : '');
        this.frmConvocatoriaControl.cDoc.reset(data ? data.cDoc : '');
        this.frmConvocatoriaControl.cResultados.reset(data ? data.cResultados : '');
        this.archivos.cDoc = (data ? data.cDoc : '');
        this.frmConvocatoriaControl.idEvaluacion.reset(data ? data.iEvaluacionProyId : '');
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

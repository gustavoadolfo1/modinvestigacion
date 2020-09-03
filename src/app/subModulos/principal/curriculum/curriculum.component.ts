import {Component, Input, OnInit} from '@angular/core';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LocalStoreService} from '../../../shared/services/local-store.service';
import {environment} from '../../../../environments/environment';
import {ConstantesService} from '../../../servicios/constantes.service';
import swal from 'sweetalert2';
import {count} from 'rxjs/operators';

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss']
})
export class CurriculumComponent implements OnInit {
    @Input() idMiembro;
    perfilesDeUsuarios;
    dataServidor = {
        mostrarLista: null,
        mostrarLista1: null,
        mostrarLista2: null,
    };
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    modelos = {
        sel_en_lista: null,
    };

    frmCurriculum: FormGroup;
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
    iPersId: any;
    data: any;
    textoBt: string;
  constructor(
      private _dataService: DataServices,
      private _constantes: ConstantesService,
      private queryInvestigacion: QueryInvestigacionServices,
      private modalService: NgbModal,
      private formBuilder: FormBuilder,
      private store: LocalStoreService,
  ) {
      this.perfilesDeUsuarios = this._constantes.perfilesDeUsuarios;
      this.baseUrl = environment.urlPublic;

      console.log(JSON.stringify(_constantes.perfilesDeUsuarios));
      // console.log(JSON.stringify(this.perfilesDeUsuarios));
  }
    get frmCurriculumControl() {
        return this.frmCurriculum.controls;
    }
  ngOnInit() {
      this.crearFormulario();
      this.data = this.store.getItem('userInfo');
      this.iPersId = this.data.grl_persona.iPersId;
      this.cargarLista();

  }
    crearFormulario() {
        this.frmCurriculum = this.formBuilder.group({

            cDoc: ['', Validators.required],
            // PARA EDIT
            iPersId: '',

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
                this.frmCurriculumControl.iPersId.reset(this.iPersId);
                this.imprimir.modalPreTitulo = '';
                this.imprimirModalTitulo('');
                this.modalService.open(data[1], {centered: true, size: 'lg', backdrop: 'static'});
                break;
        }
    }
    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_miembro_cv',
            data: [this.iPersId]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            // @ts-ignore
            if (+data.length > 0 ) {
                this.textoBt = 'Actualizar CV';
            }else{
                this.textoBt = 'Añadir CV';
            }
        });

    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'mantenimiento_curriculum':
                frmTratarControl = this.frmCurriculumControl;
                frmTratar = this.frmCurriculum;
                break;
        }
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
                const data2 = {
                    carpeta: 'CV',
                    prefijo: 'Cv',
                    sufijo: 'suf',
                    controlArchivo: ['cDoc']
                    //  data: JSON.stringify(frmTratar.getRawValue())
                };
                const arch = ['cDoc'];
                const dataExtra = {...frmTratar.getRawValue(), ...data2};
                const retorno = await (await this.queryInvestigacion.enviarArchivo(
                    tipo_form,
                    this.frmCurriculum,
                    ['cDoc'],
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
        this.frmCurriculumControl.iPersId.reset(data ? data.iPersId : '');
        this.frmCurriculumControl.cDoc.reset(data ? data.cDoc : '');

        this.archivos.cDoc = (data ? data.cDoc : '');
    }
    imprimirModalTitulo(event) {
        this.imprimir.modalTitulo = this.imprimir.modalPreTitulo + event;
    }

    cerrarPDF() {

    }

    mostrarPDF(ctrlModal, url) {
        // console.log(url);
        const ur = encodeURI(this.baseUrl + url);
        this.pdfActual = ur.replace(' ', '%20');
        this.modalAbierto = true;
        this.modalService.open(ctrlModal, {size: 'lg', backdrop: 'static', windowClass: 'modalPDF'});
    }

}

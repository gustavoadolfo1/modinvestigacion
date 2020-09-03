import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {formatDate} from '@angular/common';
import {DataServices} from '../../servicios/data.services';
import {QueryInvestigacionServices} from '../../servicios/query-investigacion.services';

@Component({
    selector: 'app-ht-filtro-busqueda',
    templateUrl: './ht-filtro-busqueda.component.html',
    styleUrls: ['./ht-filtro-busqueda.component.scss']
})
export class HtFiltroBusquedaComponent implements OnInit {
    @Input() _tipo: any;
    @Input() _opciones: any;
    @Input() _opcionDefault: any;
    @Input() _idDependencia: any;
    @Input() _docMiembro: any;
    @Input() _docMonitor: any;
    @Input() _docParEvaluador: any;
    @Input() _docPostulante: any;
    @Input() _tipoUsuario: any;


    @Input() coleccionData: any;
    @Input() coleccionOpciones: any;

    @Output() resultados = new EventEmitter<any>();

    dataAnios = null;
    dataMeses = null;
    dataCriterios = null;

    lResultados = null;

    frmFiltro: FormGroup;
    dataConvocatoria = null;
    get frmFiltroControl() { return this.frmFiltro.controls; }
    constructor(
        public _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private formBuilder: FormBuilder,
    ) {
    }

    ngOnInit() {
        this.crearFormulario();
        this.getPreDataFiltro();
    }
    getPreDataFiltro(){
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'get_preData_filtro',
            data: ['%']
        }).subscribe( data => {
            console.log(data);
            this.dataConvocatoria = data['convocatorias'];
            this.frmFiltroControl.idConvocatoria.setValue(this.dataConvocatoria[0].iConvocatoriaId);

            this.dataAnios = data['anyos'];
            this.frmFiltroControl.year.setValue('');
            this.frmFiltroControl.yearCriterio.setValue('');

            this.dataCriterios = data['critBusProy'];
            this.frmFiltroControl.idCriterio.setValue(this.dataCriterios[0].iCritId);
        });
    }
    crearFormulario() {
        const fechaActual = new Date();
        this.frmFiltro = this.formBuilder.group({
            option: [this._opcionDefault],
            idDependencia: [this._idDependencia],
            docMiembro: [this._docMiembro],
            docMonitor: [this._docMonitor],
            docParEvaluador: [this._docParEvaluador],
            docPostulante: [this._docPostulante],
            tipoUsuario: [this._tipoUsuario],
            idConvocatoria: [''],
            fecha: [formatDate(fechaActual, 'yyyy-MM-dd', 'en')],
            year: [''],
            month: [''],
            range_1: [formatDate(fechaActual.setDate(fechaActual.getDate() - 20), 'yyyy-MM-dd', 'en')],
            range_2: [formatDate(fechaActual, 'yyyy-MM-dd', 'en')],

            yearCriterio: [''],
            idCriterio: [''],
            variableCriterio: [''],
        });
    }
    cambiarSelect(select) {
        switch (select) {
            case 'anio':
                    /*
                this.queryInvestigacion.datosInvestigacionServidor({
                    tipo: 'mes_anio',
                    data: [this.frmFiltroControl.year.value]
                }).subscribe( data => {
                    this.dataMeses = data;
                    this.frmFiltroControl.month.setValue(data[0].iTramMonthRegistro);
                });*/
                break;
        }
    }

    llenarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: this._tipo,
            data: this.frmFiltro.value
        }).subscribe(data => {
            // console.log(data);
            this.lResultados = data;
            this.listaResultados();
        });
    }

    listaResultados() {
        this.resultados.next(this.lResultados);
    }
}

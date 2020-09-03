import {Component, OnInit} from '@angular/core';
import {environment} from 'src/environments/environment';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EChartOption} from 'echarts';
import {LocalStoreService} from '../../../shared/services/local-store.service';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
    private urlAPI: string;
    salesChartBar: EChartOption;
    dataServidor = {
        listaAnyo: undefined,
        listaCarreras: undefined,
        listaTipo: undefined,
    };
    anyo: any;
    tipo: any
    iEstadoPropuesta: any;
    idTipoProyecto: any;
    ofsel: string;
    idProyecto: string;
    idCarrera: string;
    idAnyo: number;


    constructor(
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private local: LocalStoreService,
    )
    {
        this.urlAPI = environment.urlAPI;
    }

    ngOnInit() {
        this.llenarSelect();
    }

    openModal(content) {
        this.modalService.open(content);
    }

    openLg(content) {
        this.modalService.open(content, {size: 'lg'});
    }

    private llenarSelect() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_anyo',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaAnyo = data;
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'data_carreras',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaCarreras = data;
        });
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'tipo_proyecto',
            data: ['%%']
        }).subscribe(data => {
            this.dataServidor.listaTipo = data;
        });
    }
    generarPdf(tipo: string) {
        let rutaRep;
        let data;
        this.ofsel = localStorage.getItem('ofsel');
        this.idProyecto = this.local.getItem('proysel');
        data = [this.ofsel, this.anyo, this.iEstadoPropuesta, this.idProyecto, this.idCarrera, this.idAnyo, this.idTipoProyecto];
        switch (tipo) {
            case 'reporte_proyecto_docentesXescuela':
                rutaRep = '/inv/gestion/descargas/reporte_proyecto_docentesXescuela/' + this.idCarrera;
                break;
            case 'fronted':
                rutaRep = '/inv/gestion/descargas/unionback/' + this.idAnyo;
                break;
            case 'pptTotalProyXanyoEstPropt':
                rutaRep = '/inv/gestion/descargas/pptTotalProyXanyoEstPropt/' + this.ofsel + '/' + this.anyo + '/' + this.iEstadoPropuesta;
                break;
            case 'pptxRubroXanyoEstPropt':
                rutaRep = '/inv/gestion/descargas/pptxRubroXanyoEstPropt/' + this.ofsel + '/' + this.anyo + '/' + this.iEstadoPropuesta;
                break;
            case 'gtxRubroXanyoEstPropt':
                rutaRep = '/inv/gestion/descargas/gtxRubroXanyoEstPropt/' + this.ofsel + '/' + this.anyo + '/' + this.iEstadoPropuesta;
                break;
            case 'reporte_web':
                rutaRep = '/inv/gestion/descargas/reporte_webapi/' + this.ofsel + '/' + this.tipo + '/' + this.anyo ;
                break;

                case 'reporte_web_excel':
               rutaRep = '/inv/gestion/descargas/excel_web/'  + this.tipo + '/' + this.anyo ;
               break;

            case 'reporte_detalle_trimestral':
                rutaRep = '/inv/gestion/descargas/reporte_trimestralapi/' + this.ofsel + '/' + this.tipo + '/' + this.anyo ;
                break;
                /*********
                 *    case 'reporte_detalle_trimestral_excel':
                 rutaRep = '/inv/gestion/descargas/excel_trimestral/'  + this.tipo + '/' + this.anyo ;
                 break;
                 *
                 * *****/
            case 'reporte_detalle_trimestral_excel':
                rutaRep = '/inv/gestion/descargas/excel_trimestral/'  + this.tipo + '/' + this.anyo ;
                break;
            case 'reporte_miembros_proyecto':
                rutaRep = '/inv/gestion/descargas/reporte_miembrosapi/' + this.ofsel + '/' + this.tipo + '/' + this.anyo ;
                break;
            case 'reporte_miembros_proyecto_excel':
                rutaRep = '/inv/gestion/descargas/excel_miembros/'  + this.tipo + '/' + this.anyo ;
                break;
            case 'reporte_consolidado_proyectos':
                rutaRep = '/inv/gestion/descargas/reporte_consolidadoapi/' + this.ofsel + '/' +  this.anyo ;
                break;
            case 'reporte_consolidado_excel':
                rutaRep = '/inv/gestion/descargas/excel_consolidado/' +   this.anyo ;
                break;
            case 'reporte_consolidadosaldos_excel':
                rutaRep = '/inv/gestion/descargas/excel_consolidado_saldos/' +   this.anyo ;
                break;
            case 'reporte_revision_items':
                rutaRep = '/inv/gestion/descargas/reporte_revisionitemsapi/' + this.ofsel + '/'  + this.anyo ;
                break;
            case 'reporte_revision_items_excel':
                rutaRep = '/inv/gestion/descargas/excel_items/'  + this.anyo ;
                break;
        }
        window.open(
            this.urlAPI + rutaRep
        );

        this.queryInvestigacion
            .getReporte(rutaRep, data, this.anyo)
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
    generarExcel(tipo: string) {
        let rutaRep;
        let data;
        this.ofsel = localStorage.getItem('ofsel');
        this.idProyecto = this.local.getItem('proysel');
        data = [this.ofsel, this.anyo, this.iEstadoPropuesta, this.idProyecto, this.idCarrera, this.idAnyo, this.idTipoProyecto];
        switch (tipo) {
            case 'reporte_consolidado_proyectos':
                rutaRep = '/inv/gestion/descargas/export_excel/' + this.ofsel + '/' +  this.anyo ;
                break;
        }
        window.open(
            this.urlAPI + rutaRep
        );

        this.queryInvestigacion
            .getReporte(rutaRep, data, this.anyo)
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
}


import {Component, OnInit} from '@angular/core';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-notificacion',
    templateUrl: './notificacion.component.html',
    styleUrls: ['./notificacion.component.scss']
})
export class NotificacionComponent implements OnInit {
    dataServidor = {
        mostrarLista: null,
    };
    modelos = {
        sel_en_lista: null,
    };
    idCriterio;
    variableCriterio;
    imprimir = {
        modalTitulo: null,
        modalPreTitulo: null,
    };
    mensaje;
    p: any;

    constructor(
        private _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
        private modalService: NgbModal,
        private modalActivo: NgbActiveModal,
        private formBuilder: FormBuilder,
    ) {
    }

    ngOnInit() {
        this.cargarLista();
    }

    cargarLista() {
        this.queryInvestigacion.datosInvestigacionServidor({
            tipo: 'notificaciones',
            data: [this.idCriterio, this.variableCriterio]
        }).subscribe(data => {
            this.dataServidor.mostrarLista = data;
            console.log(data);

        });
    }

    retornoLista(lista) {
        this.dataServidor.mostrarLista = lista;
    }

    verNotificacion(data) {
        this.mensaje = data[1].cMensaje;
        this.imprimir.modalTitulo = 'Notificación de fecha: ' + data[1].dtEnvio;
        this.modalService.open(data[0], {centered: true, windowClass: 'modalSize', backdrop: 'static'});
    }
}

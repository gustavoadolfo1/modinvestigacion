import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {DataServices} from '../../../servicios/data.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';

@Component({
    selector: 'ch-requisito',
    templateUrl: './requisito.component.html',
    styleUrls: ['./requisito.component.scss']
})
export class RequisitoComponent implements OnInit {
    iEstadoRequisito: any;
    idProyecto;

    constructor(
        public _dataService: DataServices,
        private queryInvestigacion: QueryInvestigacionServices,
    ) {
    }

    ngOnInit() {
        this.idProyecto = this._dataService.idProySel;
        this.iEstadoRequisito = this._dataService.reqCompProy;
    }

    async estadoRequisito() {
        console.log(this.iEstadoRequisito);

        Swal.fire({
            title: 'Desea cambiar el Estado de los Requisitos?',
            html: 'Una vez finalizado no podrá realizar cambios!',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                this.cambiarEstadoReq();
            } else {
                this.iEstadoRequisito = !this.iEstadoRequisito;
            }
        });
    }

    async cambiarEstadoReq() {
        const data = {
            iProyectoId: this.idProyecto,
            iEstadoRequisito: (this.iEstadoRequisito ? 1 : 0),
            auditoria: {
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                nombre_equipo: '',
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
                mac: '',
            },
        };
        const retorno = await this.queryInvestigacion.guardarDatosAsync({
            tipo: 'actualizar_requisitos_proyecto',
            data: data
        });
        // @ts-ignore
        if (!retorno.error) {
            this._dataService.reqCompProy = this.iEstadoRequisito;
            // console.log('enviado para guardar');
        } else {
            /*  await swal.fire({
                title: 'Error:',
                text: msj1 + ' por favor verifique.',
                type: 'error',
                confirmButtonText: 'Verificar',
            });*/
        }
    }
}

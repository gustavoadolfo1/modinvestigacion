import {Component, OnInit} from '@angular/core';
import {LocalService} from '../../../servicios/local.services';
import {QueryInvestigacionServices} from '../../../servicios/query-investigacion.services';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';

@Component({
    selector: 'app-gestion',
    templateUrl: './gestion.component.html',
    styleUrls: ['./gestion.component.scss']
})
export class GestionComponent implements OnInit {
    public nomProyecto: any;
    public idProyecto: any;
    constructor(
        private queryInvestigacionServ: QueryInvestigacionServices,
        private local: LocalService,
        private _dataService: DataServices,
        private router: Router,
    ) {
        if (!this._dataService.idProySel){
            this.router.navigate(['/investigacion/']);
        }
    }

    async ngOnInit() {
        this.idProyecto = this._dataService.idProySel;
        this.nomProyecto = this._dataService.nombProySel;
        console.log(this._dataService.nombProySel);
    }
}

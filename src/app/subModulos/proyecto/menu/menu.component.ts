import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Router} from '@angular/router';
import {INPUTMASK_VALUE_ACCESSOR} from 'primeng';

@Component({
    selector: 'ch-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    @Input() _activeIndex: number;
    itemsMenuPasos: MenuItem[];
    activeIndex = 1;

    constructor(
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.menu();
        // console.log(this._activeIndex);
        this.activeIndex = this._activeIndex;
    }

    private menu() {
        this.itemsMenuPasos = [{
            label: 'Datos Generales',
            command: (event: any) => {
                this.activeIndex = 0;
                this.router.navigate(['/proyecto/datos_proyecto']);

                // this.messageService.add({severity: 'info', summary: 'Paso 1', detail: event.item.label});
            }
        },
            {
                label: 'Hitos',
                disabled: ( this._activeIndex >= 1 ? false : true),
                command: (event: any) => {
                    this.activeIndex = 1;
                    this.router.navigate(['/proyecto/hito_proyecto']);
                    //   this.messageService.add({severity: 'info', summary: 'Paso 2', detail: event.item.label});
                }
            },
            {
                label: 'Programación Técnica Mensual',
                disabled: ( this._activeIndex >= 2 ? false : true),
                command: (event: any) => {
                    this.activeIndex = 2;
                    this.router.navigate(['/proyecto/progTec_proyecto']);
                    //  this.messageService.add({severity: 'info', summary: 'Paso 3', detail: event.item.label});
                }
            },
            {
                label: 'Programación Técnica Financiera',
                disabled: ( this._activeIndex >= 3 ? false : true),
                command: (event: any) => {
                    this.activeIndex = 3;
                    this.router.navigate(['/proyecto/indicador_hito_proyecto']);
                    //   this.messageService.add({severity: 'info', summary: 'Last Step', detail: event.item.label});
                }
            },
            {
                label: 'Presupuesto',
                disabled: ( this._activeIndex >= 4 ? false : true),
                command: (event: any) => {
                    this.activeIndex = 4;
                    this.router.navigate(['/proyecto/distribucion_presupuesto']);
                    //  this.router.navigate(['/proyecto/presupuesto']);
                    //   this.messageService.add({severity: 'info', summary: 'Last Step', detail: event.item.label});
                }
            },
            {
                label: 'Programación Monetaria',
                disabled: ( this._activeIndex >= 5 ? false : true),
                command: (event: any) => {
                    this.activeIndex = 5;
                    this.router.navigate(['/proyecto/cronograma_tecnico']);
                    //  this.router.navigate(['/proyecto/presupuesto']);
                    //   this.messageService.add({severity: 'info', summary: 'Last Step', detail: event.item.label});
                }
            },
        ];
    }
}

import {Component, Input, OnInit} from '@angular/core';
import {IMenuItem, NavigationService} from '../../../shared/services/navigation.service';

@Component({
    selector: 'app-ht-custom-nav-gull',
    templateUrl: './ht-custom-nav-gull.component.html',
    styleUrls: ['./ht-custom-nav-gull.component.scss']
})
export class HtCustomNavGullComponent implements OnInit {
    @Input() seccion: string;
    @Input() orientacion: string;


    constructor(
        public navService: NavigationService
    ) {
    }

    selectedItem: IMenuItem;

    nav: IMenuItem[];

    navSelected: IMenuItem;

    ngOnInit() {
        this.navService.menuItems$.subscribe((items) => {
            console.log(items);
            this.nav = items;

            this.nav.forEach(seccion => {
                if (seccion.name == this.seccion) {
                    this.navSelected = seccion;
                    console.log(seccion.sub);
                }
            });
            this.setActiveFlag();
        });
    }

    setActiveFlag() {
        if (window && window.location) {
            const activeRoute = window.location.hash || window.location.pathname;
            this.nav.forEach(item => {
                item.active = false;
                if (activeRoute.indexOf(item.state) !== -1) {
                    this.selectedItem = item;
                    item.active = true;
                }
                if (item.sub) {
                    item.sub.forEach(subItem => {
                        subItem.active = false;
                        if (activeRoute.indexOf(subItem.state) !== -1) {
                            console.log(subItem);
                            this.selectedItem = item;
                            subItem.active = true;
                        }
                        if (subItem.sub) {
                            subItem.sub.forEach(subChildItem => {
                                if (activeRoute.indexOf(subChildItem.state) !== -1) {
                                    console.log(item);
                                    this.selectedItem = item;
                                    item.active = true;
                                    subItem.active = true;
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}

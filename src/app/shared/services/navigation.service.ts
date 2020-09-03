import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface IMenuItem {
    id?: string;
    title?: string;
    description?: string;
    type: string;       // Possible values: link/dropDown/extLink
    name?: string;      // Used as display text for item and title for separator type
    state?: string;     // Router state
    icon?: string;      // Material icon name
    tooltip?: string;   // Tooltip text
    disabled?: boolean; // If true, item will not be appeared in sidenav.
    sub?: IChildItem[]; // Dropdown items
    badges?: IBadge[];
    active?: boolean;
}

export interface IChildItem {
    id?: string;
    parentId?: string;
    type?: string;
    name: string;       // Display text
    state?: string;     // Router state
    icon?: string;
    sub?: IChildItem[];
    active?: boolean;
}

interface IBadge {
    color: string;      // primary/accent/warn/hex color codes(#fff000)
    value: string;      // Display text
}

interface ISidebarState {
    sidenavOpen?: boolean;
    childnavOpen?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    public sidebarState: ISidebarState = {
        sidenavOpen: true,
        childnavOpen: false
    };

    constructor() {
    }

    defaultMenu: IMenuItem[] = [
        {
            name: 'Principal',
            description: 'Modulo de Investigación.',
            type: 'link',
            icon: 'i-Box-Full',
            state: '/investigacion',
        },
    ];



    // sets iconMenu as default;
    menuItems = new BehaviorSubject<IMenuItem[]>(this.defaultMenu);
    // navigation component has subscribed to this Observable
    menuItems$ = this.menuItems.asObservable();

    // You can customize this method to supply different menu for
    // different user type.
    publishNavigationChange(menuType: string) {
        // console.log(menuType);
        switch (menuType) {
            case 'oficina':
                this.menuItems.next(this.defaultMenu.concat([
                    {
                        name: 'Mantenimiento',
                        description: 'Mantenimiento de sistema',
                        type: 'dropDown',
                        icon: 'i-Data-Center',
                        state: '/investigacion/mantenimiento',
                        sub: [
                            {
                                icon: 'i-Financial',
                                name: 'Fuente de Proyecto',
                                state: '/mantenimiento/fuente_proyecto',
                                type: 'link'
                            },
                            {
                                icon: 'i-ID-Card',
                                name: 'Tipo de Proyecto',
                                state: '/mantenimiento/tipo_proyecto',
                                type: 'link'
                            },
                            {
                                icon: 'i-ID-2',
                                name: 'Estado de Proyecto',
                                state: '/mantenimiento/estado_proyecto',
                                type: 'link'
                            },
                            {
                                icon: 'i-Business-ManWoman',
                                name: 'Evaluadores de Proyecto',
                                state: '/mantenimiento/evaluadores_proyecto',
                                type: 'link'
                            },
                            {
                                icon: 'i-Conference',
                                name: 'Miembros de Proyecto',
                                state: '/mantenimiento/miembro',
                                type: 'link'
                            },
                            {
                                icon: 'i-Business-Mens',
                                name: 'Monitores de Proyecto',
                                state: '/mantenimiento/monitor',
                                type: 'link'
                            },
                            {
                                icon: 'i-Business-Mens',
                                name: 'Postulantes Registrados',
                                state: '/mantenimiento/postulantes',
                                type: 'link'
                            },
                            {
                                icon: 'i-ID-3',
                                name: 'Publicaciones',
                                state: '/mantenimiento/convocatoria',
                                type: 'link'
                            },
                        ]
                    },
                    {
                        name: 'Reportes',
                        description: 'Reportes',
                        type: 'dropDown',
                        icon: 'i-Data-Download',
                        state: '/investigacion/reportes',
                        sub: [
                            {
                                icon: 'i-File-Download',
                                name: 'Reportes',
                                state: '/reportes/reportes',
                                type: 'link'
                            },
                            {
                                icon: 'i-Mail-2',
                                name: 'Notificaciones',
                                state: '/reportes/notificaciones',
                                type: 'link'
                            },
                        ]
                    },
                ]));
                break;
            case 'user':
                // this.menuItems.next(this.userMenu);
                break;
            default:
                this.menuItems.next(this.defaultMenu);
        }
    }
}

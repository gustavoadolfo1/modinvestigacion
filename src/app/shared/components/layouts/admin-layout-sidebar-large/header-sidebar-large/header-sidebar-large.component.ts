import {Component, Input, OnInit} from '@angular/core';
import {NavigationService} from '../../../../services/navigation.service';
import {SearchService} from '../../../../services/search.service';
import {AuthService} from '../../../../services/auth.service';
import {DataServices} from '../../../../../servicios/data.services';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStoreService} from '../../../../services/local-store.service';
import {ConstantesService} from '../../../../../servicios/constantes.service';

@Component({
    selector: 'app-header-sidebar-large',
    templateUrl: './header-sidebar-large.component.html',
    styleUrls: ['./header-sidebar-large.component.scss']
})
export class HeaderSidebarLargeComponent implements OnInit {
    notifications: any[];

    ofSel = new FormControl('');
    perfilSel = new FormControl('');
    ofSeleccionadaId = null;

    dataServidor = {
        oficinas_usuario: null,
        credencial: null,
    };

    credencialActual = {
        foto_reniec: null,
        foto_estudiante: null,
        nombres_completos: null,
        nombres: null,
        apellido_paterno: null,
        foto: null,
        fotoPath: null,
    };

    suscripcionDatosMostrar: Subscription;
    suscripcionDatosMostrar2: Subscription;
    data: any = {};
    private nombres: string;
    private tipoUsuario: string;
    private tipUs: any;
    ocultar: false;

    constructor(
        private modalService: NgbModal,
        public _dataService: DataServices,
        private router: Router,
        private navService: NavigationService,
        public searchService: SearchService,
        private auth: AuthService,
        public store: LocalStoreService,
        public _constantes: ConstantesService,
    ) {
        this.notifications = [
            {
                icon: 'i-Speach-Bubble-6',
                title: 'New message',
                badge: '3',
                text: 'James: Hey! are you busy?',
                time: new Date(),
                status: 'primary',
                link: '/chat'
            },
            {
                icon: 'i-Receipt-3',
                title: 'New order received',
                badge: '$4036',
                text: '1 Headphone, 3 iPhone x',
                time: new Date('11/11/2018'),
                status: 'success',
                link: '/tables/full'
            },
            {
                icon: 'i-Empty-Box',
                title: 'Product out of stock',
                text: 'Headphone E67, R98, XL90, Q77',
                time: new Date('11/10/2018'),
                status: 'danger',
                link: '/tables/list'
            },
            {
                icon: 'i-Data-Power',
                title: 'Server up!',
                text: 'Server rebooted successfully',
                time: new Date('11/08/2018'),
                status: 'success',
                link: '/dashboard/v2'
            },
            {
                icon: 'i-Data-Block',
                title: 'Server down!',
                badge: 'Resolved',
                text: 'Region 1: Server crashed!',
                time: new Date('11/06/2018'),
                status: 'danger',
                link: '/dashboard/v3'
            }
        ];
    }

    ngOnInit() {
        // console.log(this._dataService.getOption());
        this.menuPerfil();
        let idDependencia;
        this.suscripcionDatosMostrar = interval(2000).subscribe(val => {
            if (this._dataService.getOption().oficinas_usuario) {
                // console.log(this._dataService.getOption().oficinas_usuario);
                const ofSeleccionada = this._dataService.getOption().oficinas_usuario.find(item => item.iDepenId == localStorage.getItem('ofsel'));
                this.ofSel.setValue(ofSeleccionada.iCredDepenId);
                // iDepenId
                this.menuDependencia(ofSeleccionada.iDepenId);
                idDependencia = ofSeleccionada.iDepenId;
                // tslint:disable-next-line:no-unused-expression
                this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
            }
        });
        this.suscripcionDatosMostrar2 = interval(4000).subscribe(val => {
            if (this._dataService.getOption().infoLogin) {
                const perfilSeleccionada = this._dataService.getOption().infoLogin.perfiles.find(item => item.iPerfilId == localStorage.getItem('perfilSeleccionado'));

                // console.log(perfilSeleccionada);

                this.perfilSel.setValue(perfilSeleccionada.iPerfilId);
                // tslint:disable-next-line:no-unused-expression
                this.suscripcionDatosMostrar2 && this.suscripcionDatosMostrar2.unsubscribe();
            }
        });
        // console.log(this._dataService.getOption());

/*
        this.suscripcionDatosMostrar = interval(2000).subscribe(val => {
            if (this._dataService.getOption().oficinas_usuario) {
                const ofSel = this.store.getItem('ofsel');
                console.log(ofSel);
                if (ofSel === null || !(ofSel > 0)) {
                    console.log('sin oficinas');
                    this.menuDependencia(0);
                } else {
                    const ofSeleccionada = this._dataService.getOption().oficinas_usuario.find(item => item.iDepenId === ofSel);
                    this.ofSel.setValue(ofSeleccionada.iCredDepenId);
                    // iDepenId
                    this.menuDependencia(ofSeleccionada.iDepenId);

                }
                // tslint:disable-next-line:no-unused-expression
                this.suscripcionDatosMostrar && this.suscripcionDatosMostrar.unsubscribe();
            }
        });
        */
        this.getNombres();
    }

    menuDependencia(idDependencia) {
        // this._dataService.getOption().ofSeleccionada.iDepenId
/*
        if (idDependencia == 8) {
            this.navService.publishNavigationChange('admin');
        } else {
            this.navService.publishNavigationChange('');
        }*/
    }

    menuPerfil(){

        if (this.store.getItem('perfilSeleccionado') == this._constantes.perfilesDeUsuarios.oficina) {
            this.navService.publishNavigationChange('oficina');
        } else {
            this.navService.publishNavigationChange('');
        }
    }


    cambiarDependencia($event) {
        this.menuDependencia($event.iDepenId);
        this._dataService.setOption('ofSeleccionada', $event);
        // tslint:disable-next-line:radix
        this.store.setItem('ofsel', parseInt($event.iDepenId));

        this.router.navigateByUrl('/sesion/inicio', {skipLocationChange: true}).then(
            () => this.router.navigate(['/investigacion'])
        );


        /*
                this.router.routeReuseStrategy.shouldReuseRoute = function () {
                    return false;
                };
                */
        // console.log(this._dataService.getOption());
    }


    cambiarPerfil($event) {
        /// this._dataService.setOption('ofSeleccionada', $event);
        // tslint:disable-next-line:radix
        this.store.setItem('perfilSeleccionado', parseInt($event.iPerfilId));

        this.menuPerfil();
        this.router.navigateByUrl('/sesion/inicio', {skipLocationChange: true}).then(
            () => this.router.navigate(['/investigacion'])
        );


        /*
                this.router.routeReuseStrategy.shouldReuseRoute = function () {
                    return false;
                };
                */
        // console.log(this._dataService.getOption());
    }


    toggelSidebar() {
        const state = this.navService.sidebarState;
        if (state.childnavOpen && state.sidenavOpen) {
            return state.childnavOpen = false;
        }
        if (!state.childnavOpen && state.sidenavOpen) {
            return state.sidenavOpen = false;
        }
        if (!state.sidenavOpen && !state.childnavOpen) {
            state.sidenavOpen = true;
            setTimeout(() => {
                state.childnavOpen = true;
            }, 50);
        }
    }

    signout() {
        this.auth.signout();
    }

    mostrarModal(modalCtrl) {
        // @ts-ignore
        this.modalService.open(modalCtrl, {size: 'md', backdrop: true, centered: true});
    }

    getNombres() {
        this.data = this.store.getItem('tipUs');
        if (this.data != undefined || this.data != null) {
            this.tipoUsuario = this.data['tipUsN'];
            this.tipUs = this.data['tipUs'];
        }
        this.data = this.store.getItem('userInfo');
        if (this.data != undefined || this.data != null) {
            this.nombres = this.data['grl_persona']['cPersNombre'] + ' ' + this.data['grl_persona']['cPersPaterno'];
        }
    }
}

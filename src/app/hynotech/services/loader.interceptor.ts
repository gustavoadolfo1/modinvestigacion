import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpResponse,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import { LoaderService } from './loader.service';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import swal from 'sweetalert2';
import {timeout} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];
    private requestsPostWithParams = [];
    private apiAcual = environment.urlAPI;
    private vecesFalla = 0;
    private errorTimeout = 0;

    constructor(
        private loaderService: LoaderService,
        private router: Router,
        private modalService: NgbModal,
    ) { }

    removeRequest(req: HttpRequest<any>) {
        const i = this.requests.indexOf(req);
        if (i >= 0) {
            this.requests.splice(i, 1);
        }

        const i2 = this.requestsPostWithParams.indexOf(req.url + JSON.stringify(req.body));
        if (i2 >= 0) {
            this.requestsPostWithParams.splice(i, 1);
        }

        this.loaderService.isLoading.next(this.requests.length > 0);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('inicio', req);
        console.log('inicio', req.method);
        let existe = false;
        // const pasarSinLoader = (req.url.indexOf('guardarArchivo') > 0);
        const pasarSinLoader = ['archivo'].includes(req.headers.get('TipoSolicitud'));

        this.requestsPostWithParams.filter(reqAtxt => {
            const reqT = req.url + JSON.stringify(req.body);
            if (reqT == reqAtxt){
                existe = true;
                /*
                console.log([
                    reqT,
                    reqAtxt
                ]);
                */
                return EMPTY;
            }
        });



        if (!existe && this.errorTimeout < 5) {
            if (pasarSinLoader) {
                return next.handle(req);
            }
            this.requestsPostWithParams.push(req.url + JSON.stringify(req.body));
            this.requests.push(req);

            // console.log('No of requests--->' + this.requests.length);
            this.loaderService.isLoading.next(true);
            return Observable.create(observer => {
                const subscription = next.handle(req).pipe(/*timeout(40000)*/).subscribe(
                    event => {
                        if (event instanceof HttpResponse) {

                            console.log('instancia', req);
                            console.log('instancia', req.method);
                            console.log(event);
                            console.log(event.body);
                            console.log(event.headers);
                            this.removeRequest(req);
                            observer.next(event);
                        }
                    },
                    err => {
                        console.log('error', err);
                        if (err.name && err.name == 'TimeoutError'){
                            this.errorTimeout++;
                            if (this.errorTimeout > 2){
                                if (Number(localStorage.getItem('intranet')) == 1){
                                    localStorage.setItem('intranet', '0');
                                    location.reload();
                                } else {
                                    swal.fire({
                                        title: '¿Continuar?',
                                        html: 'No se puede conectar con el servidor, por favor revise su conexion.',
                                        type: 'error',
                                        showCancelButton: true,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Reintentar',
                                        cancelButtonText: 'Cancelar'
                                    }).then((result) => {
                                        if (!result.dismiss) {
                                            location.reload();
                                        }
                                    });
                                }
                            }
                        }

                        console.log('en el error', req);
                        console.log('en el error', req.method);
                        this.removeRequest(req);
                        this.vecesFalla ++;
                        observer.error(err);
                        if ( (err.status == 401) || (this.vecesFalla > 30) ) {

                            // localStorage.clear();

                            localStorage.removeItem('ofsel');
                            localStorage.removeItem('unamToken');
                            localStorage.setItem('intranet', '0');
                            // this.router.navigateByUrl('/sessions/signin');
                            this.router.navigateByUrl('/sesion/inicio');
                            this.modalService.dismissAll();
                            console.log('ERROR DE AUTENTICACION');
                        }
                    },
                    () => {

                        console.log('completado', req);
                        console.log('completado', req.method);
                        this.removeRequest(req);
                        observer.complete();
                    },
                );
                // remove request from queue when cancelled
                // console.log(subscription);

                return () => {

                    console.log('retornar', req);
                    console.log('retornar', req.method);
                    this.removeRequest(req);
                    subscription.unsubscribe();
                };

            });
        } else {
            return EMPTY;
        }
    }
}

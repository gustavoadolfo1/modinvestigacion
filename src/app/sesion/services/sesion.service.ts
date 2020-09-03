import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LocalStoreService} from '../../shared/services/local-store.service';

@Injectable({
    providedIn: 'root'
})
export class SesionService {
    private baseUrl;
    ls = window.localStorage;
    token: any;
    httpOptions: any;

    constructor(
        private http: HttpClient,
        private store: LocalStoreService,
    ) {
        this.baseUrl = environment.urlAPI;
    }

    insertHead() {
        this.ls.getItem('unamToken');
        const data = this.store.getItem('unamToken');
        this.token = data['access_token'];
        if (data['access_token']) {
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                })
            };
        }
    }

    enviarData(path, data, method = 'post', headers = false) {
        if (method == 'post') {
            if (headers) {
                this.insertHead();
                return this.http.post(`${this.baseUrl}${path}`, data, this.httpOptions);
            } else {
                return this.http.post(`${this.baseUrl}${path}`, data);
            }
        } else {
            return this.http.get(`${this.baseUrl}${path}`, {params: data});
        }
    }


    datosTramitesServidor(data, anonimo = false, headers = true) {
        if (anonimo) {
            return this.http.post(`${this.baseUrl}/tram/dataexistenteAnonimo`, data);
        }
        if (headers) {
            this.insertHead();
            return this.http.post(`${this.baseUrl}/tram/dataexistente`, data, this.httpOptions);
        } else {
            return this.http.post(`${this.baseUrl}/tram/dataexistente`, data);
        }
    }


    async datosServidorAsync(data, anonimo = false, headers = true) {
        return await this.datosTramitesServidor(data, anonimo, headers).toPromise();
    }

    /* SECCION NUEVA DE LOGIN */
    dServidor(tipo, data, anonimo = false, headers = true) {
        if (anonimo) {
            return this.http.post(`${this.baseUrl}/grl/dataexistenteAnonimo/${tipo}`, data);
        }
        if (headers) {
            this.insertHead();
            return this.http.post(`${this.baseUrl}/grl/dataexistente/${tipo}`, data, this.httpOptions);
        } else {
            return this.http.post(`${this.baseUrl}/grl/dataexistente/${tipo}`, data);
        }
    }
    async dServidorAsync(tipo, data, anonimo = false, headers = true) {
        return await this.dServidor(tipo, data, anonimo, headers).toPromise();
    }

}

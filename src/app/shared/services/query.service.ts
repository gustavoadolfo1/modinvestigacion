import {Injectable} from '@angular/core';
import {LocalStoreService} from '../../shared/services/local-store.service';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
// import {map} from "rxjs/operators";
import {Observable} from 'rxjs';

// import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class QueryService {

    private baseUrl: string;
    private token: any;
    httpOptions: any;

    constructor(private http: HttpClient, private local: LocalStoreService) {
        this.baseUrl = environment.urlAPI;
    }

    insertHead() {
        let data = this.local.getItem('unamToken');
        this.token = data.access_token;
        if (data.access_token) {
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.token,
                }),
            };
        }
    }

    insertHeadFile() {
        let data = this.local.getItem('unamToken');
        this.token = data.access_token;
        if (data.access_token) {
            this.httpOptions = {
                headers: new HttpHeaders({
                    Authorization: 'Bearer ' + this.token,
                }),
            };
        }
    }

    getAnios() {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/getAnios`, this.httpOptions);
    }

    getPedidosPublicados(page, pageSize): Observable<any> {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/pedidosEnLinea/getPedidosPublicados/${page}/${pageSize}`, this.httpOptions);
    }

    getMisCotizaciones(year, page, pageSize): Observable<any> {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/getCotizacionesProveedor/${year}/${page}/${pageSize}`, this.httpOptions);
    }

    getDetallesPedido(pedidoId) {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/pedidosEnLinea/getDetallesPedido/${pedidoId}`, this.httpOptions);
    }

    guardarCotizacion(cotizacion) {
        this.insertHead();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/guardarCotizacion`, cotizacion, this.httpOptions);
    }

    getDetallesCotizacion(cotizaId) {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/getDetallesCotizacion/${cotizaId}`, this.httpOptions);
    }

    actualizarDetallesCotizacion(cotizacion) {
        this.insertHead();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/actualizarDetallesCotizacion`, cotizacion, this.httpOptions);
    }

    actualizarCotizacion(cotizacion) {
        this.insertHeadFile();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/actualizarCotizacion`, cotizacion, this.httpOptions);
    }

    enviarCotizacion(cotizacionId) {
        this.insertHeadFile();
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/enviarCotizacion/${cotizacionId}`, this.httpOptions);
    }

    getAnexosDetalle(anioEjec, tipoBien, tipoPedido, nroPedido, secuencia) {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/pedidosEnLinea/getAnexosDetalle/${anioEjec}/${tipoBien}/${tipoPedido}/${nroPedido}/${secuencia}`, this.httpOptions);
    }

    getArchivoServer(data) {
        this.insertHead();
        this.httpOptions.responseType = 'blob';
        return this.http.post(`${this.baseUrl}/cotizaciones/getCotizacionPDF`, data, this.httpOptions);
    }

    getInfoProveedor() {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/getInfoProveedor`, this.httpOptions);
    }

    actualizarInfoProveedor(data) {
        this.insertHeadFile();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/actualizarInfoProveedor`, data, this.httpOptions);
    }

    getAnexo7() {
        this.insertHead();
        this.httpOptions.responseType = 'blob';
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/generarAnexo7`, this.httpOptions);
    }

    consultaRUC(data) {
        // return this.http.post( `${this.baseUrl}/tre/grl_personas_searchAPI`, data );

        // return this.http.get(`http://demo.jqsystem.net/consulta_ruc_dni/consulta_servicios_api/public/api/v1/ruc/${ruc}?token=abcxyz`)

        return this.http.post(`${this.baseUrl}/pide/sunat`, data);
    }

    consultaOSCE(data) {
        return this.http.post(`${this.baseUrl}/pide/osce`, data);
    }

    consultaDNIPIDE(data) {
        return this.http.post(`${this.baseUrl}/pide/reniec`, data);
    }

    enviarRegistroProveedor(registro) {
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/registrarNuevoProveedor`, registro);
    }

    verCuadro(cuadroId) {
        this.insertHead();
        this.httpOptions.responseType = 'blob';
        return this.http.get(`${this.baseUrl}/cotizaciones/pdfGeneradoCuadro/${cuadroId}`, this.httpOptions);
    }

    cambiarPassword(data) {
        this.insertHead();
        return this.http.post(`${this.baseUrl}/grl/seguridad/cambiarPassword`, data, this.httpOptions);
    }

    obtenerTokenRecuperacion(data) {
        return this.http.post(`${this.baseUrl}/auth/forgot`, data);
    }

    obtenerValorUIT() {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/obtenerValorUIT`, this.httpOptions);
    }

    updateInfoPIDE(data) {
        this.insertHead();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/updateInfoPIDE`, data, this.httpOptions);
    }

    actualizarCotizacionYRequisitos(data){
        this.insertHeadFile();
        return this.http.post(`${this.baseUrl}/cotizaciones/proveedor/updateCotizacionYRequisitos`, data, this.httpOptions);
    }

    getIdentificacionesTipos() {
        // this.insertHead();
        return this.http.get(`${this.baseUrl}/grl/getIdentificacionesTipos`);
    }

    getDashboard() {
        this.insertHead();
        return this.http.get(`${this.baseUrl}/cotizaciones/proveedor/getDashboardCotizacionesOnline`, this.httpOptions);
    }
}

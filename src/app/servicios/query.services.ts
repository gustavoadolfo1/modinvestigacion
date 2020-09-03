import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LocalStoreService} from '../shared/services/local-store.service';
import {environment} from '../../environments/environment';
import swal from 'sweetalert2';
import {Router} from '@angular/router';
import {DataServices} from './data.services';


@Injectable({
  providedIn: 'root'
})
export class QueryServices {
  private baseUrl;
  headers: any;
  token: any;
  ls = window.localStorage;
  httpOptions: any;

  constructor(
    private http: HttpClient,
    private store: LocalStoreService,
    private _dataService: DataServices,
    private router: Router
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
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + this.token
        })
      };
    }
  }
  datosPideServidor(tipo, persona_id, data) {
    this.insertHead();

    return this.http.post(`${this.baseUrl}/pide/${tipo}/${persona_id}`, data, this.httpOptions);
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

  datosTramitesEnviarServidor(data) {
    this.insertHead();

    return this.http.post(`${this.baseUrl}/tram/guardar`, data, this.httpOptions);
  }

  async datosPideServidorAsync(tipo, persona_id, data) {
      return await this.datosPideServidor(tipo, persona_id, data).toPromise();
  }

  async datosServidorAsync(data, anonimo = false, headers = true) {
      return await this.datosTramitesServidor(data, anonimo, headers).toPromise();
  }



  async verificarSiExiste(tabla, campo, valor) {
      return await this.datosTramitesServidor({tipo: 'consulta_existencia', data: [tabla, campo, valor]}).toPromise();
  }

  async guardarDatosAsync(data) {
      const dataRetorno =  await this.datosTramitesEnviarServidor(data).toPromise();

      if (dataRetorno['error']) {
          await swal.fire({
              title: 'Error:',
              text: dataRetorno['msg'],
              type: 'error',
              confirmButtonText: 'Verificar',
          });
          // return false;
      } else {
          let timerInterval;
          swal.fire({
              title: 'Guardado Correctamente:',
              html: dataRetorno['msg'] + '<br> Se cerrara en <strong> X </strong> segundos.',
              type: 'success',
              timer: 2000,
              onBeforeOpen: () => {
                  swal.showLoading();
                  timerInterval = setInterval(() => {
                      const impr = Math.ceil((swal.getTimerLeft() / 1000));
                      swal.getContent().querySelector('strong').textContent = String(impr);
                  }, 100);
              },
              onClose: () => {
                  clearInterval(timerInterval);
              }
          })/*.then((result) => {
              if (
                  // Read more about handling dismissals
                  result.dismiss === swal.DismissReason.timer
              ) {
                  retorno = {error: false, msg: dataRetorno['msg'], };

              }
          })*/;
      }
      return dataRetorno;
  }

  async obtenerCredencial() {
      const dataAcceso = await this.datosServidorAsync({tipo: 'data_credencial', data: []}).catch(err => {
          if (err.status) {
              localStorage.removeItem('ofsel');
              localStorage.removeItem('unamToken');
              localStorage.setItem('intranet', '1');
              // this.router.navigateByUrl('sessions/signin');
              this.router.navigateByUrl('/sesion/inicio');
              return false;
          }
      });
      this._dataService.setOption('credencialActual', dataAcceso[0]);
      return true;
  }
}

export interface ConfigGuardar {
  error: string;
  msg: string;
  data: object;
}

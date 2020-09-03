import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStoreService } from './local-store.service';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl;

  headers: any;
  token: any;
  ls = window.localStorage;
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
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + this.token
        })
      };
    }

  }
  getUser(data) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }
  getProfile() {
    this.insertHead();
    return this.http.get(`${this.baseUrl}/obtenerInfoCredencial`, this.httpOptions);
  }
}

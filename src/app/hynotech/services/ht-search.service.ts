import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtSearchService {
    public abrirBusqueda: boolean;
    public controlActual: string;
    public txtBusqueda: string;

    public seleccionado: any = [];
  constructor() { }
}

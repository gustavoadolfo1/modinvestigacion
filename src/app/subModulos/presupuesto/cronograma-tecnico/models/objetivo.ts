//import {Indicador} from './indicador';


import {Actividad} from './actividad';

export class Objetivo {
    iRubroId: number;
    iProyectoId: number;
    cRubroDescripcion?: string;

    //  iObjetivoId: number;
    //  iProyectoId: number;
    //  cObjetivo?: string;
    //  iTipoObjetivoId?: number;
    // indicador: Indicador[];
    actividad: Actividad[];
}

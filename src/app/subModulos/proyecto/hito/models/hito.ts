import {IndicadorHito} from '../../hito/models/indicadorHito';

export class Hito {
    iHitoId: number;
    iProyectoId: number;
    iNumeroHito?: number;
    cHitoAnyoInicio?: string;
    cHitoMesInicio?: string;
    cHitoAnyoFin?: string;
    cHitoMesFin?: string;
    iNumeroMeses?: number;
    dtFechaInicio?: string;
    dtFechaFin?: string;
    indicadorHito: IndicadorHito[];
    cNombre: string;
}

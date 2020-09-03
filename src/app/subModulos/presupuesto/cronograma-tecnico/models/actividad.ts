import {Cronograma} from './cronograma';

export class Actividad {
    iDescripcionPresupuestoId: number;
    iRubroId?: number;
    cDetalle?: string;
    iCantidad?: number;
    nMonto?: number;
    nTotal?: number;
    iActividadId?: number;
    cActividadDescripcion?: string;
    cronograma: Cronograma[];
}


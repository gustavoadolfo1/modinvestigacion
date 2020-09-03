import {Cronograma} from './cronograma';

export class Actividad {
    iDescripcionPresupuestoId: number;
    iRubroId?: number;
    cDetalle?: string;
    iCantidad?: number;
    iUnidadMedidaId: number;
    cUnidadMedida: string;
    nMonto?: number;
    nTotal?: number;
    iActividadId?: number;
    cronograma: Cronograma[];
}

import {Cronograma} from './cronograma';

export class Actividad {
    iActividadId: number;
    iObjetivoId?: number;
    cActividadDescripcion?: string;
    iCantidad?: number;
    iUnidadMedidaId?: number;
    cUnidadMedida?: string;
    iAvanceCantidad?: number;
    iAvance?: number;
    cronograma: Cronograma[];
    mesCalGasto?: number;
    iCalendarioId?: number;
}

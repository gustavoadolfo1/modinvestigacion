import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConstantesService {
    public tipoSistemaLogin = 'perfiles'; // 'simple', 'perfiles', 'dependencias'
    public reCaptchaSiteKeyV3 = '6LcjOcEUAAAAANJJq5kE5xg0HaDvVGTLkZMz2FCo';
    public reCaptchaSiteKeyV2 = '6LcgO8EUAAAAAMXkeItNTRyXVeXEUfLZaZvzNgty';


    perfilesDeUsuarios = {
        oficina: 1025,
        parEvaluador: 1026,
        integrante: 1027,
        monitor: 1030,
        postulante: 1035
    };

    constructor() {
    }
}

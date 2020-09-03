import { Component, OnInit } from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    fileCriterio: string = environment.urlPublic + 'pdf/estudiantes.xlsx' ;
    fileCriterio1: string = environment.urlPublic + 'pdf/docentes.xlsx' ;
    fileCriterio2: string = environment.urlPublic + 'pdf/multidisciplinarios.xlsx' ;
    activeIndex: any;
  constructor() { }

  ngOnInit() {
  }

}

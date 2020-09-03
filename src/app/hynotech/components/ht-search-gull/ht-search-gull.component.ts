import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {DataLayerService} from '../../../shared/services/data-layer.service';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {HtSearchService} from '../../services/ht-search.service';
import {SharedAnimations} from '../../../shared/animations/shared-animations';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-ht-search-gull',
  templateUrl: './ht-search-gull.component.html',
  styleUrls: ['./ht-search-gull.component.scss'],

    animations: [SharedAnimations]
})
export class HtSearchGullComponent implements OnInit {
    @Input() coleccionData: any;
    @Input() campos: any;

    @Output() seleccionado = new EventEmitter<any>();

    @ViewChild('txtBusqueda', {static: true}) private txtBusqueda: ElementRef;

    // as = ['cPersDocumento', 'cPersDescripcion']

    imgsDomain = environment.urlPublic + 'fotografia/';

    page = 1;
    pageSize = 6;

    results$: Observable<any[]>;
    searchCtrl: FormControl = new FormControl();

    constructor(
        private dl: DataLayerService,
        public searchService: HtSearchService,
    ) { }

    ngOnInit() {
        this.txtBusqueda.nativeElement.focus();
        // this.searchCtrl.setValue(this.searchService.txtBusqueda, {emitEvent: true});
        // this.searchCtrl.markAllAsTouched();

        this.results$ = combineLatest(
            // this.dl.getProducts(),
            this.coleccionData,
            this.searchCtrl.valueChanges
                .pipe(startWith(''), debounceTime(200))
        )
            .pipe(map(([products, searchTerm]) => {
                console.log([products, searchTerm]);
                // @ts-ignore
                return products.filter(p => {

                    for (const campo of this.campos) {
                        if (p[campo].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
                            return true;
                        }
                    }
                    // console.log(p);
                    return false; // p.cPersDocumento.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
                });
            }));
    }


    seleccionarItem(datos) {
        this.seleccionado.next(datos);
    }

}

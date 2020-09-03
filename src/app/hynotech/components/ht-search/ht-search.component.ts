import {Component, EventEmitter, forwardRef, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {HtSearchService} from '../../services/ht-search.service';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SharedAnimations} from '../../../shared/animations/shared-animations';

@Component({
    selector: 'app-ht-search',
    templateUrl: './ht-search.component.html',
    styleUrls: ['./ht-search.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => HtSearchComponent),
            multi: true
        }
    ],
    animations: [SharedAnimations]
})
export class HtSearchComponent implements OnInit, ControlValueAccessor {
    @Input() size = 'sm';
    @Input() btnLabel = '';

    @Input() idx = '';

    @Input() formControlName;

    @Input() templateBotones: TemplateRef<any>;
    @Input() templateResultados: TemplateRef<any>;

    @Output() llamarLista = new EventEmitter<any>();


    @Input() myLabel = '';
    counter = 0;
    inputValue = '';
    isDisabled: boolean;

    onChange = (_: any) => { };
    onTouch = () => { };

    constructor(
        public searchService: HtSearchService,
    ) { }

    ngOnInit() {

    }

    onInput(value: string) {
        this.counter = value.length;
        this.inputValue = value;
        this.onTouch();
        this.onChange(this.inputValue);
        console.log('entrada');
    }

    writeValue(value: any): void {
        if (value) {
            this.inputValue = value || '';
            this.counter = value.length;
        } else {
            this.inputValue = '';
        }
        console.log('write');
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }



    verificar() {
        this.lista();
        this.searchService.abrirBusqueda = true;
        this.searchService.controlActual = this.formControlName;
    }

    lista() {
        this.llamarLista.next();
    }

}

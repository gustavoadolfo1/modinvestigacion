import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParesEvaluadoresComponent  } from './pares-evaluadores.component';

describe('ParesEvaluadoresComponent ', () => {
    let component: ParesEvaluadoresComponent;
    let fixture: ComponentFixture<ParesEvaluadoresComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ParesEvaluadoresComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParesEvaluadoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

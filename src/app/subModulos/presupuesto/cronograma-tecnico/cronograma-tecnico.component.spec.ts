import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronogramaTecnicoComponent  } from './cronograma-tecnico.component';

describe('CronogramaTecnicoComponent', () => {

    let component: CronogramaTecnicoComponent;
    let fixture: ComponentFixture<CronogramaTecnicoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CronogramaTecnicoComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CronogramaTecnicoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

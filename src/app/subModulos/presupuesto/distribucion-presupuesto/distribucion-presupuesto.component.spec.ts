import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribucionPresupuestoComponent  } from './distribucion-presupuesto.component';

describe('DistribucionPresupuestoComponent ', () => {
    let component: DistribucionPresupuestoComponent;
    let fixture: ComponentFixture<DistribucionPresupuestoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DistribucionPresupuestoComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DistribucionPresupuestoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

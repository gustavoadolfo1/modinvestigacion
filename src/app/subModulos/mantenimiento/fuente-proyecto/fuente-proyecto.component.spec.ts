import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuenteProyectoComponent } from './fuente-proyecto.component';

describe('FuenteProyectoComponent', () => {
  let component: FuenteProyectoComponent;
  let fixture: ComponentFixture<FuenteProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuenteProyectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuenteProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoProyectoComponent } from './estado-proyecto.component';

describe('EstadoProyectoComponent', () => {
  let component: EstadoProyectoComponent;
  let fixture: ComponentFixture<EstadoProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadoProyectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

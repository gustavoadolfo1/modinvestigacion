import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluadoresProyectoComponent } from './evaluadores-proyecto.component';

describe('EvaluadoresProyectoComponent', () => {
  let component: EvaluadoresProyectoComponent;
  let fixture: ComponentFixture<EvaluadoresProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluadoresProyectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluadoresProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

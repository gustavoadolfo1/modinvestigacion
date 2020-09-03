import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionTecnicaComponent } from './programacion-tecnica.component';

describe('ProgramacionTecnicaComponent', () => {
  let component: ProgramacionTecnicaComponent;
  let fixture: ComponentFixture<ProgramacionTecnicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramacionTecnicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramacionTecnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

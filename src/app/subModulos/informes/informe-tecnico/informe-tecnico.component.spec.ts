import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeTecnicoComponent } from './informe-tecnico.component';

describe('InformeTecnicoComponent', () => {
  let component: InformeTecnicoComponent;
  let fixture: ComponentFixture<InformeTecnicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeTecnicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeTecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

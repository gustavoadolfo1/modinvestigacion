import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanceTecnicoComponent } from './avance-tecnico.component';

describe('AvanceTecnicoComponent', () => {
  let component: AvanceTecnicoComponent;
  let fixture: ComponentFixture<AvanceTecnicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvanceTecnicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvanceTecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

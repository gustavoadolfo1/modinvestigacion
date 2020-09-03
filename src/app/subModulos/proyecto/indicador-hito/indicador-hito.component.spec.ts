import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorHitoComponent } from './indicador-hito.component';

describe('IndicadorHitoComponent', () => {
  let component: IndicadorHitoComponent;
  let fixture: ComponentFixture<IndicadorHitoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorHitoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorHitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeHitoComponent } from './informe-hito.component';

describe('InformeHitoComponent', () => {
  let component: InformeHitoComponent;
  let fixture: ComponentFixture<InformeHitoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeHitoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeHitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

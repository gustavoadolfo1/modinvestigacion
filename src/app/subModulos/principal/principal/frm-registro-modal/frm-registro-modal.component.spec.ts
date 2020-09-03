import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmRegistroModalComponent } from './frm-registro-modal.component';

describe('FrmRegistroModalComponent', () => {
  let component: FrmRegistroModalComponent;
  let fixture: ComponentFixture<FrmRegistroModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrmRegistroModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrmRegistroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanciableComponent } from './financiable.component';

describe('FinanciableComponent', () => {
  let component: FinanciableComponent;
  let fixture: ComponentFixture<FinanciableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanciableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanciableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

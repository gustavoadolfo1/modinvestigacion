import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HitoComponent } from './hito.component';

describe('HitoComponent', () => {
  let component: HitoComponent;
  let fixture: ComponentFixture<HitoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HitoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

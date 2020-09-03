import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoresProyectoComponent } from './monitores-proyecto.component';

describe('MonitoresProyectoComponent', () => {
  let component: MonitoresProyectoComponent;
  let fixture: ComponentFixture<MonitoresProyectoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoresProyectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoresProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

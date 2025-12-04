import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaAntecedentesComponent } from './tabla-antecedentes.component';

describe('TablaAntecedentesComponent', () => {
  let component: TablaAntecedentesComponent;
  let fixture: ComponentFixture<TablaAntecedentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaAntecedentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaAntecedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

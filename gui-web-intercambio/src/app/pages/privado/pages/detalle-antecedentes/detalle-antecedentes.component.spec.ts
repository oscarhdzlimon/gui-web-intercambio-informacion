import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAntecedentesComponent } from './detalle-antecedentes.component';

describe('DetalleAntecedentesComponent', () => {
  let component: DetalleAntecedentesComponent;
  let fixture: ComponentFixture<DetalleAntecedentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAntecedentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleAntecedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CrearCuentaComponent} from './crear-cuenta.component';

describe('CrearCuentaComponent', () => {
  let component: CrearCuentaComponent;
  let fixture: ComponentFixture<CrearCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

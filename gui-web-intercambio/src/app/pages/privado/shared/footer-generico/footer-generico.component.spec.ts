import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterGenericoComponent } from './footer-generico.component';

describe('FooterGenericoComponent', () => {
  let component: FooterGenericoComponent;
  let fixture: ComponentFixture<FooterGenericoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterGenericoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderGenericoComponent } from './header-generico.component';

describe('HeaderGenericoComponent', () => {
  let component: HeaderGenericoComponent;
  let fixture: ComponentFixture<HeaderGenericoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderGenericoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

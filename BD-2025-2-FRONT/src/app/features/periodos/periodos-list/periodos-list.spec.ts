import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodosList } from './periodos-list';

describe('PeriodosList', () => {
  let component: PeriodosList;
  let fixture: ComponentFixture<PeriodosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

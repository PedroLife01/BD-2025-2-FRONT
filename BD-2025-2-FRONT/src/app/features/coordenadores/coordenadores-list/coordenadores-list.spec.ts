import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordenadoresList } from './coordenadores-list';

describe('CoordenadoresList', () => {
  let component: CoordenadoresList;
  let fixture: ComponentFixture<CoordenadoresList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordenadoresList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordenadoresList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

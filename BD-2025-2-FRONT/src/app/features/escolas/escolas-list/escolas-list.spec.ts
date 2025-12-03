import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscolasList } from './escolas-list';

describe('EscolasList', () => {
  let component: EscolasList;
  let fixture: ComponentFixture<EscolasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscolasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscolasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

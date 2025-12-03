import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessoresList } from './professores-list';

describe('ProfessoresList', () => {
  let component: ProfessoresList;
  let fixture: ComponentFixture<ProfessoresList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessoresList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessoresList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

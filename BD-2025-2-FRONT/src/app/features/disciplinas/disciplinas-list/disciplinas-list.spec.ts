import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplinasList } from './disciplinas-list';

describe('DisciplinasList', () => {
  let component: DisciplinasList;
  let fixture: ComponentFixture<DisciplinasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplinasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisciplinasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

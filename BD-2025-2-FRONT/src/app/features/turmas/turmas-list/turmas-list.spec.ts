import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmasList } from './turmas-list';

describe('TurmasList', () => {
  let component: TurmasList;
  let fixture: ComponentFixture<TurmasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurmasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

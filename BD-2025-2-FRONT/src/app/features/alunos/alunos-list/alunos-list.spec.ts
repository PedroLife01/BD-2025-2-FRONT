import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunosList } from './alunos-list';

describe('AlunosList', () => {
  let component: AlunosList;
  let fixture: ComponentFixture<AlunosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlunosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

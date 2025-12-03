import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasList } from './notas-list';

describe('NotasList', () => {
  let component: NotasList;
  let fixture: ComponentFixture<NotasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

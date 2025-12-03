import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacoesList } from './avaliacoes-list';

describe('AvaliacoesList', () => {
  let component: AvaliacoesList;
  let fixture: ComponentFixture<AvaliacoesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvaliacoesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvaliacoesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

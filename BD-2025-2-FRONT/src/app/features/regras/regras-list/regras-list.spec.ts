import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegrasList } from './regras-list';

describe('RegrasList', () => {
  let component: RegrasList;
  let fixture: ComponentFixture<RegrasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegrasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegrasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

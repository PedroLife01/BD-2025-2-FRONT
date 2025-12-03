import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VinculosList } from './vinculos-list';

describe('VinculosList', () => {
  let component: VinculosList;
  let fixture: ComponentFixture<VinculosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VinculosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VinculosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

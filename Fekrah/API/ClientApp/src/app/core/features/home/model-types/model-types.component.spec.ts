import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelTypesComponent } from './model-types.component';

describe('ModelTypesComponent', () => {
  let component: ModelTypesComponent;
  let fixture: ComponentFixture<ModelTypesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelTypesComponent]
    });
    fixture = TestBed.createComponent(ModelTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

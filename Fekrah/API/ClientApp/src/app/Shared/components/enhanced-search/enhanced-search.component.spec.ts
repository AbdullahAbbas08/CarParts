import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedSearchComponent } from './enhanced-search.component';

describe('EnhancedSearchComponent', () => {
  let component: EnhancedSearchComponent;
  let fixture: ComponentFixture<EnhancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnhancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedStoresComponent } from './featured-stores.component';

describe('FeaturedStoresComponent', () => {
  let component: FeaturedStoresComponent;
  let fixture: ComponentFixture<FeaturedStoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedStoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeaturedStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

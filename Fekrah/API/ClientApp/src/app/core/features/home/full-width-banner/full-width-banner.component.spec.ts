import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullWidthBannerComponent } from './full-width-banner.component';

describe('FullWidthBannerComponent', () => {
  let component: FullWidthBannerComponent;
  let fixture: ComponentFixture<FullWidthBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullWidthBannerComponent]
    });
    fixture = TestBed.createComponent(FullWidthBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

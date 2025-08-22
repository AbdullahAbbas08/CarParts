import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StaticOffersService {
  private banners = [
    { imagePath: 'assets/images/variable_section/banner1.png', altText: 'First Banner',code:'main' },
    { imagePath: 'assets/images/variable_section/banner2.png', altText: 'Second Banner',code:'main2' },
    { imagePath: 'assets/images/variable_section/banner3.png', altText: 'Third Banner',code:'main3' },
    { imagePath: 'assets/images/variable_section/banner4.png', altText: 'Fourth Banner',code:'main4' }
  ];

  getBanners() {
    return this.banners;
  }

  // Add methods for add/edit/remove banners as needed
}

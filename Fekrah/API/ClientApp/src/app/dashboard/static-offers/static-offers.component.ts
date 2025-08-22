import { Component } from '@angular/core';

@Component({
  selector: 'app-static-offers',
  templateUrl: './static-offers.component.html',
  styleUrls: ['./static-offers.component.scss']
})
export class StaticOffersComponent {
  sectionBanners = [
    { code: 'main', imagePath: 'assets/images/variable_section/banner1.png', altText: 'Main Section Banner' },
    { code: 'main2', imagePath: 'assets/images/variable_section/banner2.png', altText: 'Brands Section Banner' },
    { code: 'main3', imagePath: 'assets/images/variable_section/banner3.png', altText: 'Offers Section Banner' },
    { code: 'main4', imagePath: 'assets/images/variable_section/banner4.png', altText: 'Offers Section Banner' }
  ];

  getBannerByCode(code: string) {
    return this.sectionBanners.find(b => b.code === code);
  }

  addBanner() {
    this.sectionBanners.push({ code: '', imagePath: '', altText: '' });
  }

  saveBanner(index: number) {
    // In a real app, you would persist changes to a backend or service
    // Here, changes are already reflected in the array
    alert('تم حفظ بيانات السيكشن بنجاح');
  }

  removeBanner(index: number) {
    this.sectionBanners.splice(index, 1);
  }
}
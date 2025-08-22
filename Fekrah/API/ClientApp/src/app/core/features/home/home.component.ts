import { Component, ViewChild, OnInit } from '@angular/core';
import { StaticOffersService } from '../../../dashboard/static-offers/static-offers.service';
import { CategoriesComponent } from './categories/categories.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  filtersOpened = false; // ✅ الحالة الافتراضية مقفول
  banners: any[] = [];

  @ViewChild(CategoriesComponent) categoriesComponent!: CategoriesComponent;
  constructor(private route: ActivatedRoute, private router: Router, private staticOffersService: StaticOffersService) {}
  ngOnInit() {
    this.banners = this.staticOffersService.getBanners();
  }

  getBanner(code: string) {
    return this.staticOffersService.getBanners().find(b => b.code === code);
  }
  
scrollToSection(section: string) {
  if (section === 'brands') {
    this.categoriesComponent.scrollToBrands();
  }
}


  latestParts = [
    {
      id: 11,
      name: 'موتور مساحات',
      price: 475,
      oldPrice: 550,
      discount: 15,
      condition: 'New',
      sellerName: 'محل المتانة',
      sellerId: '11',
      description: 'موتور مساحات قوي مناسب للجو المطري.',
      imageUrl: 'assets/images/image100_100.png'
    },
    {
      id: 12,
      name: 'كمبيوتر سيارة مستعمل',
      price: 2200,
      oldPrice: 2900,
      discount: 24,
      condition: 'Used',
      sellerName: 'الإلكترونيات الحديثة',
      sellerId: '12',
      description: 'كمبيوتر سيارة بحالة ممتازة مع ضمان شهر.',
      imageUrl: 'assets/images/image100_100.png'
    }
    // 🔁 أضف المزيد حسب رغبتك
  ];

  toggleFilters() {
    this.filtersOpened = !this.filtersOpened; // ✅ كل ضغطة تغير حالة الفلتر
  }



  ngAfterViewInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const sectionId = this.route.snapshot.queryParamMap.get('scrollTo');
        if (sectionId) {
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) {
              const yOffset = window.innerHeight / 2 - el.offsetHeight / 2;
              const y = el.getBoundingClientRect().top + window.scrollY - yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 300); // تأخير لضمان أن الـ DOM جاهز
        }
      });
  }

}

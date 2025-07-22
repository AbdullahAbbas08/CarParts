import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CarPart } from 'src/app/Shared/Models/car-card';
import Swiper from 'swiper';

@Component({
  selector: 'app-suggested-offers',
  templateUrl: './suggested-offers.component.html',
  styleUrls: ['./suggested-offers.component.scss']
})
export class SuggestedOffersComponent implements OnInit, AfterViewInit {

  carPartsSample: CarPart[] = [
    {
      id: '1000',
      name: 'فلتر مكيف داخلي',
      subtitle: 'فلتر مكيف داخلي أصلي وجديد',
      condition: 'جديد',
      store: { name: 'العفشة العالمية', phone: '01000000007' },
      car: { brand: 'ميتسوبيشي', model: 'كورولا', year: '2016' },
      price: 212,
      priceAfterDiscount: 159,
      discount: 25,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'كوري',
      origin: 'كوريا'
    },
    {
      id: '1001',
      name: 'بطارية فارتا',
      subtitle: 'بطارية فارتا أصلي وجديد',
      condition: 'جديد',
      store: { name: 'ورشة التبريد العالمية', phone: '01000000002' },
      car: { brand: 'نيسان', model: 'إلنترا', year: '2017' },
      price: 535,
      priceAfterDiscount: 428,
      discount: 20,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'ياباني',
      origin: 'اليابان'
    },
    {
      id: '1002',
      name: 'بطارية فارتا',
      subtitle: 'بطارية فارتا أصلي وجديد',
      condition: 'جديد',
      store: { name: 'تكييف السيارات الحديث', phone: '01000000004' },
      car: { brand: 'تويوتا', model: 'سيراتو', year: '2020' },
      price: 1541,
      priceAfterDiscount: 1232,
      discount: 20,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'صيني',
      origin: 'الصين'
    },
    {
      id: '1003',
      name: 'طرمبة بنزين',
      subtitle: 'طرمبة بنزين أصلي وجديد',
      condition: 'جديد',
      store: { name: 'قطع الغيار الممتازة', phone: '01000000006' },
      car: { brand: 'نيسان', model: 'سيراتو', year: '2012' },
      price: 1637,
      priceAfterDiscount: 1227,
      discount: 25,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'صيني',
      origin: 'الصين'
    },
    {
      id: '1001',
      name: 'بطارية فارتا',
      subtitle: 'بطارية فارتا أصلي وجديد',
      condition: 'جديد',
      store: { name: 'ورشة التبريد العالمية', phone: '01000000002' },
      car: { brand: 'نيسان', model: 'إلنترا', year: '2017' },
      price: 535,
      priceAfterDiscount: 428,
      discount: 20,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'ياباني',
      origin: 'اليابان'
    },
    {
      id: '1002',
      name: 'بطارية فارتا',
      subtitle: 'بطارية فارتا أصلي وجديد',
      condition: 'جديد',
      store: { name: 'تكييف السيارات الحديث', phone: '01000000004' },
      car: { brand: 'تويوتا', model: 'سيراتو', year: '2020' },
      price: 1541,
      priceAfterDiscount: 1232,
      discount: 20,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'صيني',
      origin: 'الصين'
    },
    {
      id: '1003',
      name: 'طرمبة بنزين',
      subtitle: 'طرمبة بنزين أصلي وجديد',
      condition: 'جديد',
      store: { name: 'قطع الغيار الممتازة', phone: '01000000006' },
      car: { brand: 'نيسان', model: 'سيراتو', year: '2012' },
      price: 1637,
      priceAfterDiscount: 1227,
      discount: 25,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'صيني',
      origin: 'الصين'
    },
    {
      id: '1004',
      name: 'فلتر هواء',
      subtitle: 'فلتر هواء أصلي وجديد',
      condition: 'جديد',
      store: { name: 'الإلكترونيات الحديثة', phone: '01000000009' },
      car: { brand: 'تويوتا', model: 'سيراتو', year: '2022' },
      price: 407,
      priceAfterDiscount: 386,
      discount: 5,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'صيني',
      origin: 'الصين'
    }
  ];
  
  
  


  ngOnInit(): void {}

  ngAfterViewInit(): void {
    new Swiper('.suggested-offers-swiper', {
      slidesPerView: 6,
      spaceBetween: 30,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 10 },
        768: { slidesPerView: 4, spaceBetween: 20 },
        1024: { slidesPerView: 5, spaceBetween: 30 }
      }
    });
  }

  trackByPartId(index: number, part: CarPart): string {
    return part?.id ?? index.toString();
  }
  
  

  onAddToCart(part: any): void {
    console.log('✅ Add to cart:', part);
  }

  onFavoriteToggled(part: any): void {
    console.log('❤️ Favorite toggled:', part);
  }
}

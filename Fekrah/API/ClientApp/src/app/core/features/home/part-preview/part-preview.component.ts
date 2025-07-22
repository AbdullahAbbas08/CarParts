import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

Swiper.use([Navigation, Pagination, Autoplay]);

interface CarPart {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  discount?: number;
  inStock: boolean;
}

@Component({
  selector: 'app-part-preview',
  templateUrl: './part-preview.component.html',
  styleUrls: ['./part-preview.component.scss']
})
export class PartPreviewComponent implements OnInit, AfterViewInit, OnDestroy {
  private swiper: Swiper | null = null;

  latestParts: any[] = [
    {
      id: 1,
      name: 'فلتر هواء عالي الأداء',
      brand: 'K&N',
      origin: 'أمريكي',
      price: 450,
      originalPrice: 520,
      image: 'assets/images/image_100_100.png',
      category: 'فلاتر',
      sellerId: 1,
      sellerName: 'مركز الهواء',
      description: 'فلتر هواء يمنح سيارتك أداءً أفضل ويوفر استهلاك الوقود بشكل ملحوظ.',
      isNew: true,
      discount: 13,
      inStock: true
    },
    {
      id: 2,
      name: 'فرامل سيراميك متقدمة',
      brand: 'Brembo',
      origin: 'إيطالي',
      price: 1200,
      originalPrice: 1450,
      image: 'assets/images/image_100_100.png',
      category: 'فرامل',
      sellerId: 2,
      sellerName: 'ورشة السلام',
      description: 'فرامل عالية الأداء توفر قوة توقف مثالية وتقليل الحرارة والضوضاء.',
      discount: 17,
      inStock: true
    },
    {
      id: 3,
      name: 'مصابيح LED للمقدمة',
      brand: 'Philips',
      origin: 'هولندي',
      price: 280,
      image: 'assets/images/image_100_100.png',
      category: 'إضاءة',
      sellerId: 3,
      sellerName: 'الإضاءة الحديثة',
      description: 'مصابيح أمامية LED بإضاءة قوية ولون أبيض نقي لعمر افتراضي طويل.',
      isNew: true,
      inStock: false
    },
    {
      id: 4,
      name: 'زيت محرك سينثتيك 5W-30',
      brand: 'Mobil 1',
      origin: 'أمريكي',
      price: 65,
      originalPrice: 80,
      image: 'assets/images/image_100_100.png',
      category: 'زيوت',
      sellerId: 4,
      sellerName: 'الزيوت الأصلية',
      description: 'زيت صناعي يضمن أداء فائق للمحرك في درجات حرارة عالية ومنخفضة.',
      discount: 19,
      inStock: true
    },
    {
      id: 5,
      name: 'إطارات ميشلان Pilot Sport',
      brand: 'Michelin',
      origin: 'فرنسي',
      price: 950,
      image: 'assets/images/image_100_100.png',
      category: 'إطارات',
      sellerId: 5,
      sellerName: 'تاير بلس',
      description: 'إطارات رياضية بمستوى تماسك عالي وثبات فائق عند السرعات العالية.',
      inStock: true
    },
    {
      id: 6,
      name: 'بطارية سيارة AGM عالية الأداء',
      brand: 'Bosch',
      origin: 'ألماني',
      price: 340,
      originalPrice: 400,
      image: 'assets/images/image_100_100.png',
      category: 'كهرباء',
      sellerId: 6,
      sellerName: 'كهرباء السيارات',
      description: 'بطارية AGM قوية تدوم طويلاً وتدعم الأنظمة الكهربائية الحديثة بكفاءة.',
      discount: 15,
      inStock: true
    }
  ];

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeSwiper();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  getWhatsappLink(partName: string): string {
    const message = `استفسار عن المنتج: ${partName}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  private initializeSwiper(): void {
    const swiperElement = document.querySelector('.part-swiper');
    if (swiperElement) {
      this.swiper = new Swiper(swiperElement as HTMLElement, {
        slidesPerView: 1,
        spaceBetween: 2,
        loop: true,
        centeredSlides: false,
        speed: 500,

        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },

        breakpoints: {
          // Mobile
          576: {
            slidesPerView: 1,
            spaceBetween: 15
          },
          // Tablet
          768: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          // Desktop
          1024: {
            slidesPerView: 3,
            spaceBetween: 25
          },
          // Large Desktop
          1400: {
            slidesPerView: 4,
            spaceBetween: 30
          }
        },

        // Touch settings
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,

        // Better performance
        watchOverflow: true,
        observer: true,
        observeParents: true
      });
    }
  }

  onPartClick(part: CarPart): void {
    console.log('Part clicked:', part);
  }

  addToCart(part: CarPart, event: Event): void {
    event.stopPropagation();
    console.log('Added to cart:', part);
  }

  addToWishlist(part: CarPart, event: Event): void {
    event.stopPropagation();
    console.log('Added to wishlist:', part);
  }

  trackByPartId(index: number, part: CarPart): number {
    return part.id;
  }
}

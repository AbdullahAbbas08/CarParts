import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Configure Swiper to use modules
Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-featured-sellers',
  templateUrl: './featured-sellers.component.html',
  styleUrls: ['./featured-sellers.component.scss']
})
export class FeaturedSellersComponent implements OnInit, AfterViewInit, OnDestroy {

  private swiper: Swiper | null = null;

  sellers = [
    {
      id: 1,
      name: 'مؤسسة البطاريات',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'القاهرة',
      category: 'إكسسوارات',
      isTrusted: true
    },
    {
      id: 2,
      name: 'مركز الفلاتر الأصلي',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'الإسكندرية',
      category: 'فلتر هواء',
      isTrusted: false
    },
    {
      id: 3,
      name: 'مركز الإطارات المتخصص',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'الجيزة',
      category: 'الفلاتر',
      isTrusted: true
    },
    {
      id: 4,
      name: 'مؤسسة الزيوت الأصلية',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'القاهرة',
      category: 'زيوت المحرك',
      isTrusted: false
    },
    {
      id: 5,
      name: 'مركز الفرامل والتعليق',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'الإسكندرية',
      category: 'الفرامل',
      isTrusted: false
    },
    {
      id: 6,
      name: 'مؤسسة قطع الغيار المستوردة',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'المنصورة',
      category: 'كهرباء السيارة',
      isTrusted: true
    },
    {
      id: 7,
      name: ' مركز الكهرباء والإلكترونيات',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'الجيزة',
      category: 'إلكترونيات السيارة',
      isTrusted: false
    },
    {
      id: 8,
      name: 'مؤسسة الشاحن التوربيني',
      imageUrl: 'assets/images/image_100_100.png',
      location: 'طنطا',
      category: 'بطاريات',
      isTrusted: true
    }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeSwiper();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  private initializeSwiper(): void {
    try {
      const swiperElement = this.elementRef.nativeElement.querySelector('.featured-sellers-swiper');

      if (!swiperElement) {
        console.warn('Swiper container not found');
        return;
      }

      this.swiper = new Swiper(swiperElement, {
        slidesPerView: 1,
        spaceBetween: 15,
        loop: this.sellers.length > 3,
        centeredSlides: false,
        grabCursor: true,

        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },

        speed: 600,
        effect: 'slide',

        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,

        breakpoints: {
          320: { slidesPerView: 1, spaceBetween: 10 },
          480: { slidesPerView: 1.5, spaceBetween: 15 },
          640: { slidesPerView: 2.2, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1200: { slidesPerView: 5, spaceBetween: 25 },
          1400: { slidesPerView: 6, spaceBetween: 30 }
        },

        a11y: {
          enabled: true,
          prevSlideMessage: 'الشريحة السابقة',
          nextSlideMessage: 'الشريحة التالية',
          firstSlideMessage: 'هذه هي الشريحة الأولى',
          lastSlideMessage: 'هذه هي الشريحة الأخيرة',
        },

        keyboard: {
          enabled: true,
          onlyInViewport: false,
        },

        mousewheel: {
          enabled: false,
        },

        on: {
          init: () => {
            console.log('Swiper initialized successfully');
          },
          slideChange: () => {},
          touchStart: () => {
            this.swiper?.autoplay?.stop();
          },
          touchEnd: () => {
            setTimeout(() => {
              this.swiper?.autoplay?.start();
            }, 2000);
          }
        }
      });

      this.handleWindowResize();

    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }

  private handleWindowResize(): void {
    let resizeTimer: any;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.swiper?.update();
      }, 250);
    });
  }

  public goToSlide(index: number): void {
    this.swiper?.slideTo(index);
  }

  public nextSlide(): void {
    this.swiper?.slideNext();
  }

  public prevSlide(): void {
    this.swiper?.slidePrev();
  }

  public toggleAutoplay(): void {
    if (this.swiper?.autoplay) {
      if (this.swiper.autoplay.running) {
        this.swiper.autoplay.stop();
      } else {
        this.swiper.autoplay.start();
      }
    }
  }

  public onSellerClick(seller: any): void {
    console.log('Seller clicked:', seller);
  }

  public onViewSeller(seller: any, event: Event): void {
    event.stopPropagation();
    console.log('View seller:', seller);
  }

  public onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-store.png';
  }

  public get isSwiperReady(): boolean {
    return this.swiper !== null;
  }

  public get currentSlideIndex(): number {
    return this.swiper?.activeIndex || 0;
  }

  public get totalSlides(): number {
    return this.sellers.length;
  }
}

import {
  AfterViewInit,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  TrackByFunction,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { SwaggerClient, OfferDTO, PartDTO, DataSourceResultOfOfferDTO, PartConditionEnum, PartQualityEnum, PartTypeEnum } from '../../../../Shared/Services/Swagger/SwaggerClient.service';

// Simplified Car Part Offer Interface
export interface CarPartOffer {
  id: number;
  partId: number;
  partName: string;
  partDescription: string;
  originalPrice: number;
  finalPrice: number;
  discountRate?: number;
  partCondition: PartConditionEnum;
  conditionName: string;
  images: string[]; // مصفوفة الصور المتعددة
  quality: PartQualityEnum;
  qualityName: string;
  partType: PartTypeEnum;
  partTypeName: string;
  isDelivery: boolean;
  isFavorite: boolean;
  isSold: boolean;
  count: number;
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent implements OnInit, AfterViewInit, OnDestroy {
  carPartOffers: CarPartOffer[] = [];
  private intersectionObserver?: IntersectionObserver;
  private swipers: Swiper[] = [];

  isLoading = true;
  wishlist: number[] = []; // قائمة المفضلة
  cart: number[] = []; // قائمة السلة

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private swaggerClient: SwaggerClient
  ) { }

  ngOnInit(): void {
    this.loadCarPartOffers();
    this.loadWishlist();
    this.loadCart();
    this.setupIntersectionObserver();
  }

  ngAfterViewInit(): void {
    // Initialize main offers swiper
    setTimeout(() => {
      this.initializeOffersSwipers();
      this.initializeImageSwipers();
    }, 100);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  trackByOfferId: TrackByFunction<CarPartOffer> = (index: number, offer: CarPartOffer) => offer.id;

  private loadCarPartOffers(): void {
    // Simplified sample data
    this.carPartOffers = [
      {
        id: 1,
        partId: 101,
        partName: 'مساعد أمامي أصلي KYB',
        partDescription: 'مساعد أمامي عالي الجودة لامتصاص الصدمات وتوفير قيادة مريحة',
        originalPrice: 1500,
        finalPrice: 1200,
        discountRate: 20,
        partCondition: PartConditionEnum.New,
        conditionName: 'جديد',
        images: [
          'assets/images/variable_section/banner1.png',
          'assets/images/variable_section/banner2.png',
          'assets/images/variable_section/banner3.png'
        ],
        quality: PartQualityEnum.FirstSort,
        qualityName: 'الدرجة الأولى',
        partType: PartTypeEnum.Original,
        partTypeName: 'أصلي',
        isDelivery: true,
        isFavorite: false,
        isSold: false,
        count: 5
      },
      {
        id: 2,
        partId: 102,
        partName: 'طقم فحمات فرامل سيراميك',
        partDescription: 'فحمات فرامل سيراميك عالية الأداء لفرملة قوية وآمنة',
        originalPrice: 600,
        finalPrice: 450,
        discountRate: 25,
        partCondition: PartConditionEnum.New,
        conditionName: 'جديد',
       images: [
          'assets/images/variable_section/banner1.png',
          'assets/images/variable_section/banner2.png',
          'assets/images/variable_section/banner3.png'
        ],
        quality: PartQualityEnum.FirstSort,
        qualityName: 'الدرجة الأولى',
        partType: PartTypeEnum.Original,
        partTypeName: 'أصلي',
        isDelivery: true,
        isFavorite: true,
        isSold: false,
        count: 12
      },
      {
        id: 3,
        partId: 103,
        partName: 'فلتر زيت المحرك Mann-Filter',
        partDescription: 'فلتر زيت عالي الكفاءة للحفاظ على نظافة زيت المحرك',
        originalPrice: 120,
        finalPrice: 95,
        discountRate: 21,
        partCondition: PartConditionEnum.New,
        conditionName: 'جديد',
        images: [
          'assets/images/variable_section/banner1.png',
          'assets/images/variable_section/banner2.png',
          'assets/images/variable_section/banner3.png'
        ],
        quality: PartQualityEnum.FirstSort,
        qualityName: 'الدرجة الأولى',
        partType: PartTypeEnum.Original,
        partTypeName: 'أصلي',
        isDelivery: false,
        isFavorite: false,
        isSold: false,
        count: 0
      },
      {
        id: 4,
        partId: 104,
        partName: 'مصباح أمامي LED فيليبس',
        partDescription: 'مصباح أمامي LED عالي الكفاءة يوفر إضاءة قوية وواضحة',
        originalPrice: 1200,
        finalPrice: 950,
        discountRate: 21,
        partCondition: PartConditionEnum.Used,
        conditionName: 'مستعمل',
        images: [
          'assets/images/variable_section/banner1.png',
          'assets/images/variable_section/banner2.png',
          'assets/images/variable_section/banner3.png'
        ],
        quality: PartQualityEnum.FirstSort,
        qualityName: 'الدرجة الأولى',
        partType: PartTypeEnum.Original,
        partTypeName: 'أصلي',
        isDelivery: true,
        isFavorite: false,
        isSold: false,
        count: 3
      }
    ];
    
    // Set loading to false after data is loaded
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private setupIntersectionObserver(): void {
    // Removed intersection observer for animations
  }

  private initializeOffersSwipers(): void {
    const offersSwiper = new Swiper('.offers-swiper', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 20,
      slidesPerGroup: 1,
      loop: false,
      centeredSlides: false,
      grabCursor: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.offers-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.offers-button-next',
        prevEl: '.offers-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          spaceBetween: 15,
        },
        480: {
          slidesPerView: 1.5,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 2.5,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3.5,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 4.5,
          spaceBetween: 25,
        },
      }
    });
    
    this.swipers.push(offersSwiper);
  }

  private initializeImageSwipers(): void {
    const imageSwipers = document.querySelectorAll('.image-swiper');
    
    imageSwipers.forEach((swiperEl, index) => {
      const imageSwiper = new Swiper(swiperEl as HTMLElement, {
        modules: [Navigation, Pagination],
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: swiperEl.querySelector('.swiper-button-next') as HTMLElement,
          prevEl: swiperEl.querySelector('.swiper-button-prev') as HTMLElement,
        },
        pagination: {
          el: swiperEl.querySelector('.swiper-pagination') as HTMLElement,
          clickable: true,
        },
      });
      
      this.swipers.push(imageSwiper);
    });
  }

  // --- Action Methods ---

  viewPartDetails(offer: CarPartOffer): void {
    this.router.navigate(['/parts', offer.partId]);
  }

  toggleWishlist(offer: CarPartOffer, event: Event): void {
    event.stopPropagation();
    
    const index = this.wishlist.indexOf(offer.partId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      offer.isFavorite = false;
    } else {
      this.wishlist.push(offer.partId);
      offer.isFavorite = true;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }
    
    this.showToast(offer.isFavorite ? 'تم إضافة القطعة للمفضلة' : 'تم إزالة القطعة من المفضلة', 'success');
    this.cdr.detectChanges();
  }

  addToCart(offer: CarPartOffer, event: Event): void {
    event.stopPropagation();
    
    if (offer.isSold || offer.count === 0) {
      this.showToast('هذه القطعة غير متوفرة حالياً', 'error');
      return;
    }

    const cartIndex = this.cart.indexOf(offer.partId);
    if (cartIndex === -1) {
      this.cart.push(offer.partId);
      
      if (typeof localStorage !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push({
          partId: offer.partId,
          partName: offer.partName,
          price: offer.finalPrice,
          image: offer.images[0],
          quantity: 1
        });
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      
      this.showToast('تم إضافة القطعة للسلة بنجاح', 'success');
    } else {
      this.showToast('هذه القطعة موجودة بالفعل في السلة', 'warning');
    }
    
    this.cdr.detectChanges();
  }

  // --- Helper Methods ---

  private loadWishlist(): void {
    if (typeof localStorage !== 'undefined') {
      this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      // تحديث حالة المفضلة للعروض
      this.carPartOffers.forEach(offer => {
        offer.isFavorite = this.wishlist.includes(offer.partId);
      });
    }
  }

  private loadCart(): void {
    if (typeof localStorage !== 'undefined') {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cart = cartData.map((item: any) => item.partId);
    }
  }

  isInWishlist(partId: number): boolean {
    return this.wishlist.includes(partId);
  }

  isInCart(partId: number): boolean {
    return this.cart.includes(partId);
  }

  getDiscountPercentage(offer: CarPartOffer): number {
    if (!offer.discountRate) {
      return Math.round(((offer.originalPrice - offer.finalPrice) / offer.originalPrice) * 100);
    }
    return offer.discountRate;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    const colors = {
      success: '#10b981',
      error: '#dc2626',
      warning: '#f59e0b'
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, ${colors[type]}, ${this.adjustColor(colors[type], 40)});
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      animation: toast-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 400px;
      text-align: center;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.5s forwards';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  private adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, c => ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
  }

  private cleanup(): void {
    // Destroy all swipers
    this.swipers.forEach(swiper => {
      if (swiper && !swiper.destroyed) {
        swiper.destroy(true, true);
      }
    });
    this.swipers = [];
    
    this.intersectionObserver?.disconnect();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-car-part.png';
    img.alt = 'صورة غير متوفرة';
  }
}

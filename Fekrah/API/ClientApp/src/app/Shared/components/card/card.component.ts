import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';

interface CarPart {
  id: string;
  name: string;
  subtitle: string;
  condition: string;
  images?: string[]; // ⬅️ جديد للصور المتعددة
  store: {
    name: string;
    phone: string;
  };
  car: {
    brand: string;
    model: string;
    year: string;
  };
  price: number;
  priceAfterDiscount: number;
  discount: number;
  isFavorite: boolean;
  hasDelivery: boolean;
  grade: string;
  origin?: string; // ⬅️ جديد
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() part!: CarPart;
  @Output() favoriteToggled = new EventEmitter<CarPart>();
  @Output() addToCart = new EventEmitter<CarPart>();

  // Slider properties
  currentSlide = 0;
  autoSlideInterval: any;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeSlider();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  initializeSlider(): void {
    // Add event listeners for slider navigation
    setTimeout(() => {
      const dots = this.elementRef.nativeElement.querySelectorAll('.dot');
      const prevBtn = this.elementRef.nativeElement.querySelector('.slider-arrow.prev');
      const nextBtn = this.elementRef.nativeElement.querySelector('.slider-arrow.next');

      dots.forEach((dot: HTMLElement, index: number) => {
        this.renderer.listen(dot, 'click', () => this.goToSlide(index));
      });

      if (prevBtn) {
        this.renderer.listen(prevBtn, 'click', () => this.previousSlide());
      }

      if (nextBtn) {
        this.renderer.listen(nextBtn, 'click', () => this.nextSlide());
      }
    });
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
    this.updateSlider();
    this.restartAutoSlide();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % 3;
    this.updateSlider();
    this.restartAutoSlide();
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? 2 : this.currentSlide - 1;
    this.updateSlider();
    this.restartAutoSlide();
  }

  private updateSlider(): void {
    const slides = this.elementRef.nativeElement.querySelectorAll('.slide');
    const dots = this.elementRef.nativeElement.querySelectorAll('.dot');

    slides.forEach((slide: HTMLElement, index: number) => {
      if (index === this.currentSlide) {
        this.renderer.addClass(slide, 'active');
      } else {
        this.renderer.removeClass(slide, 'active');
      }
    });

    dots.forEach((dot: HTMLElement, index: number) => {
      if (index === this.currentSlide) {
        this.renderer.addClass(dot, 'active');
      } else {
        this.renderer.removeClass(dot, 'active');
      }
    });
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000); // Change slide every 4 seconds
  }

  private restartAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.startAutoSlide();
  }

  samplePart: CarPart = {
    id: 'part123',
    name: 'فلتر زيت محرك أصلي',
    subtitle: 'قطعة غيار أصلية',
    condition: 'جديد',
    store: {
      name: 'متجر السيارات الذهبي',
      phone: '201234567890'
    },
    car: {
      brand: 'تويوتا',
      model: 'كامري',
      year: '2020'
    },
    price: 1000,
    priceAfterDiscount: 750,
    discount: 25,
    isFavorite: false,
    hasDelivery: true,
    grade: 'فرز أول',
    origin: 'اليابان',
  };
  

  formatPrice(price: number): string {
    if (!price) return '0';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  onAdd(part: CarPart): void {
    this.addToCart.emit(part);
    this.showNotification(`تمت إضافة ${part.name} إلى السلة`);
  }

  toggleFavorite(part: CarPart): void {
    part.isFavorite = !part.isFavorite;
    this.favoriteToggled.emit(part);

    const message = part.isFavorite
      ? `تمت إضافة ${part.name} إلى المفضلة`
      : `تم حذف ${part.name} من المفضلة`;

    this.showNotification(message);
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    });
  }

  onWhatsAppClick(part: CarPart): void {
    const message = encodeURIComponent(
      `مرحباً، أريد الاستفسار عن قطعة الغيار:\n${part.name}\n` +
      `للسيارة: ${part.car.brand} ${part.car.model} ${part.car.year}\n` +
      `السعر: ${this.formatPrice(part.priceAfterDiscount || part.price)}`
    );
    window.open(`https://wa.me/${part.store.phone}?text=${message}`, '_blank');
  }

  getDiscountClass(discount: number): string {
    if (!discount) return 'bg-low';
    if (discount >= 30) return 'bg-high';
    if (discount >= 15) return 'bg-medium';
    return 'bg-low';
  }

  
}

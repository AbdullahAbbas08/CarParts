// featured-stores.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { StoresService } from 'src/app/Shared/Services/stores.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swiper from 'swiper';

export interface Seller {
  id: number;
  name: string;
  imageUrl: string;
  location: string;
  category: string;
  isTrusted: boolean;
  rating?: number;
  reviewsCount?: number;
}

@Component({
  selector: 'app-featured-stores',
  templateUrl: './featured-stores.component.html',
  styleUrls: ['./featured-stores.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedStoresComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  private sellersSubject = new BehaviorSubject<Seller[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  sellers$: Observable<Seller[]> = this.sellersSubject.asObservable();
  isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  swiper!: Swiper;
  showViewMore = false;
  private swiperInitialized = false;

  // Pre-generate star arrays to avoid template function calls
  readonly starArray = [1, 2, 3, 4, 5];

  constructor(
    private storesService: StoresService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeaturedStores();
  }

  ngAfterViewInit(): void {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      this.initializeSwiper();
    });
  }


  loadFeaturedStores(): void {
    this.loadingSubject.next(true);

    this.storesService.getFeaturedStores(8)
      .pipe(
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (stores: any[]) => {
          const sellers = stores.map(store => ({
            id: store.id,
            name: store.shopName,
            imageUrl: store.imageUrl || 'assets/images/default-store-logo.png',
            location: store.location,
            category: store.arabicSpecialties?.[0] || 'قطع غيار',
            isTrusted: store.isVerified || true,
            rating: store.rating,
            reviewsCount: store.reviewsCount
          }));
           console.log(sellers)
          this.sellersSubject.next(sellers);
          this.showViewMore = sellers.length >= 6;

          // Update swiper after data is loaded
          if (this.swiperInitialized) {
            setTimeout(() => this.swiper?.update(), 50);
          } else {
            setTimeout(() => this.initializeSwiper(), 100);
          }

          this.cdr.markForCheck();
        },
        error: (error) => {
          this.sellersSubject.next([]);
          this.cdr.markForCheck();
        }
      });
  }

  initializeSwiper(): void {
    if (!this.swiperContainer?.nativeElement || this.swiperInitialized) return;

    try {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: false,
        loop: false,
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
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          320: {
            slidesPerView: 1.2,
            spaceBetween: 15
          },
          480: {
            slidesPerView: 1.5,
            spaceBetween: 15
          },
          768: {
            slidesPerView: 2.5,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 3.5,
            spaceBetween: 20
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 25
          }
        },
        on: {
          init: () => {
            this.swiperInitialized = true;
            console.log('Swiper initialized');
          }
        }
      });
    } catch (error) {
      console.error('Error initializing swiper:', error);
    }
  }

  // Optimized trackBy function for sellers
  trackBySellerId = (index: number, seller: Seller): number => seller.id;

  // Optimized trackBy function for stars
  trackByIndex = (index: number): number => index;

  // Pre-bound methods to avoid template function calls
  onImageError = (event: Event): void => {
    const target = event.target as HTMLImageElement;
    if (target.src !== 'assets/images/default-store-logo.png') {
      target.src = 'assets/images/default-store-logo.png';
    }
  };

  viewAllStores = (): void => {
    this.router.navigate(['seller/all-store'], {
      queryParams: { featured: true }
    });
  };

  viewStoresByCategory = (category: string): void => {
    this.router.navigate(['/stores'], {
      queryParams: { category: category }
    });
  };

  viewStore = (sellerId: number): void => {
    this.router.navigate(['/stores', sellerId]);
  };

  // Helper method to get star class
  getStarClass(star: number, rating: number): string {
    return star <= rating ? 'fas fa-star active' : 'fas fa-star';
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiperInitialized = false;
    }
    this.sellersSubject.complete();
    this.loadingSubject.complete();
  }
}

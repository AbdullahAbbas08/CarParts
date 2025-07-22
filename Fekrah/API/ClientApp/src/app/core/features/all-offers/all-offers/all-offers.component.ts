// all-offers.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TrackByFunction
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Filter key type definition
type FilterKey = 'brands' | 'categories' | 'conditions' | 'locations';

export interface Offer {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  condition: 'New' | 'Used' | 'Refurbished';
  sellerName: string;
  sellerId: number;
  description: string;
  imageUrl: string;
  category: string;
  categoryId: number;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  inStock: boolean;
  fastDelivery?: boolean;
  location?: string;
  featured?: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-all-offers',
  templateUrl: './all-offers.component.html',
  styleUrls: ['./all-offers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllOffersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // UI State
  showSidebar = false;
  searchText = '';
  suggestions: string[] = [];
  searchFocused = false;
  isLoading$ = new BehaviorSubject<boolean>(true);

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  itemsPerPageOptions = [12, 24, 36, 48];

  // Data
  allOffers: Offer[] = [];
  filteredOffers: Offer[] = [];
  displayOffers: Offer[] = [];

  // Sorting
  sortBy: 'latest' | 'price-low' | 'price-high' | 'discount' | 'rating' = 'latest';

  // Filters
  activeFilterSection: string | null = null;
  selectedFilters: {
    brands: string[];
    categories: string[];
    conditions: string[];
    locations: string[];
    priceRange: {
      min: number | null;
      max: number | null;
    };
  } = {
    brands: [],
    categories: [],
    conditions: [],
    locations: [],
    priceRange: { min: null, max: null }
  };

  // Available filter options
  availableBrands = ['هونداي', 'نيسان', 'تويوتا', 'BMW', 'مرسيدس', 'أودي', 'فولكس فاجن', 'كيا', 'شيفروليه', 'فورد'];
  availableCategories = ['إضاءة', 'تبريد', 'وقود', 'تكييف', 'زيوت', 'تعليق', 'إلكترونيات', 'فرامل', 'إطارات', 'عادم'];
  availableConditions = ['جديد', 'مستعمل', 'مجدد'];
  availableLocations = ['القاهرة', 'الجيزة', 'الإسكندرية', 'شبرا الخيمة', 'المنصورة', 'طنطا'];

  // Filter sections configuration
  filterSections = [
    { key: 'brands', title: 'العلامة التجارية', icon: 'fa-car' },
    { key: 'categories', title: 'الفئة', icon: 'fa-list' },
    { key: 'conditions', title: 'الحالة', icon: 'fa-check-circle' },
    { key: 'locations', title: 'الموقع', icon: 'fa-map-marker-alt' },
    { key: 'price', title: 'نطاق السعر', icon: 'fa-tag' }
  ];

  // Add Math reference for template
  Math = Math;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializePriceRange();
    this.loadAllOffers();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('sidebar-open');
  }

  // TrackBy function for ngFor optimization
  trackByOfferIdFn: TrackByFunction<Offer> = (index: number, offer: Offer) => offer.id;

  private initializePriceRange(): void {
    this.selectedFilters.priceRange.min = 0;
    this.selectedFilters.priceRange.max = 5000;
  }

  private handleRouteParams(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['page']) {
        this.currentPage = parseInt(params['page']) || 1;
      }
    });
  }

  private loadAllOffers(): void {
    this.isLoading$.next(true);

    // Simulate API call with delay
    setTimeout(() => {
      this.allOffers = this.generateMockOffers();
      this.applyFilters();
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1000);
  }

  private generateMockOffers(): Offer[] {
    const storeNames = [
      'متجر قطع الغيار المتقدم', 'الورشة الذهبية', 'مركز السيارات الحديث',
      'متجر الجودة العالية', 'الخبراء للسيارات', 'متجر التميز',
      'مركز الصيانة الشامل', 'متجر الثقة', 'الورشة الذكية', 'متجر السرعة'
    ];

    const productNames = [
      'كشاف أمامي LED', 'ردياتير أصلي', 'طرمبة بنزين', 'كمبروسر تكييف', 'زيت محرك',
      'مساعدين أمامي', 'كمبيوتر سيارة', 'فرامل قرصية', 'إطار راديال', 'عادم رياضي',
      'بطارية سيارة', 'مروحة تبريد', 'فلتر هواء', 'شمعات إشعال', 'حساس أكسجين',
      'طقم توقيت', 'جنط أصلي', 'مرايا جانبية', 'كشافات ضباب', 'سير تايمنج'
    ];

    const conditions: Array<'New' | 'Used' | 'Refurbished'> = ['New', 'Used', 'Refurbished'];

    return Array.from({ length: 150 }, (_, index) => {
      const basePrice = Math.floor(Math.random() * 4000) + 150;
      const discount = Math.random() > 0.4 ? Math.floor(Math.random() * 35) + 5 : undefined;
      const oldPrice = discount ? Math.floor(basePrice / (1 - discount / 100)) : undefined;
      const category = this.availableCategories[Math.floor(Math.random() * this.availableCategories.length)];
      const brand = this.availableBrands[Math.floor(Math.random() * this.availableBrands.length)];
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const location = this.availableLocations[Math.floor(Math.random() * this.availableLocations.length)];
      const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];

      return {
        id: index + 1,
        name: `${productName} ${brand}`,
        price: basePrice,
        oldPrice,
        discount,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        sellerName: storeName,
        sellerId: Math.floor(Math.random() * 10) + 1,
        description: `${productName} أصلي من ${brand} عالي الجودة مع ضمان الجودة والأداء المثالي لجميع أنواع السيارات`,
        imageUrl: 'assets/images/image_100_100.png',
        category: category,
        categoryId: this.availableCategories.indexOf(category) + 1,
        brand: brand,
        rating: Math.random() * 2 + 3,
        reviewsCount: Math.floor(Math.random() * 200) + 5,
        inStock: Math.random() > 0.15,
        fastDelivery: Math.random() > 0.4,
        location: location,
        featured: Math.random() > 0.85,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      };
    });
  }

  // Search functionality
  clearSearch(): void {
    this.searchText = '';
    this.suggestions = [];
    this.applyFilters();
  }

  onSearch(event: any): void {
    const text = event.target.value.toLowerCase().trim();

    if (!text) {
      this.suggestions = [];
    } else {
      // Generate suggestions
      this.suggestions = this.allOffers
        .filter(offer =>
          offer.name.toLowerCase().includes(text) ||
          offer.brand?.toLowerCase().includes(text) ||
          offer.category.toLowerCase().includes(text)
        )
        .map(offer => offer.name)
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .slice(0, 5);
    }

    // Apply filters with search
    this.applyFilters();
  }

  selectSuggestion(suggestion: string): void {
    this.searchText = suggestion;
    this.suggestions = [];
    this.searchFocused = false;
    this.applyFilters();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    // Handle Enter key
    if (event.key === 'Enter' && this.suggestions.length > 0) {
      this.selectSuggestion(this.suggestions[0]);
      event.preventDefault();
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      this.suggestions = [];
      this.searchFocused = false;
      (event.target as HTMLInputElement).blur();
    }
  }

  // Sidebar functionality
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;

    // Add body class to prevent scrolling when sidebar is open
    if (this.showSidebar) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    document.body.classList.remove('sidebar-open');
  }

  // Filter functionality
  toggleFilterSection(sectionKey: string): void {
    this.activeFilterSection = this.activeFilterSection === sectionKey ? null : sectionKey;
  }

  toggleFilter(filterType: FilterKey, value: string): void {
    const currentFilters = this.selectedFilters[filterType];
    const index = currentFilters.indexOf(value);

    if (index > -1) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(value);
    }

    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    const { brands, categories, conditions, locations, priceRange } = this.selectedFilters;
    let count = brands.length + categories.length + conditions.length + locations.length;

    if (priceRange.min !== null && priceRange.min > 0) count++;
    if (priceRange.max !== null && priceRange.max < 5000) count++;
    if (this.searchText.trim()) count++; // Add search as a filter

    return count;
  }

  applyFilters(): void {
    let filtered = [...this.allOffers];

    // Apply search filter first
    if (this.searchText.trim()) {
      const searchText = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(offer =>
        offer.name.toLowerCase().includes(searchText) ||
        offer.description.toLowerCase().includes(searchText) ||
        offer.brand?.toLowerCase().includes(searchText) ||
        offer.category.toLowerCase().includes(searchText) ||
        offer.sellerName.toLowerCase().includes(searchText)
      );
    }

    // Apply other filters
    filtered = filtered.filter(offer => {
      const matchesBrand = this.selectedFilters.brands.length === 0 ||
                          this.selectedFilters.brands.includes(offer.brand || '');
      const matchesCategory = this.selectedFilters.categories.length === 0 ||
                             this.selectedFilters.categories.includes(offer.category);
      const matchesCondition = this.selectedFilters.conditions.length === 0 ||
                              this.selectedFilters.conditions.includes(this.getConditionInArabic(offer.condition));
      const matchesLocation = this.selectedFilters.locations.length === 0 ||
                             this.selectedFilters.locations.includes(offer.location || '');
      const matchesMinPrice = this.selectedFilters.priceRange.min == null ||
                             offer.price >= this.selectedFilters.priceRange.min;
      const matchesMaxPrice = this.selectedFilters.priceRange.max == null ||
                             offer.price <= this.selectedFilters.priceRange.max;

      return matchesBrand && matchesCategory && matchesCondition &&
             matchesLocation && matchesMinPrice && matchesMaxPrice;
    });

    // Apply sorting
    this.applySorting(filtered);

    this.filteredOffers = filtered;
    this.currentPage = 1;
    this.updateDisplayedOffers();
  }

  private applySorting(offers: Offer[]): void {
    switch (this.sortBy) {
      case 'latest':
        offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        offers.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        offers.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        offers.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'rating':
        offers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  }

  clearAllFilters(): void {
    this.selectedFilters = {
      brands: [],
      categories: [],
      conditions: [],
      locations: [],
      priceRange: { min: 0, max: 5000 }
    };

    this.searchText = '';
    this.suggestions = [];
    this.applyFilters();
    this.closeSidebar();
  }

  // Sorting
  onSortChange(event: any): void {
    this.sortBy = event?.target?.value as any;
    this.applyFilters();
  }

  // Pagination
  updateDisplayedOffers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayOffers = this.filteredOffers.slice(startIndex, endIndex);
  }

  changeItemsPerPage(newSize: number): void {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.updateDisplayedOffers();
  }

  nextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateDisplayedOffers();
      this.scrollToTop();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedOffers();
      this.scrollToTop();
    }
  }

  goToPage(pageNumber: number): void {
    const totalPages = this.getTotalPages();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      this.currentPage = pageNumber;
      this.updateDisplayedOffers();
      this.scrollToTop();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    const maxPagesToShow = 5;
    const pages: number[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const middle = Math.ceil(maxPagesToShow / 2);
      if (this.currentPage <= middle) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - middle + 1) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - Math.floor(middle / 2); i <= this.currentPage + Math.ceil(middle / 2) - 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Offer interactions
  viewOfferDetails(offer: Offer): void {
    this.trackUserInteraction('offer_clicked', {
      offerId: offer.id,
      offerName: offer.name,
      category: offer.category,
      price: offer.price
    });

    this.router.navigate(['/parts', offer.id]);
  }

  addToCart(offer: Offer, event: Event): void {
    event.stopPropagation();

    if (!offer.inStock) {
      this.showNotification('هذا المنتج غير متوفر حالياً', 'warning');
      return;
    }

    // Add to cart logic
    console.log('Adding to cart:', offer);

    // Create success animation on button
    const button = event.target as HTMLElement;
    this.createCartAnimation(button);

    this.showNotification(`تم إضافة ${offer.name} إلى سلة المشتريات`, 'success');

    this.trackUserInteraction('add_to_cart', {
      offerId: offer.id,
      offerName: offer.name,
      price: offer.price,
      category: offer.category,
      storeName: offer.sellerName
    });
  }

  addToWishlist(offer: Offer, event: Event): void {
    event.stopPropagation();

    // Add to wishlist logic
    console.log('Adding to wishlist:', offer);
    this.showNotification(`تم إضافة ${offer.name} إلى المفضلة`, 'success');

    // Add visual feedback
    const target = event.target as HTMLElement;
    this.createHeartAnimation(target);

    this.trackUserInteraction('add_to_wishlist', {
      offerId: offer.id,
      offerName: offer.name
    });
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getDiscountAmount(offer: Offer): number {
    return offer.oldPrice ? offer.oldPrice - offer.price : 0;
  }

  hasDiscount(offer: Offer): boolean {
    return !!offer.discount && offer.discount > 0;
  }

  isOfferNew(offer: Offer): boolean {
    return offer.condition === 'New';
  }

  getConditionInArabic(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'New': 'جديد',
      'Used': 'مستعمل',
      'Refurbished': 'مجدد'
    };
    return conditionMap[condition] || condition;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-car-part.png';
    img.alt = 'صورة غير متوفرة';
  }

  // Animation methods
  private createCartAnimation(element: HTMLElement): void {
    const cart = document.createElement('div');
    cart.innerHTML = '🛒';
    cart.style.cssText = `
      position: absolute;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 1000;
      animation: cartBounce 0.8s ease-out forwards;
    `;

    const rect = element.getBoundingClientRect();
    cart.style.left = rect.left + rect.width / 2 + 'px';
    cart.style.top = rect.top + 'px';

    document.body.appendChild(cart);

    // Add CSS animation keyframes if not already added
    if (!document.querySelector('#cart-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'cart-animation-styles';
      style.textContent = `
        @keyframes cartBounce {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-30px) scale(1.3);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-60px) scale(0.8);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => cart.remove(), 800);
  }

  private createHeartAnimation(element: HTMLElement): void {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
      position: absolute;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 1000;
      animation: heartFloat 1s ease-out forwards;
    `;

    const rect = element.getBoundingClientRect();
    heart.style.left = rect.left + rect.width / 2 + 'px';
    heart.style.top = rect.top + 'px';

    document.body.appendChild(heart);

    // Add CSS animation keyframes if not already added
    if (!document.querySelector('#heart-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'heart-animation-styles';
      style.textContent = `
        @keyframes heartFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) scale(1.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => heart.remove(), 1000);
  }

  private showNotification(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'} me-2"></i>
        ${message}
      </div>
    `;

    document.body.appendChild(notification);

    // Add slide-in animation if not already added
    if (!document.querySelector('#notification-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-animation-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  private trackUserInteraction(action: string, data?: any): void {
    // Analytics tracking
    console.log('User interaction:', action, data);
    // Here you can integrate with Google Analytics, Facebook Pixel, etc.
  }

  // Accessibility helpers
  getAriaLabel(offer: Offer): string {
    return `${offer.name} بسعر ${this.formatPrice(offer.price)} من ${offer.sellerName}`;
  }
}

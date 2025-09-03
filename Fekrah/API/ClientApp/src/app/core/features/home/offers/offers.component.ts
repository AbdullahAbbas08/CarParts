import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Customer Offer Interface
interface CustomerOffer {
  id: number;
  type: number;
  partId: number;
  newPrice?: number;
  discountRate?: number;
  fixedAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  bundlePartIdsCsv?: string;
  promoCode?: string;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  // Calculated properties to prevent change detection issues
  progress?: number;
  durationText?: string;
  currentPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  savingsAmount?: number;
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // Component Properties
  offers: CustomerOffer[] = [];
  filteredOffers: CustomerOffer[] = [];
  isLoading: boolean = true;
  
  // Swiper instance
  private swiper?: Swiper;
  
  // Filter Properties
  selectedOfferType: string = '';
  searchQuery: string = '';
  sortBy: string = 'newest';
  
  // Bundle Modal Properties
  showBundleModal: boolean = false;
  selectedBundleOffer: CustomerOffer | null = null;
  selectedBundleParts: string[] = [];
  
  // Parts Data
  partsData: { [key: number]: { name: string, code: string, price: number, image: string } } = {};
  
  // Offer Types Configuration
  offerTypes = [
    { value: 1, label: 'سعر جديد', icon: 'fa-tag', class: 'new-price' },
    { value: 2, label: 'خصم نسبة مئوية', icon: 'fa-percent', class: 'percentage' },
    { value: 3, label: 'خصم مبلغ ثابت', icon: 'fa-dollar-sign', class: 'fixed-amount' },
    { value: 4, label: 'اشتري واحصل على آخر', icon: 'fa-gift', class: 'buy-get' },
    { value: 5, label: 'باقة قطع مترابطة', icon: 'fa-box-open', class: 'bundle' },
    { value: 6, label: 'كود ترويجي', icon: 'fa-ticket-alt', class: 'promo' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadPartsData();
    this.loadOffers();
  }

  ngAfterViewInit(): void {
    this.initializeSwiper();
  }

  private initializeSwiper(): void {
    // تهيئة Swiper
    this.swiper = new Swiper('.offers-swiper', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 20,
      centeredSlides: false,
      loop: false,
      direction: 'horizontal',
      
      // Navigation arrows
      navigation: {
        nextEl: '.offers-button-next',
        prevEl: '.offers-button-prev',
      },
      
      // Pagination
      pagination: {
        el: '.offers-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      
      // Autoplay
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      
      // Responsive breakpoints
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 25,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 30,
        }
      }
    });
  }

  // تحميل بيانات القطع
  private loadPartsData(): void {
    this.partsData = {
      1: { name: 'فلتر هواء', code: 'AF001', price: 50, image: 'assets/images/image_100_100.png' },
      2: { name: 'فلتر زيت', code: 'OF002', price: 30, image: 'assets/images/image_100_100.png' },
      3: { name: 'فلتر بنزين', code: 'FF003', price: 45, image: 'assets/images/image_100_100.png' },
      4: { name: 'فلتر كابينة', code: 'CF004', price: 35, image: 'assets/images/image_100_100.png' },
      5: { name: 'شمع احتراق NGK', code: 'SP005', price: 25, image: 'assets/images/image_100_100.png' },
      6: { name: 'شمع احتراق بوش', code: 'SP006', price: 28, image: 'assets/images/image_100_100.png' },
      7: { name: 'بوجية جلو', code: 'GP007', price: 65, image: 'assets/images/image_100_100.png' },
      8: { name: 'كويل إشعال', code: 'IC008', price: 120, image: 'assets/images/image_100_100.png' },
      9: { name: 'سير مولد', code: 'AB009', price: 75, image: 'assets/images/image_100_100.png' },
      10: { name: 'سير تايمن', code: 'TB010', price: 180, image: 'assets/images/image_100_100.png' },
      11: { name: 'سير مكيف', code: 'ACB011', price: 85, image: 'assets/images/image_100_100.png' },
      12: { name: 'سير مقود', code: 'PSB012', price: 95, image: 'assets/images/image_100_100.png' },
      13: { name: 'تيل فرامل أمامي', code: 'FBP013', price: 120, image: 'assets/images/image_100_100.png' },
      14: { name: 'تيل فرامل خلفي', code: 'RBP014', price: 100, image: 'assets/images/image_100_100.png' },
      15: { name: 'اقراص فرامل أمامية', code: 'FBD015', price: 200, image: 'assets/images/image_100_100.png' },
      16: { name: 'اقراص فرامل خلفية', code: 'RBD016', price: 180, image: 'assets/images/image_100_100.png' },
      17: { name: 'زيت فرامل DOT4', code: 'BF017', price: 40, image: 'assets/images/image_100_100.png' },
      18: { name: 'خراطيم فرامل', code: 'BH018', price: 55, image: 'assets/images/image_100_100.png' },
      19: { name: 'زيت محرك 5W30', code: 'EO019', price: 80, image: 'assets/images/image_100_100.png' },
      20: { name: 'زيت محرك 10W40', code: 'EO020', price: 75, image: 'assets/images/image_100_100.png' },
      21: { name: 'زيت فتيس أوتوماتيك', code: 'ATF021', price: 90, image: 'assets/images/image_100_100.png' },
      22: { name: 'زيت فتيس عادي', code: 'GO022', price: 70, image: 'assets/images/image_100_100.png' },
      23: { name: 'مياه رادياتير', code: 'RC023', price: 25, image: 'assets/images/image_100_100.png' },
      24: { name: 'زيت مقود هيدروليك', code: 'PSF024', price: 45, image: 'assets/images/image_100_100.png' },
      25: { name: 'مصباح أمامي هالوجين', code: 'HL025', price: 150, image: 'assets/images/image_100_100.png' },
      26: { name: 'مصباح أمامي LED', code: 'LED026', price: 300, image: 'assets/images/image_100_100.png' },
      27: { name: 'مصباح خلفي', code: 'TL027', price: 80, image: 'assets/images/image_100_100.png' },
      28: { name: 'لمبة إشارة', code: 'SL028', price: 15, image: 'assets/images/image_100_100.png' },
      29: { name: 'لمبة فرامل', code: 'BL029', price: 20, image: 'assets/images/image_100_100.png' },
      30: { name: 'مساعد أمامي', code: 'FS030', price: 250, image: 'assets/images/image_100_100.png' },
      31: { name: 'مساعد خلفي', code: 'RS031', price: 220, image: 'assets/images/image_100_100.png' },
      32: { name: 'زنبرك أمامي', code: 'FSP032', price: 180, image: 'assets/images/image_100_100.png' },
      33: { name: 'زنبرك خلفي', code: 'RSP033', price: 160, image: 'assets/images/image_100_100.png' },
      34: { name: 'كوتشي أمامي', code: 'FB034', price: 80, image: 'assets/images/image_100_100.png' },
      35: { name: 'إطار 175/70R13', code: 'T035', price: 400, image: 'assets/images/image_100_100.png' },
      36: { name: 'إطار 185/65R14', code: 'T036', price: 450, image: 'assets/images/image_100_100.png' },
      37: { name: 'إطار 195/65R15', code: 'T037', price: 500, image: 'assets/images/image_100_100.png' },
      38: { name: 'إطار احتياطي', code: 'ST038', price: 350, image: 'assets/images/image_100_100.png' },
      39: { name: 'بطارية 50 أمبير', code: 'BAT039', price: 800, image: 'assets/images/image_100_100.png' },
      40: { name: 'بطارية 70 أمبير', code: 'BAT040', price: 1000, image: 'assets/images/image_100_100.png' },
      41: { name: 'بطارية 90 أمبير', code: 'BAT041', price: 1200, image: 'assets/images/image_100_100.png' },
      42: { name: 'فلتر مكيف', code: 'ACF042', price: 40, image: 'assets/images/image_100_100.png' },
      43: { name: 'غاز مكيف R134', code: 'ACG043', price: 120, image: 'assets/images/image_100_100.png' },
      44: { name: 'كمبروسر مكيف', code: 'ACC044', price: 1500, image: 'assets/images/image_100_100.png' },
      45: { name: 'طرمبة بنزين', code: 'FP045', price: 300, image: 'assets/images/image_100_100.png' },
      46: { name: 'طرمبة مياه', code: 'WP046', price: 200, image: 'assets/images/image_100_100.png' },
      47: { name: 'ثرموستات', code: 'TH047', price: 60, image: 'assets/images/image_100_100.png' },
      48: { name: 'حساس حرارة', code: 'TS048', price: 85, image: 'assets/images/image_100_100.png' },
      49: { name: 'كاوتش شكمان', code: 'ER049', price: 35, image: 'assets/images/image_100_100.png' },
      50: { name: 'مرآة جانبية', code: 'SM050', price: 120, image: 'assets/images/image_100_100.png' }
    };
  }

  // تحميل العروض
  private loadOffers(): void {
    this.isLoading = true;
    
    // محاكاة تأخير التحميل
    setTimeout(() => {
      this.offers = this.generateCustomerOffers();
      this.calculateOfferProperties();
      this.filteredOffers = [...this.offers];
      this.sortOffers();
      this.isLoading = false;
    }, 1000);
  }

  // حساب خصائص العروض مسبقاً
  private calculateOfferProperties(): void {
    this.offers.forEach(offer => {
      offer.originalPrice = this.getPartPrice(offer.partId);
      offer.currentPrice = this.calculateCurrentPrice(offer);
      offer.discountPercentage = this.calculateDiscountPercentage(offer);
      offer.savingsAmount = this.calculateSavingsAmount(offer);
      offer.progress = this.calculateOfferProgress(offer);
      offer.durationText = this.calculateOfferDurationText(offer);
    });
  }

  // دوال الحساب المساعدة
  private calculateCurrentPrice(offer: CustomerOffer): number {
    const originalPrice = this.getPartPrice(offer.partId);
    
    switch (offer.type) {
      case 1: // سعر جديد
        return offer.newPrice || originalPrice;
      case 2: // خصم نسبة مئوية
        const discountRate = offer.discountRate || 0;
        return originalPrice - (originalPrice * discountRate / 100);
      case 3: // خصم مبلغ ثابت
        const fixedAmount = offer.fixedAmount || 0;
        return Math.max(0, originalPrice - fixedAmount);
      default:
        return originalPrice;
    }
  }

  private calculateDiscountPercentage(offer: CustomerOffer): number {
    const originalPrice = this.getPartPrice(offer.partId);
    const currentPrice = this.calculateCurrentPrice(offer);
    
    if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
    
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  private calculateSavingsAmount(offer: CustomerOffer): number {
    const originalPrice = this.getPartPrice(offer.partId);
    const currentPrice = this.calculateCurrentPrice(offer);
    
    return Math.max(0, originalPrice - currentPrice);
  }

  private calculateOfferProgress(offer: CustomerOffer): number {
    const now = new Date();
    const startDate = new Date(offer.startAt);
    const endDate = new Date(offer.endAt);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  private calculateOfferDurationText(offer: CustomerOffer): string {
    const now = new Date();
    const endDate = new Date(offer.endAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'انتهى العرض';
    if (diffDays === 1) return 'ينتهي اليوم';
    if (diffDays === 2) return 'ينتهي غداً';
    return `ينتهي خلال ${diffDays} أيام`;
  }

  // إنشاء عروض للعملاء
  private generateCustomerOffers(): CustomerOffer[] {
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    return [
      {
        id: 1,
        type: 1,
        partId: 1,
        newPrice: 40,
        startAt: new Date(now.getTime() - oneWeek),
        endAt: new Date(now.getTime() + oneWeek),
        isActive: true
      },
      {
        id: 2,
        type: 2,
        partId: 13,
        discountRate: 25,
        startAt: new Date(now.getTime() - oneWeek),
        endAt: new Date(now.getTime() + oneWeek * 2),
        isActive: true
      },
      {
        id: 3,
        type: 3,
        partId: 39,
        fixedAmount: 100,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneMonth),
        isActive: true
      },
      {
        id: 4,
        type: 4,
        partId: 5,
        buyQuantity: 2,
        getQuantity: 1,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneWeek * 3),
        isActive: true
      },
      {
        id: 5,
        type: 5,
        partId: 1,
        newPrice: 350,
        bundlePartIdsCsv: '1,2,3,4',
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneMonth * 2),
        isActive: true
      },
      {
        id: 6,
        type: 2,
        partId: 25,
        discountRate: 20,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneWeek * 4),
        isActive: true
      },
      {
        id: 7,
        type: 5,
        partId: 13,
        newPrice: 450,
        bundlePartIdsCsv: '13,14,15,16,17',
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneMonth),
        isActive: true
      },
      {
        id: 8,
        type: 1,
        partId: 44,
        newPrice: 1200,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneWeek * 2),
        isActive: true
      },
      {
        id: 9,
        type: 3,
        partId: 35,
        fixedAmount: 50,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneWeek * 5),
        isActive: true
      },
      {
        id: 10,
        type: 4,
        partId: 28,
        buyQuantity: 3,
        getQuantity: 2,
        startAt: new Date(),
        endAt: new Date(now.getTime() + oneWeek * 3),
        isActive: true
      }
    ];
  }

  // Helper Methods
  getPartName(partId: number): string {
    return this.partsData[partId]?.name || `قطعة رقم ${partId}`;
  }

  getPartCode(partId: number): string {
    return this.partsData[partId]?.code || `${partId}`;
  }

  getPartPrice(partId: number): number {
    return this.partsData[partId]?.price || 0;
  }

  getPartImage(partId: number): string {
    return this.partsData[partId]?.image || 'assets/images/image_100_100.png';
  }

  getOfferTypeLabel(type: number): string {
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.label : 'غير محدد';
  }

  getOfferTypeIcon(type: number): string {
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.icon : 'fa-tag';
  }

  getOfferBadgeClass(type: number): string {
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.class : 'default';
  }

  // Price and Discount Calculations
  getCurrentPrice(offer: CustomerOffer): number {
    const originalPrice = this.getPartPrice(offer.partId);
    
    if (offer.newPrice) {
      return offer.newPrice;
    }
    
    if (offer.discountRate) {
      return originalPrice * (1 - offer.discountRate / 100);
    }
    
    if (offer.fixedAmount) {
      return Math.max(0, originalPrice - offer.fixedAmount);
    }
    
    return originalPrice;
  }

  getOriginalPrice(offer: CustomerOffer): number {
    return this.getPartPrice(offer.partId);
  }

  hasDiscount(offer: CustomerOffer): boolean {
    if (offer.bundlePartIdsCsv) return true;
    if (offer.newPrice && offer.newPrice < this.getOriginalPrice(offer)) return true;
    if (offer.discountRate && offer.discountRate > 0) return true;
    if (offer.fixedAmount && offer.fixedAmount > 0) return true;
    return false;
  }

  getDiscountPercentage(offer: CustomerOffer): number {
    if (offer.discountRate) return offer.discountRate;
    
    const original = this.getOriginalPrice(offer);
    const current = this.getCurrentPrice(offer);
    
    if (original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    
    return 0;
  }

  getSavingsAmount(offer: CustomerOffer): number {
    const original = this.getOriginalPrice(offer);
    const current = this.getCurrentPrice(offer);
    return Math.max(0, original - current);
  }

  // Bundle Methods
  getBundlePartsCount(offer: CustomerOffer): number {
    return offer.bundlePartIdsCsv ? offer.bundlePartIdsCsv.split(',').length : 0;
  }

  getBundleOriginalPrice(offer: CustomerOffer | null): number {
    if (!offer || !offer.bundlePartIdsCsv) return 0;
    
    const partIds = offer.bundlePartIdsCsv.split(',').map(id => +id.trim());
    return partIds.reduce((total, partId) => total + this.getPartPrice(partId), 0);
  }

  getBundleOfferPrice(offer: CustomerOffer | null): number {
    if (!offer || !offer.bundlePartIdsCsv) return 0;
    
    if (offer.newPrice) return offer.newPrice;
    
    const originalPrice = this.getBundleOriginalPrice(offer);
    
    if (offer.discountRate) {
      return originalPrice * (1 - offer.discountRate / 100);
    }
    
    if (offer.fixedAmount) {
      return Math.max(0, originalPrice - offer.fixedAmount);
    }
    
    return originalPrice;
  }

  // Time and Duration Methods
  getOfferDurationText(offer: CustomerOffer): string {
    const now = new Date();
    const endDate = new Date(offer.endAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'انتهى العرض';
    if (diffDays === 0) return 'ينتهي اليوم';
    if (diffDays === 1) return 'ينتهي غداً';
    if (diffDays <= 7) return `ينتهي خلال ${diffDays} أيام`;
    if (diffDays <= 30) return `ينتهي خلال ${Math.ceil(diffDays / 7)} أسابيع`;
    return `ينتهي خلال ${Math.ceil(diffDays / 30)} شهور`;
  }

  getOfferProgress(offer: CustomerOffer): number {
    const startDate = new Date(offer.startAt);
    const endDate = new Date(offer.endAt);
    const now = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0;
    if (elapsed > totalDuration) return 100;
    
    return (elapsed / totalDuration) * 100;
  }

  // Filter and Sort Methods
  filterOffers(): void {
    this.filteredOffers = this.offers.filter(offer => {
      let matches = true;
      
      // Filter by offer type
      if (this.selectedOfferType && offer.type.toString() !== this.selectedOfferType) {
        matches = false;
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const partName = this.getPartName(offer.partId).toLowerCase();
        const partCode = this.getPartCode(offer.partId).toLowerCase();
        
        if (!partName.includes(query) && !partCode.includes(query)) {
          matches = false;
        }
      }
      
      return matches && offer.isActive;
    });
    
    this.sortOffers();
  }

  sortOffers(): void {
    switch (this.sortBy) {
      case 'newest':
        this.filteredOffers.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
        break;
      case 'discount':
        this.filteredOffers.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'price':
        this.filteredOffers.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        break;
      case 'ending':
        this.filteredOffers.sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
        break;
    }
  }

  clearAllFilters(): void {
    this.selectedOfferType = '';
    this.searchQuery = '';
    this.sortBy = 'newest';
    this.filterOffers();
  }

  // Bundle Modal Methods
  showBundleDetails(offer: CustomerOffer): void {
    this.selectedBundleOffer = offer;
    this.selectedBundleParts = offer.bundlePartIdsCsv?.split(',') || [];
    this.showBundleModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeBundleModal(): void {
    this.showBundleModal = false;
    this.selectedBundleOffer = null;
    this.selectedBundleParts = [];
    document.body.style.overflow = '';
  }

  // Action Methods
  addToCart(offer: CustomerOffer): void {
    // Implementation for adding to cart
    console.log('Adding to cart:', offer);
    // You can add your cart service logic here
  }

  viewPartDetails(partId: number): void {
    // Implementation for viewing part details
    console.log('Viewing part details:', partId);
    // You can navigate to part details page here
  }

  // Utility Methods
  trackByOfferId(index: number, offer: CustomerOffer): number {
    return offer.id;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/image_100_100.png';
  }

  getPriceDiscountClass(discountPercentage?: number): string {
    if (!discountPercentage) return 'low-discount';
    if (discountPercentage >= 30) return 'high-discount';
    if (discountPercentage >= 15) return 'medium-discount';
    return 'low-discount';
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
}

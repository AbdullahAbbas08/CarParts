import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

interface OfferDetails {
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
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  
  offer: OfferDetails | null = null;
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isInWishlist: boolean = false;
  countdown: CountdownTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  private countdownSubscription?: Subscription;
  
  // Sample parts data
  partsData: { [key: number]: any } = {
    1: { 
      name: 'فلتر هواء', 
      code: 'AF001', 
      price: 50, 
      category: 'فلاتر',
      images: ['assets/Parts/air-filter.jpg', 'assets/Parts/air-filter-2.jpg'],
      specifications: [
        { label: 'النوع', value: 'فلتر هواء قطني' },
        { label: 'الشركة المصنعة', value: 'بوش' },
        { label: 'رقم القطعة الأصلي', value: 'AF001-2024' },
        { label: 'التوافق', value: 'تويوتا كورولا 2015-2020' }
      ]
    },
    // Add more parts data as needed
  };
  
  offerTypes = [
    { value: 1, label: 'سعر جديد', icon: 'fa-tag', class: 'new-price' },
    { value: 2, label: 'خصم نسبة مئوية', icon: 'fa-percent', class: 'percentage' },
    { value: 3, label: 'خصم مبلغ ثابت', icon: 'fa-dollar-sign', class: 'fixed-amount' },
    { value: 4, label: 'اشتري واحصل على آخر', icon: 'fa-gift', class: 'buy-get' },
    { value: 5, label: 'باقة قطع مترابطة', icon: 'fa-box-open', class: 'bundle' },
    { value: 6, label: 'كود ترويجي', icon: 'fa-ticket-alt', class: 'promo' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOfferDetails();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private loadOfferDetails(): void {
    const offerId = this.route.snapshot.params['id'];
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.offer = {
        id: +offerId,
        type: 1,
        partId: 1,
        newPrice: 40,
        startAt: new Date(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      };
    }, 500);
  }

  private startCountdown(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.offer) {
        this.updateCountdown();
      }
    });
  }

  private updateCountdown(): void {
    if (!this.offer) return;
    
    const now = new Date();
    const endDate = new Date(this.offer.endAt);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff > 0) {
      this.countdown = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    } else {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  // Helper Methods
  getPartName(partId: number | undefined): string {
    if (!partId) return 'غير محدد';
    return this.partsData[partId]?.name || `قطعة رقم ${partId}`;
  }

  getPartCode(partId: number | undefined): string {
    if (!partId) return 'غير محدد';
    return this.partsData[partId]?.code || `${partId}`;
  }

  getPartPrice(partId: number | undefined): number {
    if (!partId) return 0;
    return this.partsData[partId]?.price || 0;
  }

  getPartCategory(partId: number | undefined): string {
    if (!partId) return 'غير محدد';
    return this.partsData[partId]?.category || 'غير محدد';
  }

  getPartImage(partId: number | undefined): string {
    if (!partId) return 'assets/default-part.jpg';
    const images = this.getPartImages(partId);
    return images[this.selectedImageIndex] || 'assets/default-part.jpg';
  }

  getPartImages(partId: number | undefined): string[] {
    if (!partId) return ['assets/default-part.jpg'];
    return this.partsData[partId]?.images || ['assets/default-part.jpg'];
  }

  getPartSpecifications(partId: number | undefined): any[] {
    if (!partId) return [];
    return this.partsData[partId]?.specifications || [];
  }

  getOfferTypeLabel(type: number | undefined): string {
    if (!type) return 'غير محدد';
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.label : 'غير محدد';
  }

  getOfferTypeIcon(type: number | undefined): string {
    if (!type) return 'fa-tag';
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.icon : 'fa-tag';
  }

  getOfferBadgeClass(type: number | undefined): string {
    if (!type) return 'default';
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.class : 'default';
  }

  // Price calculations
  getCurrentPrice(offer: OfferDetails | null): number {
    if (!offer) return 0;
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

  getOriginalPrice(offer: OfferDetails | null): number {
    if (!offer) return 0;
    return this.getPartPrice(offer.partId);
  }

  hasDiscount(offer: OfferDetails | null): boolean {
    if (!offer) return false;
    if (offer.bundlePartIdsCsv) return true;
    if (offer.newPrice && offer.newPrice < this.getOriginalPrice(offer)) return true;
    if (offer.discountRate && offer.discountRate > 0) return true;
    if (offer.fixedAmount && offer.fixedAmount > 0) return true;
    return false;
  }

  getDiscountPercentage(offer: OfferDetails | null): number {
    if (!offer) return 0;
    if (offer.discountRate) return offer.discountRate;
    
    const original = this.getOriginalPrice(offer);
    const current = this.getCurrentPrice(offer);
    
    if (original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    
    return 0;
  }

  getSavingsAmount(offer: OfferDetails | null): number {
    if (!offer) return 0;
    const original = this.getOriginalPrice(offer);
    const current = this.getCurrentPrice(offer);
    return Math.max(0, original - current);
  }

  // Bundle methods
  getBundlePartsCount(offer: OfferDetails | null): number {
    if (!offer) return 0;
    return offer.bundlePartIdsCsv ? offer.bundlePartIdsCsv.split(',').length : 0;
  }

  getBundleParts(offer: OfferDetails | null): string[] {
    if (!offer) return [];
    return offer.bundlePartIdsCsv ? offer.bundlePartIdsCsv.split(',') : [];
  }

  getBundleOriginalPrice(offer: OfferDetails | null): number {
    if (!offer || !offer.bundlePartIdsCsv) return 0;
    
    const partIds = offer.bundlePartIdsCsv.split(',').map(id => +id.trim());
    return partIds.reduce((total, partId) => total + this.getPartPrice(partId), 0);
  }

  getBundleOfferPrice(offer: OfferDetails | null): number {
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

  getBundleDiscountAmount(offer: OfferDetails | null): number {
    if (!offer) return 0;
    return this.getBundleOriginalPrice(offer) - this.getBundleOfferPrice(offer);
  }

  getOfferProgress(offer: OfferDetails | null): number {
    if (!offer) return 0;
    const startDate = new Date(offer.startAt);
    const endDate = new Date(offer.endAt);
    const now = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0;
    if (elapsed > totalDuration) return 100;
    
    return (elapsed / totalDuration) * 100;
  }

  getTotalPrice(): number {
    if (!this.offer) return 0;
    return this.getCurrentPrice(this.offer) * this.quantity;
  }

  // Image methods
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  // Quantity methods
  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Action methods
  addToCart(): void {
    console.log('Adding to cart:', this.offer, 'Quantity:', this.quantity);
    // Implement cart logic
  }

  buyNow(): void {
    console.log('Buy now:', this.offer, 'Quantity:', this.quantity);
    // Implement buy now logic
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    console.log('Wishlist status:', this.isInWishlist);
  }

  copyPromoCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Promo code copied:', code);
      // Show success message
    });
  }

  goBack(): void {
    this.router.navigate(['/offers']);
  }

  viewOffer(offerId: number): void {
    this.router.navigate(['/offers', offerId]);
  }

  getRelatedOffers(): OfferDetails[] {
    // Mock related offers - replace with actual logic
    return [];
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-EG');
  }

  trackByOfferId(index: number, offer: OfferDetails): number {
    return offer.id;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-part.jpg';
  }
}

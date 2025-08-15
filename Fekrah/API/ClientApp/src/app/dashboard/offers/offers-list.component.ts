import { Component, OnInit } from '@angular/core';
import { SwaggerClient, OfferDTO, DataSourceResultOfOfferDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.scss']
})
export class OffersListComponent implements OnInit {
  offers: OfferDTO[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  isLoading: boolean = false;
  showModal: boolean = false;
  selectedOffer: OfferDTO | null = null;
  
  // Bundle modal state
  showBundleModal: boolean = false;
  selectedBundleParts: string[] = [];
  selectedBundleOffer: OfferDTO | null = null;
  
  // Toggle between table designs
  isCardView: boolean = true;
  
  // Filters collapse state
  filtersCollapsed: boolean = true;
  
  // Advanced filters
  filters = {
    offerType: '',
    partName: '',
    storeName: '',
    status: '',
    startDate: '',
    endDate: ''
  };
  
  // Parts data for displaying names
  partsData: { [key: number]: { name: string, code: string, price: number } } = {};

  offerTypes = [
    { value: 1, label: 'سعر جديد', icon: 'fa-tag' },
    { value: 2, label: 'خصم نسبة مئوية', icon: 'fa-percent' },
    { value: 3, label: 'خصم مبلغ ثابت', icon: 'fa-dollar-sign' },
    { value: 4, label: 'اشتري X خذ Y', icon: 'fa-gift' },
    { value: 5, label: 'باقة قطع', icon: 'fa-box' },
    { value: 6, label: 'كود ترويجي', icon: 'fa-ticket-alt' }
  ];

  constructor(private swaggerClient: SwaggerClient) {}

  ngOnInit(): void {
    this.loadPartsData();
    this.loadOffers();
  }

  // تحميل بيانات القطع لعرض الأسماء
  private loadPartsData(): void {
    // بيانات وهمية للقطع - يمكن استبدالها بـ API call
    this.partsData = {
      1: { name: 'فلتر هواء', code: 'AF001', price: 50 },
      2: { name: 'فلتر زيت', code: 'OF002', price: 30 },
      3: { name: 'فلتر بنزين', code: 'FF003', price: 45 },
      4: { name: 'فلتر كابينة', code: 'CF004', price: 35 },
      5: { name: 'شمع احتراق NGK', code: 'SP005', price: 25 },
      6: { name: 'شمع احتراق بوش', code: 'SP006', price: 28 },
      7: { name: 'بوجية جلو', code: 'GP007', price: 65 },
      8: { name: 'كويل إشعال', code: 'IC008', price: 120 },
      9: { name: 'سير مولد', code: 'AB009', price: 75 },
      10: { name: 'سير تايمن', code: 'TB010', price: 180 },
      11: { name: 'سير مكيف', code: 'ACB011', price: 85 },
      12: { name: 'سير مقود', code: 'PSB012', price: 95 },
      13: { name: 'تيل فرامل أمامي', code: 'FBP013', price: 120 },
      14: { name: 'تيل فرامل خلفي', code: 'RBP014', price: 100 },
      15: { name: 'اقراص فرامل أمامية', code: 'FBD015', price: 200 },
      16: { name: 'اقراص فرامل خلفية', code: 'RBD016', price: 180 },
      17: { name: 'زيت فرامل DOT4', code: 'BF017', price: 40 },
      18: { name: 'خراطيم فرامل', code: 'BH018', price: 55 },
      19: { name: 'زيت محرك 5W30', code: 'EO019', price: 80 },
      20: { name: 'زيت محرك 10W40', code: 'EO020', price: 75 },
      21: { name: 'زيت فتيس أوتوماتيك', code: 'ATF021', price: 90 },
      22: { name: 'زيت فتيس عادي', code: 'GO022', price: 70 },
      23: { name: 'مياه رادياتير', code: 'RC023', price: 25 },
      24: { name: 'زيت مقود هيدروليك', code: 'PSF024', price: 45 },
      25: { name: 'مصباح أمامي هالوجين', code: 'HL025', price: 150 },
      26: { name: 'مصباح أمامي LED', code: 'LED026', price: 300 },
      27: { name: 'مصباح خلفي', code: 'TL027', price: 80 },
      28: { name: 'لمبة إشارة', code: 'SL028', price: 15 },
      29: { name: 'لمبة فرامل', code: 'BL029', price: 20 },
      30: { name: 'مساعد أمامي', code: 'FS030', price: 250 },
      31: { name: 'مساعد خلفي', code: 'RS031', price: 220 },
      32: { name: 'زنبرك أمامي', code: 'FSP032', price: 180 },
      33: { name: 'زنبرك خلفي', code: 'RSP033', price: 160 },
      34: { name: 'كوتشي أمامي', code: 'FB034', price: 80 },
      35: { name: 'إطار 175/70R13', code: 'T035', price: 400 },
      36: { name: 'إطار 185/65R14', code: 'T036', price: 450 },
      37: { name: 'إطار 195/65R15', code: 'T037', price: 500 },
      38: { name: 'إطار احتياطي', code: 'ST038', price: 350 },
      39: { name: 'بطارية 50 أمبير', code: 'BAT039', price: 800 },
      40: { name: 'بطارية 70 أمبير', code: 'BAT040', price: 1000 },
      41: { name: 'بطارية 90 أمبير', code: 'BAT041', price: 1200 },
      42: { name: 'فلتر مكيف', code: 'ACF042', price: 40 },
      43: { name: 'غاز مكيف R134', code: 'ACG043', price: 120 },
      44: { name: 'كمبروسر مكيف', code: 'ACC044', price: 1500 },
      45: { name: 'طرمبة بنزين', code: 'FP045', price: 300 },
      46: { name: 'طرمبة مياه', code: 'WP046', price: 200 },
      47: { name: 'ثرموستات', code: 'TH047', price: 60 },
      48: { name: 'حساس حرارة', code: 'TS048', price: 85 },
      49: { name: 'كاوتش شكمان', code: 'ER049', price: 35 },
      50: { name: 'مرآة جانبية', code: 'SM050', price: 120 }
    };
  }

  loadOffers(): void {
    this.isLoading = true;
    
    // استخدام البيانات الوهمية مباشرة لأغراض التجربة
    console.log('Loading dummy offers data with filters...');
    setTimeout(() => {
      const dummyResult = this.getDummyOffers();
      
      // تطبيق الفلاتر على البيانات
      let filteredData = this.applyFiltersToData(dummyResult.data);
      
      // تطبيق التصفح (Pagination)
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.offers = filteredData.slice(startIndex, endIndex);
      this.totalCount = filteredData.length;
      
      this.isLoading = false;
      console.log('Loaded', this.offers.length, 'offers after filtering');
    }, 500); // محاكاة وقت التحميل
    
    // يمكن تفعيل هذا الكود لاحقاً عندما يكون الـ API متاح
    /*
    this.swaggerClient.apiOfferGetAllGet(this.pageSize, this.currentPage, this.searchTerm)
      .subscribe({
        next: (result: DataSourceResultOfOfferDTO) => {
          this.offers = result.data || [];
          this.totalCount = result.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading offers:', error);
          this.isLoading = false;
        }
      });
    */
  }

  onSearch(): void {
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOffers();
  }

  openAddModal(): void {
    this.selectedOffer = null;
    this.showModal = true;
    document.body.classList.add('modal-open'); // Add modal class for positioning
    
    // Ensure modal is positioned correctly by forcing a reflow
    setTimeout(() => {
      const modalElement = document.querySelector('.modal-overlay');
      if (modalElement) {
        (modalElement as HTMLElement).style.position = 'fixed';
        (modalElement as HTMLElement).style.top = '0';
        (modalElement as HTMLElement).style.left = '0';
        (modalElement as HTMLElement).style.width = '100vw';
        (modalElement as HTMLElement).style.height = '100vh';
        (modalElement as HTMLElement).style.zIndex = '999999';
      }
    }, 0);
  }

  openEditModal(offer: OfferDTO): void {
    this.selectedOffer = offer;
    this.showModal = true;
    document.body.classList.add('modal-open'); // Add modal class for positioning
    
    // Ensure modal is positioned correctly by forcing a reflow
    setTimeout(() => {
      const modalElement = document.querySelector('.modal-overlay');
      if (modalElement) {
        (modalElement as HTMLElement).style.position = 'fixed';
        (modalElement as HTMLElement).style.top = '0';
        (modalElement as HTMLElement).style.left = '0';
        (modalElement as HTMLElement).style.width = '100vw';
        (modalElement as HTMLElement).style.height = '100vh';
        (modalElement as HTMLElement).style.zIndex = '999999';
      }
    }, 0);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOffer = null;
    document.body.classList.remove('modal-open'); // Remove modal class
  }

  onOfferSaved(offer: any): void {
    // Refresh the offers list
    this.loadOffers();
    this.closeModal();
  }

  async deleteOffer(id: number): Promise<void> {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      try {
        await this.swaggerClient.apiOfferDeletePost(id).toPromise();
        this.loadOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  }

  getOfferTypeLabel(type: number): string {
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.label : 'غير محدد';
  }

  getOfferTypeIcon(type: number): string {
    const offerType = this.offerTypes.find(t => t.value === type);
    return offerType ? offerType.icon : 'fa-tag';
  }

  getOfferTypeClass(type: number): string {
    switch(type) {
      case 1: return 'type-new-price'; // سعر جديد
      case 2: return 'type-discount-rate'; // خصم نسبة مئوية
      case 3: return 'type-fixed-amount'; // خصم مبلغ ثابت
      case 4: return 'type-buy-get'; // اشتري X خذ Y
      case 5: return 'type-bundle'; // باقة قطع
      case 6: return 'type-promo-code'; // كود ترويجي
      default: return 'type-default';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'نشط' : 'غير نشط';
  }

  getTotalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  getPaginationArray(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayedItemsStart(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  getDisplayedItemsEnd(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  trackByOfferId(index: number, offer: OfferDTO): any {
    return offer.id;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-EG');
  }

  // الحصول على اسم القطعة
  getPartName(partId: number): string {
    return this.partsData[partId]?.name || `قطعة رقم ${partId}`;
  }

  // الحصول على كود القطعة
  getPartCode(partId: number): string {
    return this.partsData[partId]?.code || `${partId}`;
  }

  // الحصول على سعر القطعة الأصلي
  getPartPrice(partId: number): number {
    return this.partsData[partId]?.price || 0;
  }

  // تبديل وضع العرض (جدول / كروت)
  toggleViewMode(): void {
    this.isCardView = !this.isCardView;
  }

  // تبديل عرض الفلاتر
  toggleFilters(): void {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  // تطبيق الفلاتر
  applyFilters(): void {
    this.currentPage = 1; // العودة للصفحة الأولى
    this.loadOffers();
  }

  // مسح الفلاتر
  clearFilters(): void {
    this.filters = {
      offerType: '',
      partName: '',
      storeName: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    this.searchTerm = '';
    this.applyFilters();
  }

  // تطبيق الفلاتر على البيانات الوهمية
  private applyFiltersToData(data: any[]): any[] {
    return data.filter(offer => {
      // فلتر نوع العرض
      if (this.filters.offerType && offer.type.toString() !== this.filters.offerType) {
        return false;
      }

      // فلتر اسم القطعة
      if (this.filters.partName) {
        const partName = this.getPartName(offer.partId).toLowerCase();
        if (!partName.includes(this.filters.partName.toLowerCase())) {
          return false;
        }
      }

      // فلتر حالة العرض
      if (this.filters.status !== '') {
        const isActive = this.filters.status === 'true';
        if (offer.isActive !== isActive) {
          return false;
        }
      }

      // فلتر التاريخ
      if (this.filters.startDate || this.filters.endDate) {
        const offerStart = new Date(offer.startAt);
        const offerEnd = new Date(offer.endAt);
        
        if (this.filters.startDate && offerStart < new Date(this.filters.startDate)) {
          return false;
        }
        
        if (this.filters.endDate && offerEnd > new Date(this.filters.endDate)) {
          return false;
        }
      }

      // البحث العام
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const partName = this.getPartName(offer.partId).toLowerCase();
        const partCode = this.getPartCode(offer.partId).toLowerCase();
        const offerType = this.getOfferTypeLabel(offer.type).toLowerCase();
        
        if (!partName.includes(searchLower) && 
            !partCode.includes(searchLower) && 
            !offerType.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  // بيانات وهمية للعروض لأغراض التجربة
  private getDummyOffers(): { data: any[], count: number } {
    const dummyOffers: any[] = [
      {
        id: 1,
        type: 1, // سعر جديد
        partId: 1,
        newPrice: 40,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-09-01'),
        isActive: true
      },
      {
        id: 2,
        type: 2, // خصم نسبة مئوية
        partId: 2,
        newPrice: null,
        discountRate: 20,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-05'),
        endAt: new Date('2024-08-25'),
        isActive: true
      },
      {
        id: 3,
        type: 3, // خصم مبلغ ثابت
        partId: 13,
        newPrice: null,
        discountRate: null,
        fixedAmount: 30,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-10'),
        endAt: new Date('2024-09-10'),
        isActive: true
      },
      {
        id: 4,
        type: 4, // اشتري X خذ Y
        partId: 5,
        newPrice: null,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: 2,
        getQuantity: 1,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-08-31'),
        isActive: true
      },
      {
        id: 5,
        type: 5, // باقة قطع
        partId: 1,
        newPrice: 350,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '1,2,3,4', // فلاتر شاملة
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-12-31'),
        isActive: true
      },
      {
        id: 6,
        type: 2, // خصم نسبة مئوية
        partId: 19,
        newPrice: null,
        discountRate: 15,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-07-20'),
        endAt: new Date('2024-08-20'),
        isActive: false // عرض منتهي
      },
      {
        id: 7,
        type: 1, // سعر جديد
        partId: 25,
        newPrice: 120,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-15'),
        endAt: new Date('2024-09-15'),
        isActive: true
      },
      {
        id: 8,
        type: 5, // باقة قطع
        partId: 13,
        newPrice: 450,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '13,14,15,16,17', // باقة فرامل شاملة
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-10-31'),
        isActive: true
      },
      {
        id: 9,
        type: 3, // خصم مبلغ ثابت
        partId: 39,
        newPrice: null,
        discountRate: null,
        fixedAmount: 100,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-12'),
        endAt: new Date('2024-09-12'),
        isActive: true
      },
      {
        id: 10,
        type: 4, // اشتري X خذ Y
        partId: 28,
        newPrice: null,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: 3,
        getQuantity: 2,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-08-31'),
        isActive: true
      },
      {
        id: 11,
        type: 2, // خصم نسبة مئوية
        partId: 35,
        newPrice: null,
        discountRate: 25,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-09-30'),
        isActive: true
      },
      {
        id: 12,
        type: 1, // سعر جديد
        partId: 44,
        newPrice: 1200,
        discountRate: null,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        startAt: new Date('2024-08-10'),
        endAt: new Date('2024-09-10'),
        isActive: true
      },
      {
        id: 13,
        type: 6, // كود ترويجي
        partId: 45,
        newPrice: null,
        discountRate: 20,
        fixedAmount: null,
        buyQuantity: null,
        getQuantity: null,
        freePartId: null,
        bundlePartIdsCsv: '',
        promoCode: 'SAVE20',
        startAt: new Date('2024-08-01'),
        endAt: new Date('2024-08-31'),
        isActive: true
      }
    ];

    return {
      data: dummyOffers,
      count: dummyOffers.length
    };
  }

  // Bundle Modal Functions
  openBundleDetailsModal(offer: OfferDTO): void {
    this.selectedBundleOffer = offer;
    this.selectedBundleParts = offer.bundlePartIdsCsv?.split(',') || [];
    this.showBundleModal = true;
    document.body.style.overflow = 'hidden'; // Prevent body scroll
    document.body.classList.add('modal-open'); // Add modal class for positioning
    
    // Ensure modal is positioned correctly by forcing a reflow
    setTimeout(() => {
      const modalElement = document.querySelector('.bundle-modal-overlay');
      if (modalElement) {
        (modalElement as HTMLElement).style.position = 'fixed';
        (modalElement as HTMLElement).style.top = '0';
        (modalElement as HTMLElement).style.left = '0';
        (modalElement as HTMLElement).style.width = '100vw';
        (modalElement as HTMLElement).style.height = '100vh';
        (modalElement as HTMLElement).style.zIndex = '999999';
      }
    }, 0);
  }

  closeBundleModal(): void {
    this.showBundleModal = false;
    this.selectedBundleOffer = null;
    this.selectedBundleParts = [];
    document.body.style.overflow = 'auto'; // Restore body scroll
    document.body.classList.remove('modal-open'); // Remove modal class
  }

  getTotalOriginalPrice(): number {
    if (!this.selectedBundleParts) return 0;
    
    return this.selectedBundleParts.reduce((total, partId) => {
      const price = this.getPartPrice(+partId);
      return total + (typeof price === 'number' ? price : 0);
    }, 0);
  }

  getDiscountAmount(): number {
    if (!this.selectedBundleOffer || !this.selectedBundleParts) return 0;
    
    const totalOriginal = this.getTotalOriginalPrice();
    let discountAmount = 0;

    // Calculate discount based on offer type
    if (this.selectedBundleOffer.discountRate) {
      discountAmount = totalOriginal * (this.selectedBundleOffer.discountRate / 100);
    } else if (this.selectedBundleOffer.fixedAmount) {
      discountAmount = this.selectedBundleOffer.fixedAmount;
    }

    return discountAmount;
  }

  getPartOfferPrice(partId: number): number {
    const originalPrice = this.getPartPrice(partId);
    if (typeof originalPrice !== 'number') return 0;

    if (!this.selectedBundleOffer) return originalPrice;

    // For bundle offers, apply proportional discount
    if (this.selectedBundleOffer.discountRate) {
      return originalPrice * (1 - this.selectedBundleOffer.discountRate / 100);
    } else if (this.selectedBundleOffer.fixedAmount && this.selectedBundleParts) {
      // Distribute fixed discount proportionally
      const totalOriginal = this.getTotalOriginalPrice();
      const proportionalDiscount = (originalPrice / totalOriginal) * this.selectedBundleOffer.fixedAmount;
      return Math.max(0, originalPrice - proportionalDiscount);
    }

    return originalPrice;
  }

  getPartSavings(partId: number): number {
    const originalPrice = this.getPartPrice(partId);
    const offerPrice = this.getPartOfferPrice(partId);
    
    if (typeof originalPrice !== 'number' || typeof offerPrice !== 'number') return 0;
    
    return Math.max(0, originalPrice - offerPrice);
  }

  getBundleTotalPrice(offer: any): number {
    if (!offer.bundlePartIdsCsv) return 0;
    
    const partIds = offer.bundlePartIdsCsv.split(',').map((id: string) => +id.trim());
    let totalPrice = 0;

    partIds.forEach((partId: number) => {
      const originalPrice = this.getPartPrice(partId);
      if (typeof originalPrice === 'number') {
        totalPrice += originalPrice;
      }
    });

    // Apply bundle discount if available
    if (offer.discountRate) {
      totalPrice = totalPrice * (1 - offer.discountRate / 100);
    } else if (offer.fixedAmount) {
      totalPrice = Math.max(0, totalPrice - offer.fixedAmount);
    } else if (offer.newPrice) {
      totalPrice = offer.newPrice;
    }

    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  }
}

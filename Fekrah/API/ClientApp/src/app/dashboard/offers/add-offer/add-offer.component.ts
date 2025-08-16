import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwaggerClient, OfferDTO, OfferTypeEnum } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddOfferComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() editingOffer: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() offerSaved = new EventEmitter<any>();

  offerForm: FormGroup;
  parts: any[] = []; // قائمة القطع المتاحة
  filteredParts: any[] = []; // القطع المفلترة للبحث (سنحتفظ بها للتوافق مع الكود الحالي)
  partOptions: any[] = []; // خيارات القطع لـ PrimeNG Dropdown
  isLoadingParts: boolean = false;

  // Bundle-specific properties
  selectedBundleParts: any[] = []; // القطع المختارة للحزمة
  bundlePartsPrices: { [partId: number]: number } = {}; // أسعار القطع في الحزمة

  // Arabic locale for PrimeNG Calendar
  arabicLocale = {
    firstDayOfWeek: 6,
    dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    dayNamesShort: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
    today: 'اليوم',
    clear: 'مسح'
  };

  offerTypes = [
    { value: OfferTypeEnum.NewPrice, label: 'سعر جديد', icon: 'fa-tag' },
    { value: OfferTypeEnum.Percentage, label: 'خصم نسبة مئوية', icon: 'fa-percent' },
    { value: OfferTypeEnum.FixedAmount, label: 'خصم مبلغ ثابت', icon: 'fa-dollar-sign' },
    { value: OfferTypeEnum.BuyXGetY, label: 'اشتري X خذ Y', icon: 'fa-gift' },
    { value: OfferTypeEnum.Bundle, label: 'باقة قطع', icon: 'fa-box' },
    { value: OfferTypeEnum.PromoCode, label: 'بروموكود', icon: 'fa-qrcode' }
  ];

  constructor(
    private fb: FormBuilder,
    private swaggerClient: SwaggerClient,
    private cdr: ChangeDetectorRef
  ) {
    this.offerForm = this.createForm();
  }

  ngOnInit(): void {
    // تحميل قائمة القطع المتاحة
    this.loadParts();
    
    // تأكد من تطبيق الـ validators عند تحميل النموذج
    this.updateValidators(this.offerForm.get('type')?.value || 0);
    
    if (this.editingOffer) {
      this.populateForm();
    }
    
    // Listen to type changes to update validators and form state
    this.offerForm.get('type')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  // تحميل قائمة القطع المتاحة
  private loadParts(): void {
    this.isLoadingParts = true;
    
    // استخدام البيانات الوهمية مباشرة لأغراض التجربة
    this.parts = this.getDummyParts();
    this.filteredParts = [...this.parts];
    
    // تحويل القطع إلى خيارات PrimeNG Dropdown
    this.partOptions = this.parts.map(part => ({
      label: `${part.name} (${part.code}) - ${part.price} ج.م`,
      value: part.id,
      name: part.name,
      code: part.code,
      price: part.price
    }));
    
    this.isLoadingParts = false;
    
    // يمكن تفعيل هذا الكود لاحقاً عندما يكون الـ API متاح
    /*
    this.swaggerClient.apiPartsGetAllGet(1000, 1, '') // تحميل أول 1000 قطعة
      .subscribe({
        next: (result: any) => {
          this.parts = result.data || [];
          this.filteredParts = [...this.parts];
          this.partOptions = this.parts.map(part => ({
            label: `${part.name} (${part.code}) - ${part.price} ج.م`,
            value: part.id,
            name: part.name,
            code: part.code,
            price: part.price
          }));
          this.isLoadingParts = false;
        },
        error: (error: any) => {
          this.isLoadingParts = false;
          // في حالة عدم وجود API للقطع، استخدم بيانات وهمية
          this.parts = this.getDummyParts();
          this.filteredParts = [...this.parts];
          this.partOptions = this.parts.map(part => ({
            label: `${part.name} (${part.code}) - ${part.price} ج.م`,
            value: part.id,
            name: part.name,
            code: part.code,
            price: part.price
          }));
        }
      });
    */
  }

  // بيانات وهمية للقطع في حالة عدم وجود API
  private getDummyParts(): any[] {
    return [
      // فلاتر
      { id: 1, name: 'فلتر هواء', code: 'AF001', price: 50 },
      { id: 2, name: 'فلتر زيت', code: 'OF002', price: 30 },
      { id: 3, name: 'فلتر بنزين', code: 'FF003', price: 45 },
      { id: 4, name: 'فلتر كابينة', code: 'CF004', price: 35 },
      
      // إشعال ووقود
      { id: 5, name: 'شمع احتراق NGK', code: 'SP005', price: 25 },
      { id: 6, name: 'شمع احتراق بوش', code: 'SP006', price: 28 },
      { id: 7, name: 'بوجية جلو', code: 'GP007', price: 65 },
      { id: 8, name: 'كويل إشعال', code: 'IC008', price: 120 },
      
      // الأحزمة والسيور
      { id: 9, name: 'سير مولد', code: 'AB009', price: 75 },
      { id: 10, name: 'سير تايمن', code: 'TB010', price: 180 },
      { id: 11, name: 'سير مكيف', code: 'ACB011', price: 85 },
      { id: 12, name: 'سير مقود', code: 'PSB012', price: 95 },
      
      // الفرامل
      { id: 13, name: 'تيل فرامل أمامي', code: 'FBP013', price: 120 },
      { id: 14, name: 'تيل فرامل خلفي', code: 'RBP014', price: 100 },
      { id: 15, name: 'اقراص فرامل أمامية', code: 'FBD015', price: 200 },
      { id: 16, name: 'اقراص فرامل خلفية', code: 'RBD016', price: 180 },
      { id: 17, name: 'زيت فرامل DOT4', code: 'BF017', price: 40 },
      { id: 18, name: 'خراطيم فرامل', code: 'BH018', price: 55 },
      
      // الزيوت والسوائل
      { id: 19, name: 'زيت محرك 5W30', code: 'EO019', price: 80 },
      { id: 20, name: 'زيت محرك 10W40', code: 'EO020', price: 75 },
      { id: 21, name: 'زيت فتيس أوتوماتيك', code: 'ATF021', price: 90 },
      { id: 22, name: 'زيت فتيس عادي', code: 'GO022', price: 70 },
      { id: 23, name: 'مياه رادياتير', code: 'RC023', price: 25 },
      { id: 24, name: 'زيت مقود هيدروليك', code: 'PSF024', price: 45 },
      
      // الإضاءة
      { id: 25, name: 'مصباح أمامي هالوجين', code: 'HL025', price: 150 },
      { id: 26, name: 'مصباح أمامي LED', code: 'LED026', price: 300 },
      { id: 27, name: 'مصباح خلفي', code: 'TL027', price: 80 },
      { id: 28, name: 'لمبة إشارة', code: 'SL028', price: 15 },
      { id: 29, name: 'لمبة فرامل', code: 'BL029', price: 20 },
      
      // التعليق
      { id: 30, name: 'مساعد أمامي', code: 'FS030', price: 250 },
      { id: 31, name: 'مساعد خلفي', code: 'RS031', price: 220 },
      { id: 32, name: 'زنبرك أمامي', code: 'FSP032', price: 180 },
      { id: 33, name: 'زنبرك خلفي', code: 'RSP033', price: 160 },
      { id: 34, name: 'كوتشي أمامي', code: 'FB034', price: 80 },
      
      // الإطارات
      { id: 35, name: 'إطار 175/70R13', code: 'T035', price: 400 },
      { id: 36, name: 'إطار 185/65R14', code: 'T036', price: 450 },
      { id: 37, name: 'إطار 195/65R15', code: 'T037', price: 500 },
      { id: 38, name: 'إطار احتياطي', code: 'ST038', price: 350 },
      
      // البطاريات
      { id: 39, name: 'بطارية 50 أمبير', code: 'BAT039', price: 800 },
      { id: 40, name: 'بطارية 70 أمبير', code: 'BAT040', price: 1000 },
      { id: 41, name: 'بطارية 90 أمبير', code: 'BAT041', price: 1200 },
      
      // المكيف
      { id: 42, name: 'فلتر مكيف', code: 'ACF042', price: 40 },
      { id: 43, name: 'غاز مكيف R134', code: 'ACG043', price: 120 },
      { id: 44, name: 'كمبروسر مكيف', code: 'ACC044', price: 1500 },
      
      // أجزاء أخرى
      { id: 45, name: 'طرمبة بنزين', code: 'FP045', price: 300 },
      { id: 46, name: 'طرمبة مياه', code: 'WP046', price: 200 },
      { id: 47, name: 'ثرموستات', code: 'TH047', price: 60 },
      { id: 48, name: 'حساس حرارة', code: 'TS048', price: 85 },
      { id: 49, name: 'كاوتش شكمان', code: 'ER049', price: 35 },
      { id: 50, name: 'مرآة جانبية', code: 'SM050', price: 120 }
    ];
  }

  // فلترة القطع حسب البحث
  onPartSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredParts = [...this.parts];
    } else {
      this.filteredParts = this.parts.filter(part => 
        part.name.toLowerCase().includes(searchTerm) ||
        part.code.toLowerCase().includes(searchTerm)
      );
    }
  }

  // الحصول على اسم القطعة من الـ ID
  getPartName(partId: number): string {
    const part = this.parts.find(p => p.id === partId);
    return part ? `${part.name} (${part.code})` : `قطعة رقم ${partId}`;
  }

  // الحصول على سعر القطعة لعرضه كمرجع
  getPartPrice(partId: number): number {
    const part = this.parts.find(p => p.id === partId);
    return part ? part.price : 0;
  }

  // Bundle-specific methods
  onBundlePartsChange(event: any): void {
    const selectedPartIds = event.value || [];
    
    // Update selected parts array
    this.selectedBundleParts = selectedPartIds.map((partId: number) => {
      const part = this.parts.find(p => p.id === partId);
      if (part) {
        return {
          ...part,
          value: partId,
          label: `${part.name} (${part.code}) - ${part.price} ج.م`
        };
      }
      return null;
    }).filter((part: any) => part !== null);

    // Initialize prices with original prices
    selectedPartIds.forEach((partId: number) => {
      if (!this.bundlePartsPrices[partId]) {
        const part = this.parts.find(p => p.id === partId);
        this.bundlePartsPrices[partId] = part ? part.price : 0;
      }
    });

    // Remove prices for unselected parts
    Object.keys(this.bundlePartsPrices).forEach(partIdStr => {
      const partId = parseInt(partIdStr);
      if (!selectedPartIds.includes(partId)) {
        delete this.bundlePartsPrices[partId];
      }
    });
  }

  trackByPartId(index: number, part: any): number {
    return part.value;
  }

  getBundlePartPrice(partId: number): number {
    return this.bundlePartsPrices[partId] || this.getPartPrice(partId);
  }

  updateBundlePartPrice(partId: number, event: any): void {
    const price = parseFloat(event.target.value);
    if (!isNaN(price) && price >= 0) {
      this.bundlePartsPrices[partId] = price;
    }
  }

  calculateBundleTotal(): number {
    let total = 0;
    this.selectedBundleParts.forEach(part => {
      total += this.getBundlePartPrice(part.value);
    });
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  calculateSavings(): number {
    let originalTotal = 0;
    let bundleTotal = this.calculateBundleTotal();
    
    this.selectedBundleParts.forEach(part => {
      originalTotal += part.price;
    });
    
    return Math.max(0, Math.round((originalTotal - bundleTotal) * 100) / 100);
  }

  getSavingsPercentage(): number {
    let originalTotal = 0;
    this.selectedBundleParts.forEach(part => {
      originalTotal += part.price;
    });
    
    if (originalTotal === 0) return 0;
    
    const savings = this.calculateSavings();
    return Math.round((savings / originalTotal) * 100);
  }

  private updateValidators(type: number): void {
    // Clear all validators first
    this.clearAllValidators();
    
    // Set partId validator based on type (required for all except bundle)
    if (type !== OfferTypeEnum.Bundle) { // Not bundle
      this.offerForm.get('partId')?.setValidators([Validators.required]);
    } else { // Bundle type
      this.offerForm.get('partId')?.clearValidators();
      this.offerForm.get('partId')?.updateValueAndValidity();
    }
    
    // Set validators based on type
    switch (type) {
      case OfferTypeEnum.NewPrice: // NewPrice
        this.offerForm.get('newPrice')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferTypeEnum.Percentage: // Percentage
        this.offerForm.get('discountRate')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
        break;
      case OfferTypeEnum.FixedAmount: // FixedAmount
        this.offerForm.get('fixedAmount')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferTypeEnum.BuyXGetY: // BuyXGetY
        this.offerForm.get('buyQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        this.offerForm.get('getQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case OfferTypeEnum.Bundle: // Bundle
        this.offerForm.get('bundlePartIds')?.setValidators([Validators.required]);
        break;
      case OfferTypeEnum.PromoCode: // PromoCode
        this.offerForm.get('promoCode')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.offerForm.get('promoCodeUsageLimit')?.setValidators([Validators.required, Validators.min(1)]);
        // For PromoCode, user needs to choose either percentage or fixed amount
        // We'll handle this through the radio buttons and onPromoDiscountTypeChange
        break;
    }
    
    // Update validity
    this.offerForm.updateValueAndValidity();
  }

  private clearAllValidators(): void {
    const fields = ['newPrice', 'discountRate', 'fixedAmount', 'buyQuantity', 'getQuantity', 'bundlePartIdsCsv', 'bundlePartIds', 'promoCode', 'promoCodeUsageLimit'];
    fields.forEach(field => {
      this.offerForm.get(field)?.clearValidators();
      this.offerForm.get(field)?.updateValueAndValidity();
    });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      id: [0],
      type: [OfferTypeEnum.NewPrice, Validators.required],
      partId: [null, Validators.required], // تغيير من 0 إلى null لتفعيل placeholder
      newPrice: [null],
      discountRate: [null, [Validators.min(0), Validators.max(100)]],
      fixedAmount: [null, [Validators.min(0)]],
      buyQuantity: [null, [Validators.min(1)]],
      getQuantity: [null, [Validators.min(1)]],
      freePartId: [null],
      bundlePartIdsCsv: [''], // Keep for backward compatibility
      bundlePartIds: [[], []], // New field for multiselect - no initial validator
      // PromoCode fields
      promoCode: [null],
      promoCodeUsageLimit: [null, [Validators.min(1)]],
      promoCodeUsageCount: [0], // Track how many times it's been used
      startAt: ['', Validators.required],
      endAt: ['', Validators.required],
      isActive: [true]
    });

    // Watch for type changes to trigger field display updates
    form.get('type')?.valueChanges.subscribe(value => {
      if (value !== null) {
        this.updateValidators(Number(value));
        this.cdr.detectChanges(); // Force change detection
      }
    });

    return form;
  }

  private populateForm(): void {
    if (this.editingOffer) {
      // Format dates for input fields
      const startDate = this.editingOffer.startAt ? 
        new Date(this.editingOffer.startAt).toISOString().split('T')[0] : '';
      const endDate = this.editingOffer.endAt ? 
        new Date(this.editingOffer.endAt).toISOString().split('T')[0] : '';

      // Convert bundlePartIdsCsv to array for multiselect
      let bundlePartIds: number[] = [];
      if (this.editingOffer.bundlePartIdsCsv) {
        bundlePartIds = this.editingOffer.bundlePartIdsCsv
          .split(',')
          .map((id: string) => parseInt(id.trim()))
          .filter((id: number) => !isNaN(id));
      }

      this.offerForm.patchValue({
        id: this.editingOffer.id || 0,
        type: this.editingOffer.type || OfferTypeEnum.NewPrice,
        partId: this.editingOffer.partId || null, // تغيير من 0 إلى null
        newPrice: this.editingOffer.newPrice || null,
        discountRate: this.editingOffer.discountRate || null,
        fixedAmount: this.editingOffer.fixedAmount || null,
        buyQuantity: this.editingOffer.buyQuantity || null,
        getQuantity: this.editingOffer.getQuantity || null,
        freePartId: this.editingOffer.freePartId || null,
        bundlePartIdsCsv: this.editingOffer.bundlePartIdsCsv || '',
        bundlePartIds: bundlePartIds, // Set the array for multiselect
        promoCode: this.editingOffer.promoCode || null,
        promoCodeUsageLimit: this.editingOffer.promoCodeUsageLimit || null,
        promoCodeUsageCount: this.editingOffer.promoCodeUsageCount || 0,
        startAt: startDate,
        endAt: endDate,
        isActive: this.editingOffer.isActive !== undefined ? this.editingOffer.isActive : true
      });

      // Restore bundle parts prices if available
      if (this.editingOffer.bundlePartsPrices) {
        try {
          this.bundlePartsPrices = JSON.parse(this.editingOffer.bundlePartsPrices);
        } catch (error) {
          // If parsing fails, initialize with default prices
          this.bundlePartsPrices = {};
        }
      }

      // Initialize selectedBundleParts for editing
      if (bundlePartIds.length > 0) {
        this.selectedBundleParts = bundlePartIds.map((partId: number) => {
          const part = this.parts.find(p => p.id === partId);
          if (part) {
            return {
              ...part,
              value: partId,
              label: `${part.name} (${part.code}) - ${part.price} ج.م`
            };
          }
          return null;
        }).filter((part: any) => part !== null);
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

  onTypeChange(event: any): void {
    const type = parseInt(event.target.value);
    this.offerForm.get('type')?.setValue(type);
    this.updateValidators(type);
    this.cdr.detectChanges(); // Force change detection
  }

  // Functions to show/hide fields based on offer type
  shouldShowNewPriceField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.NewPrice;
  }

  shouldShowDiscountRateField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.Percentage || type === OfferTypeEnum.PromoCode;
  }

  shouldShowFixedAmountField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.FixedAmount || type === OfferTypeEnum.PromoCode;
  }

  shouldShowQuantityFields(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.BuyXGetY;
  }

  shouldShowBundleField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.Bundle;
  }

  shouldShowPromoCodeFields(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    return type === OfferTypeEnum.PromoCode;
  }

  onPromoDiscountTypeChange(discountType: string): void {
    // Clear both discount fields first
    this.offerForm.get('discountRate')?.setValue(null);
    this.offerForm.get('fixedAmount')?.setValue(null);
    
    // Set validators based on discount type
    if (discountType === 'percentage') {
      this.offerForm.get('discountRate')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      this.offerForm.get('fixedAmount')?.clearValidators();
    } else if (discountType === 'fixed') {
      this.offerForm.get('fixedAmount')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.offerForm.get('discountRate')?.clearValidators();
    }
    
    // Update validity
    this.offerForm.get('discountRate')?.updateValueAndValidity();
    this.offerForm.get('fixedAmount')?.updateValueAndValidity();
  }

  // Helper function for backward compatibility
  shouldShowValueField(): boolean {
    const type = this.offerForm.get('type')?.value;
    return type === OfferTypeEnum.NewPrice || type === OfferTypeEnum.Percentage || type === OfferTypeEnum.FixedAmount; // NewPrice, Percentage, FixedAmount
  }

  getOfferTypeDescription(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case OfferTypeEnum.NewPrice: return 'تحديد سعر جديد للقطعة';
      case OfferTypeEnum.Percentage: return 'خصم بنسبة مئوية من السعر الأصلي';
      case OfferTypeEnum.FixedAmount: return 'خصم بمبلغ ثابت من السعر الأصلي';
      case OfferTypeEnum.BuyXGetY: return 'عرض اشتري كمية محددة واحصل على كمية مجاناً';
      case OfferTypeEnum.Bundle: return 'باقة من القطع المختلفة بسعر مجمع';
      case OfferTypeEnum.PromoCode: return 'بروموكود للخصم على قطعة محددة لعدد مرات محدود';
      default: return 'اختر نوع العرض';
    }
  }

  getValueFieldLabel(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case OfferTypeEnum.NewPrice: return 'السعر الجديد';
      case OfferTypeEnum.Percentage: return 'نسبة الخصم (%)';
      case OfferTypeEnum.FixedAmount: return 'مبلغ الخصم الثابت';
      default: return 'القيمة';
    }
  }

  getValueFieldName(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case OfferTypeEnum.NewPrice: return 'newPrice';
      case OfferTypeEnum.Percentage: return 'discountRate';
      case OfferTypeEnum.FixedAmount: return 'fixedAmount';
      default: return 'value';
    }
  }

  getValueFieldPlaceholder(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case OfferTypeEnum.NewPrice: return 'مثال: 150.00';
      case OfferTypeEnum.Percentage: return 'مثال: 25';
      case OfferTypeEnum.FixedAmount: return 'مثال: 50.00';
      default: return 'أدخل القيمة';
    }
  }

  onClose(): void {
    this.offerForm.reset();
    this.closeModal.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.offerForm.valid) {
      try {
        const formData = { ...this.offerForm.value };
        
        // Format dates properly
        if (formData.startAt) {
          formData.startAt = new Date(formData.startAt).toISOString();
        }
        if (formData.endAt) {
          formData.endAt = new Date(formData.endAt).toISOString();
        }

        // Convert bundle parts array to CSV string for API compatibility
        if (formData.bundlePartIds && Array.isArray(formData.bundlePartIds)) {
          formData.bundlePartIdsCsv = formData.bundlePartIds.join(',');
          
          // Add bundle parts prices information
          const bundlePricesArray = formData.bundlePartIds.map((partId: number) => ({
            partId: partId,
            price: this.getBundlePartPrice(partId)
          }));
          
          // You can store this in a separate field or encode it somehow
          // For now, I'll add it as a JSON string comment or separate field
          formData.bundlePartsPrices = JSON.stringify(this.bundlePartsPrices);
          formData.bundleTotal = this.calculateBundleTotal();
        }

        let result;
        if (this.editingOffer?.id) {
          // Update existing offer
          result = await this.swaggerClient.apiOfferUpdatePost(formData).toPromise();
        } else {
          // Create new offer
          result = await this.swaggerClient.apiOfferInsertPost(formData).toPromise();
        }

        this.offerSaved.emit(result);
        this.onClose();
      } catch (error) {
        // Handle error - you can add a toast notification here
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.offerForm.markAllAsTouched();
    }
  }

  hasError(fieldName: string): boolean {
    const field = this.offerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.offerForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} مطلوب`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} يجب أن يكون 3 أحرف على الأقل`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} يجب أن يكون أكبر من أو يساوي 0`;
      if (field.errors['email']) return 'صيغة البريد الإلكتروني غير صحيحة';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      type: 'نوع العرض',
      partId: 'القطعة',
      newPrice: 'السعر الجديد',
      discountRate: 'نسبة الخصم',
      fixedAmount: 'مبلغ الخصم الثابت',
      buyQuantity: 'كمية الشراء',
      getQuantity: 'كمية المجان',
      freePartId: 'رقم القطعة المجانية',
      bundlePartIdsCsv: 'قطع الحزمة',
      bundlePartIds: 'قطع الحزمة',
      promoCode: 'البروموكود',
      promoCodeUsageLimit: 'عدد مرات الاستخدام المسموح',
      startAt: 'تاريخ البداية',
      endAt: 'تاريخ النهاية'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Get relative time in Arabic
  getRelativeTime(date: string | Date): string {
    const now = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffDays === 1) {
      return 'منذ يوم واحد';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `منذ ${months} ${months === 1 ? 'شهر' : 'شهور'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    }
  }
}

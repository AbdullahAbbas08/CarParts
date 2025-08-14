import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwaggerClient, OfferDTO } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.scss']
})
export class AddOfferComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() editingOffer: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() offerSaved = new EventEmitter<any>();

  offerForm: FormGroup;
  parts: any[] = []; // قائمة القطع المتاحة
  filteredParts: any[] = []; // القطع المفلترة للبحث
  isLoadingParts: boolean = false;

  offerTypes = [
    { value: 0, label: 'سعر جديد', icon: 'fa-tag' },
    { value: 1, label: 'خصم نسبة مئوية', icon: 'fa-percent' },
    { value: 2, label: 'خصم مبلغ ثابت', icon: 'fa-dollar-sign' },
    { value: 3, label: 'اشتري X خذ Y', icon: 'fa-gift' },
    { value: 4, label: 'باقة قطع', icon: 'fa-box' }
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
      console.log('Type changed to:', type); // للتشخيص
      this.updateValidators(type);
    });
  }

  // تحميل قائمة القطع المتاحة
  private loadParts(): void {
    this.isLoadingParts = true;
    
    // استخدام البيانات الوهمية مباشرة لأغراض التجربة
    console.log('Loading dummy parts data...');
    this.parts = this.getDummyParts();
    this.filteredParts = [...this.parts];
    this.isLoadingParts = false;
    console.log('Loaded', this.parts.length, 'parts');
    
    // يمكن تفعيل هذا الكود لاحقاً عندما يكون الـ API متاح
    /*
    this.swaggerClient.apiPartsGetAllGet(1000, 1, '') // تحميل أول 1000 قطعة
      .subscribe({
        next: (result: any) => {
          this.parts = result.data || [];
          this.filteredParts = [...this.parts];
          this.isLoadingParts = false;
        },
        error: (error: any) => {
          console.error('Error loading parts:', error);
          this.isLoadingParts = false;
          // في حالة عدم وجود API للقطع، استخدم بيانات وهمية
          this.parts = this.getDummyParts();
          this.filteredParts = [...this.parts];
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
    console.log('Searching for:', searchTerm);
    
    if (!searchTerm) {
      this.filteredParts = [...this.parts];
    } else {
      this.filteredParts = this.parts.filter(part => 
        part.name.toLowerCase().includes(searchTerm) ||
        part.code.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log('Filtered parts:', this.filteredParts.length);
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

  private updateValidators(type: number): void {
    // Clear all validators first
    this.clearAllValidators();
    
    // Set validators based on type
    switch (type) {
      case 0: // NewPrice
        this.offerForm.get('newPrice')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 1: // Percentage
        this.offerForm.get('discountRate')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
        break;
      case 2: // FixedAmount
        this.offerForm.get('fixedAmount')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 3: // BuyXGetY
        this.offerForm.get('buyQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        this.offerForm.get('getQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 4: // Bundle
        this.offerForm.get('bundlePartIdsCsv')?.setValidators([Validators.required]);
        break;
    }
    
    // Update validity
    this.offerForm.updateValueAndValidity();
  }

  private clearAllValidators(): void {
    const fields = ['newPrice', 'discountRate', 'fixedAmount', 'buyQuantity', 'getQuantity', 'bundlePartIdsCsv'];
    fields.forEach(field => {
      this.offerForm.get(field)?.clearValidators();
      this.offerForm.get(field)?.updateValueAndValidity();
    });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      id: [0],
      type: [0, Validators.required],
      partId: [null, Validators.required], // تغيير من 0 إلى null لتفعيل placeholder
      newPrice: [null],
      discountRate: [null, [Validators.min(0), Validators.max(100)]],
      fixedAmount: [null, [Validators.min(0)]],
      buyQuantity: [null, [Validators.min(1)]],
      getQuantity: [null, [Validators.min(1)]],
      freePartId: [null],
      bundlePartIdsCsv: [''],
      startAt: ['', Validators.required],
      endAt: ['', Validators.required],
      isActive: [true]
    });

    // Watch for type changes to trigger field display updates
    form.get('type')?.valueChanges.subscribe(value => {
      console.log('Form type value changed to:', value, typeof value);
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

      this.offerForm.patchValue({
        id: this.editingOffer.id || 0,
        type: this.editingOffer.type || 0,
        partId: this.editingOffer.partId || null, // تغيير من 0 إلى null
        newPrice: this.editingOffer.newPrice || null,
        discountRate: this.editingOffer.discountRate || null,
        fixedAmount: this.editingOffer.fixedAmount || null,
        buyQuantity: this.editingOffer.buyQuantity || null,
        getQuantity: this.editingOffer.getQuantity || null,
        freePartId: this.editingOffer.freePartId || null,
        bundlePartIdsCsv: this.editingOffer.bundlePartIdsCsv || '',
        startAt: startDate,
        endAt: endDate,
        isActive: this.editingOffer.isActive !== undefined ? this.editingOffer.isActive : true
      });
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
    console.log('Type changed via event to:', type, typeof type);
    this.offerForm.get('type')?.setValue(type);
    this.updateValidators(type);
    this.cdr.detectChanges(); // Force change detection
  }

  // Functions to show/hide fields based on offer type
  shouldShowNewPriceField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    console.log('shouldShowNewPriceField - type:', type, 'result:', type === 0);
    return type === 0;
  }

  shouldShowDiscountRateField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    console.log('shouldShowDiscountRateField - type:', type, 'result:', type === 1);
    return type === 1;
  }

  shouldShowFixedAmountField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    console.log('shouldShowFixedAmountField - type:', type, 'result:', type === 2);
    return type === 2;
  }

  shouldShowQuantityFields(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    console.log('shouldShowQuantityFields - type:', type, 'result:', type === 3);
    return type === 3;
  }

  shouldShowBundleField(): boolean {
    const type = parseInt(this.offerForm.get('type')?.value);
    console.log('shouldShowBundleField - type:', type, 'result:', type === 4);
    return type === 4;
  }

  // Helper function for backward compatibility
  shouldShowValueField(): boolean {
    const type = this.offerForm.get('type')?.value;
    return type === 0 || type === 1 || type === 2; // NewPrice, Percentage, FixedAmount
  }

  getOfferTypeDescription(): string {
    const type = this.offerForm.get('type')?.value;
    console.log('getOfferTypeDescription - current type:', type, typeof type);
    switch (type) {
      case 0: return 'تحديد سعر جديد للقطعة';
      case 1: return 'خصم بنسبة مئوية من السعر الأصلي';
      case 2: return 'خصم بمبلغ ثابت من السعر الأصلي';
      case 3: return 'عرض اشتري كمية محددة واحصل على كمية مجاناً';
      case 4: return 'باقة من القطع المختلفة بسعر مجمع';
      default: return 'اختر نوع العرض';
    }
  }

  getValueFieldLabel(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case 0: return 'السعر الجديد';
      case 1: return 'نسبة الخصم (%)';
      case 2: return 'مبلغ الخصم الثابت';
      default: return 'القيمة';
    }
  }

  getValueFieldName(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case 0: return 'newPrice';
      case 1: return 'discountRate';
      case 2: return 'fixedAmount';
      default: return 'value';
    }
  }

  getValueFieldPlaceholder(): string {
    const type = this.offerForm.get('type')?.value;
    switch (type) {
      case 0: return 'مثال: 20';
      case 1: return 'مثال: 100';
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
        console.error('Error saving offer:', error);
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
      startAt: 'تاريخ البداية',
      endAt: 'تاريخ النهاية'
    };
    return fieldNames[fieldName] || fieldName;
  }
}

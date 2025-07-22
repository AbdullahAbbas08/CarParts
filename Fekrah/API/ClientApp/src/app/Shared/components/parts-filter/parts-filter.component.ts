import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-parts-filter',
  templateUrl: './parts-filter.component.html',
  styleUrls: ['./parts-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartsFilterComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() closeFilter = new EventEmitter<void>();

  filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  // بيانات الماركات
  readonly brands = [
    { value: 'toyota', label: 'تويوتا' },
    { value: 'hyundai', label: 'هيونداي' },
    { value: 'kia', label: 'كيا' },
    { value: 'nissan', label: 'نيسان' },
    { value: 'honda', label: 'هوندا' },
    { value: 'mitsubishi', label: 'ميتسوبيشي' },
    { value: 'suzuki', label: 'سوزوكي' },
    { value: 'ford', label: 'فورد' },
    { value: 'chevrolet', label: 'شيفروليه' },
    { value: 'bmw', label: 'بي إم دبليو' },
    { value: 'mercedes', label: 'مرسيدس' },
    { value: 'audi', label: 'أودي' }
  ];

  // الموديلات حسب الماركة
  readonly modelsByBrand: { [key: string]: string[] } = {
    toyota: ['كورولا', 'كامري', 'يارس', 'هايلاندر', 'راف 4', 'لاند كروزر', 'برادو'],
    hyundai: ['النترا', 'سوناتا', 'أكسنت', 'توسان', 'سانتافي', 'فيرنا', 'كريتا'],
    kia: ['سيراتو', 'سبورتاج', 'ريو', 'سورينتو', 'كارنيفال', 'بيكانتو', 'أوبتيما'],
    nissan: ['صني', 'التيما', 'ماكسيما', 'اكس تريل', 'باترول', 'تيدا', 'جوك'],
    honda: ['سيفيك', 'أكورد', 'سي آر في', 'بايلوت', 'فيت', 'اوديسي'],
    mitsubishi: ['لانسر', 'أوتلاندر', 'باجيرو', 'ميراج', 'اكليبس كروس'],
    suzuki: ['سويفت', 'فيتارا', 'جيمني', 'التو', 'اسبريسو'],
    ford: ['فوكس', 'فيوجن', 'اكسبلورر', 'ايدج', 'فييستا', 'اكوسبورت'],
    chevrolet: ['كروز', 'ماليبو', 'تاهو', 'سوبربان', 'كابتيفا', 'افيو'],
    bmw: ['الفئة الثالثة', 'الفئة الخامسة', 'اكس 3', 'اكس 5', 'الفئة السابعة', 'اكس 1'],
    mercedes: ['الفئة سي', 'الفئة اي', 'الفئة اس', 'جي ال اي', 'جي ال سي', 'سي ال ايه'],
    audi: ['ايه 3', 'ايه 4', 'ايه 6', 'كيو 5', 'كيو 7', 'ايه 8', 'كيو 3']
  };

  // فئات القطع
  readonly partCategories = [
    'محرك وقطع غيار',
    'فرامل ونظام التعليق',
    'كهرباء وإلكترونيات',
    'هيكل وصبغ',
    'داخلية السيارة',
    'إطارات وجنوط',
    'زيوت وسوائل',
    'فلاتر وقطع صيانة',
    'مكيف وتبريد',
    'عوادم ونظام الحقن'
  ];

  // أنواع القطع (جديد بناءً على CarPart.partType)
  readonly partTypes = [
    'محرك كامل', 'مساعد', 'فلتر زيت', 'فلتر هواء', 'مكبح', 'مصباح أمامي',
    'شبك أمامي', 'مرايا جانبية', 'مضخة مياه', 'رادياتير', 'دينامو', 'بطارية',
    'طرمبة بنزين', 'كمبروسر تكييف', 'مقصات', 'مساعدات', 'فحمات فرامل'
  ];

  // حالات القطع (محدثة لتطابق قيم الـ HTML)
  readonly conditions = [
    { value: '', label: 'الكل' },
    { value: 'جديد', label: 'جديد' },
    { value: 'مستعمل', label: 'مستعمل' },
    { value: 'مستورد', label: 'مستورد' }
  ];

  // جودة القطعة (جديد بناءً على CarPart.grade)
  readonly grades = [
    { value: '', label: 'الكل' },
    { value: 'فرز أول', label: 'فرز أول' },
    { value: 'فرز تاني', label: 'فرز ثاني' }
  ];

  // بلد المنشأ (جديد بناءً على CarPart.origin)
  readonly origins = [
    'اليابان', 'ألمانيا', 'أمريكا', 'كوريا الجنوبية', 'الصين', 'فرنسا', 'إيطاليا', 'السويد', 'الهند'
  ];

  // نطاقات الأسعار
  readonly priceRanges = [
    { value: '', label: 'أي سعر' },
    { value: '0-100', label: 'أقل من 100 ريال' },
    { value: '100-500', label: '100 - 500 ريال' },
    { value: '500-1000', label: '500 - 1000 ريال' },
    { value: '1000-5000', label: '1000 - 5000 ريال' },
    { value: '5000+', label: 'أكثر من 5000 ريال' }
  ];

  models: string[] = [];
  years: number[] = [];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
    this.generateYears();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      brand: [''],
      model: [''],
      year: [''],
      partCategory: [''],
      partType: [''],
      condition: [''],
      grade: [''],
      origin: [''],
      priceRange: [''],
      inStock: [false]
    });
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  }

  private setupFormSubscriptions(): void {
    // تأخير البحث لتحسين الأداء
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.filtersChanged.emit(values);
      });

    // مراقبة تغيير الماركة لتحديث الموديلات
    this.filterForm.get('brand')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(brandValue => {
        this.updateModels(brandValue);
      });
  }

  private updateModels(brandValue: string): void {
    this.models = brandValue ? (this.modelsByBrand[brandValue] || []) : [];

    // إعادة تعيين الموديل عند تغيير الماركة إذا كان الموديل الحالي غير متاح للماركة الجديدة
    if (this.filterForm.get('model')?.value && this.models.length > 0) {
      const currentModel = this.filterForm.get('model')?.value;
      if (!this.models.includes(currentModel)) {
        this.filterForm.patchValue({ model: '' }, { emitEvent: false });
      }
    } else if (this.models.length === 0) {
        // إذا لم تعد هناك موديلات للماركة، قم بإعادة تعيين حقل الموديل
        this.filterForm.patchValue({ model: '' }, { emitEvent: false });
    }
  }

  // إغلاق الفلتر
  onClose(): void {
    this.closeFilter.emit();
  }

  // إعادة تعيين الفلاتر
  resetFilters(): void {
    this.filterForm.reset({
      searchText: '',
      brand: '',
      model: '',
      year: '',
      partCategory: '',
      partType: '',
      condition: '',
      grade: '',
      origin: '',
      priceRange: '',
      inStock: false
    });
    this.models = []; // إعادة تعيين الموديلات أيضًا
  }

  // تطبيق فلتر سريع
  applyQuickFilter(filterType: string, value: any): void {
    const updates: { [key: string]: any } = {};
    // إذا كان نفس الفلتر، قم بتبديل القيمة لإلغاء التفعيل
    // هذا يسمح للمستخدم بالضغط مرة أخرى لإلغاء الفلتر السريع المطبق
    if (this.filterForm.get(filterType)?.value === value) {
      updates[filterType] = (typeof value === 'boolean') ? !value : ''; // تبديل القيمة للبوليان، أو إعادة تعيين للسترينغ
    } else {
      updates[filterType] = value;
    }
    this.filterForm.patchValue(updates);
  }

  // التحقق من وجود فلاتر نشطة
  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return Object.keys(formValue).some(key => {
      const value = formValue[key];
      // تحقق خاص للـ checkboxes والقيم الفارغة
      if (typeof value === 'boolean') {
        return value === true;
      }
      return value !== null && value !== undefined && value !== '';
    });
  }

  // عدد الفلاتر النشطة
  getActiveFiltersCount(): number {
    const formValue = this.filterForm.value;
    return Object.keys(formValue).filter(key => {
      const value = formValue[key];
      if (typeof value === 'boolean') {
        return value === true;
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
  }

  // الحصول على نص الفلتر النشط لعرضه
  getActiveFilterText(filterName: string): string {
    const value = this.filterForm.get(filterName)?.value;
    if (!value) return '';

    switch (filterName) {
      case 'brand':
        const brand = this.brands.find(b => b.value === value);
        return brand ? brand.label : value.toString();
      case 'condition':
        const condition = this.conditions.find(c => c.value === value);
        return condition ? condition.label : value.toString();
      case 'grade':
        const grade = this.grades.find(g => g.value === value);
        return grade ? grade.label : value.toString();
      case 'origin':
        return value.toString();
      case 'priceRange':
        const range = this.priceRanges.find(r => r.value === value);
        return range ? range.label : value.toString();
      case 'partType':
        return value.toString();
      default:
        return value.toString();
    }
  }

  // دالة لإظهار معلومات إضافية عن الفلتر
  getFilterSummary(): string {
    const activeCount = this.getActiveFiltersCount();
    if (activeCount === 0) {
      return 'لا توجد فلاتر مطبقة';
    }
    return `${activeCount} فلتر مطبق`;
  }
}

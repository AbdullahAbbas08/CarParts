import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { API_BASE_URL, DataSourceResultOfBrandDTO, FileTypeEnum, ImageDTO, LookupDTO, PartDTO, SwaggerClient, CategoryDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { CarPart } from '../../Shared/Models/car-card';

interface PartType {
  value: number;
  label: string;
  icon: string;
  color: string;
}

interface Store {
  name: string;
  phone: string;
  address?: string;
}

interface CarCombo {
  name: string;
  brand: string;
  model: string;
  year: string;
}

interface ImageFile {
  file: File;
  url: string;
  isMain: boolean;
}

@Component({
  selector: 'app-quick-add-form',
  templateUrl: './quick-add-form.component.html',
  styleUrls: ['./quick-add-form.component.scss']
})
export class QuickAddFormComponent implements OnInit, OnDestroy {
  @ViewChild('imageInput', { static: false }) imageInput!: ElementRef<HTMLInputElement>;
  
  // Edit mode inputs
  @Input() editMode: boolean = false;
  @Input() editingPart: CarPart | null = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  partForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  isDragOver = false;
  baseUrl: string;
   headers!: HttpHeaders;
  partNames: string[] = [
    'بطارية',
    'فلتر زيت',
    'مبرد',
    'بواجي',
    'طقم كشافات',
    'كفر',
    'ماطور'
    // أضف أسماء أخرى حسب حاجتك
  ];


  partTypes: PartType[] = [
    { value: 1, label: 'أصلي', icon: 'fas fa-star', color: '#38a169' },
    { value: 2, label: 'هاي كوبي', icon: 'fas fa-industry', color: '#3182ce' },
    { value: 3, label: 'بديل', icon: 'fas fa-tools', color: '#d69e2e' }
  ];

  conditionOptions = [{value:1,label:'جديد'}, {value:2,label:'مستعمل'}];
  gradeOptions = [{value:1,label:'فرز أول'},{value:2,label:'فرز ثاني'} ];

  availableCarBrands:any[] = [];
  filteredCarModels: any[] = [];
  allCarModels: any[] = []; // Store all models for filtering
  availableYears: string[] = [];
  imageTypeEnum!:FileTypeEnum;
  stores: any[] = []
  category:any[]=[]
  allcountries:LookupDTO[]= []
  popularCombos: CarCombo[] = [
    { name: 'تويوتا كامري 2020', brand: 'تويوتا', model: 'كامري', year: '2020' },
    { name: 'هوندا أكورد 2019', brand: 'هوندا', model: 'أكورد', year: '2019' },
    { name: 'نيسان التيما 2021', brand: 'نيسان', model: 'التيما', year: '2021' },
    { name: 'هيونداي النترا 2020', brand: 'هيونداي', model: 'النترا', year: '2020' }
  ];

  images: ImageFile[] = [];
  lastSubmittedPart: any = null;
  allcategories:CategoryDTO[]=[]
  private destroy$ = new Subject<void>();

  private carModels: { [brand: string]: string[] } = {
    'تويوتا': ['كامري', 'كورولا', 'أفالون', 'راف فور', 'هايلاندر', 'برادو'],
    'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'أوديسي'],
    'نيسان': ['التيما', 'سنترا', 'مكسيما', 'روج', 'باثفايندر', 'أرمادا'],
    'هيونداي': ['النترا', 'سوناتا', 'أزيرا', 'توكسان', 'سانتا في'],
    'كيا': ['أوبتيما', 'فورتي', 'كادينزا', 'سورينتو', 'سبورتاج'],
    'مازدا': ['مازدا 6', 'مازدا 3', 'سي إكس 5', 'سي إكس 9'],
    'فورد': ['فيوجن', 'فوكس', 'إكسبلورر', 'إكسبيديشن'],
    'شيفروليه': ['ماليبو', 'إمبالا', 'تاهو', 'سوبربان']
  };

  constructor(private fb: FormBuilder,private swagger:SwaggerClient,@Inject(API_BASE_URL) baseUrl: string, private http: HttpClient) {
    this.initializeForm();
    this.generateYears();
    this.baseUrl = baseUrl;
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.setupKeyboardShortcuts();
    this.loadDraftIfExists();
    this.updateProgress();
    this.getAllCarBrands();
    this.getAllModelTypes();
    this.getAllMerchant();
    this.getAllCounties();
    this.getAllCategory();
    
    // If in edit mode, populate the form with existing data
    if (this.editMode && this.editingPart) {
      this.populateFormForEdit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateFormForEdit(): void {
    if (!this.editingPart) return;
    
    const part = this.editingPart;
    
    // Map CarPart data back to form values
    this.partForm.patchValue({
      partName: part.name,
      subtitle: part.subtitle,
      condition: part.condition === 'جديد' ? 1 : 2,
      grade: part.grade === 'فرز أول' ? 1 : 2,
      carBrand: this.findBrandIdByName(part.car.brand),
      carModel: this.findModelIdByName(part.car.model),
      carYear: parseInt(part.car.year),
      price: part.price,
      storeName: this.findStoreIdByName(part.store.name),
      storePhone: part.store.phone
    });
    
    // Map part type
    switch (part.partType) {
      case 'أصلي': this.partForm.patchValue({ partType: 1 }); break;
      case 'هاي كوبي': this.partForm.patchValue({ partType: 2 }); break;
      case 'بديل': this.partForm.patchValue({ partType: 3 }); break;
    }
    
    // Set origin (country)
    const originId = this.findCountryIdByName(part.origin);
    if (originId) {
      this.partForm.patchValue({ origin: originId });
    }
    
    console.log('Form populated for edit:', this.partForm.value);
  }

  private findBrandIdByName(brandName: string): number | null {
    const brand = this.availableCarBrands.find(b => b.name === brandName);
    return brand ? brand.id : null;
  }

  private findModelIdByName(modelName: string): number | null {
    const model = this.allCarModels.find(m => m.name === modelName);
    return model ? model.id : null;
  }

  private findStoreIdByName(storeName: string): number | null {
    const store = this.stores.find(s => s.shopName === storeName);
    return store ? store.id : null;
  }

  private findCountryIdByName(countryName: string): number | null {
    const country = this.allcountries.find(c => c.text === countryName);
    return country ? country.id : null;
  }

  private initializeForm(): void {
    this.partForm = this.fb.group({
      partName: ['', [Validators.required, Validators.minLength(2)]],
      origin: ['', [Validators.required]],
      partType: ['', Validators.required],
      category: ['', Validators.required],
      condition: ['جديد', Validators.required],
      grade: ['فرز أول', Validators.required],
      hasDelivery: [false],
      isFavorite: [false],
      subtitle: [''],
 
      carBrand: ['', Validators.required],
      carModel: ['', Validators.required],
      carYear: ['', Validators.required],

      price: ['', [Validators.required, Validators.min(0.01)]],
      storeName: ['', Validators.required],
      storePhone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],

      mainImageIndex: [0]
    });
  }

  private setupFormSubscriptions(): void {
    this.partForm.get('carBrand')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.onBrandChange());
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 30; year--) {
      this.availableYears.push(year.toString());
    }
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Escape key to cancel in edit mode
      if (e.key === 'Escape' && this.editMode) {
        e.preventDefault();
        this.formCancelled.emit();
        return;
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!this.editMode) this.saveAsDraft();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (!this.editMode) this.duplicateLastEntry();
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (this.currentStep === this.totalSteps) this.submitForm();
        else this.changeStep(1);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (!this.editMode) this.submitAndAddAnother();
      }
      if (e.key === 'Enter' && e.target && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (this.currentStep < this.totalSteps) this.changeStep(1);
      }
    });
  }

  changeStep(direction: number): void {
    const newStep = this.currentStep + direction;
    if (newStep < 1 || newStep > this.totalSteps) return;

    if (direction > 0 && !this.validateCurrentStep()) return;

    this.currentStep = newStep;
    this.updateProgress();  // ← أضف هذه السطر هنا
    this.scrollToTop();
  }


  private validateCurrentStep(): boolean {
    const validatorsMap: Record<number, string[]> = {
      1: ['partName', 'origin', 'partType'],
      2: ['carBrand', 'carModel', 'carYear'],
      3: ['price', 'storeName', 'storePhone'],
      4: []
    };

    let valid = true;
    (validatorsMap[this.currentStep] || []).forEach(ctrlName => {
      const ctrl = this.partForm.get(ctrlName);
      if (ctrl) {
        ctrl.markAsTouched();
        if (ctrl.invalid) valid = false;
      }
    });

    return valid;
  }

  onBrandChange(): void {
    const selectedBrandId = this.partForm.get('carBrand')?.value;
    if (selectedBrandId) {
      // Filter models based on selected brand
      this.filteredCarModels = this.allCarModels.filter(model => model.brandId == selectedBrandId);
    } else {
      // If no brand selected, show all models
      this.filteredCarModels = [...this.allCarModels];
    }
    // Reset model and year when brand changes
    this.partForm.patchValue({ carModel: '', carYear: '' });
  }

  selectPopularCombo(combo: CarCombo): void {
    this.partForm.patchValue({
      carBrand: combo.brand,
      carModel: combo.model,
      carYear: combo.year
    });
    this.filteredCarModels = this.carModels[combo.brand] || [];
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(Array.from(input.files));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  private processFiles(files: File[]): void {
    files.forEach(file => {
      if (!this.isValidImageFile(file)) return;
      const reader = new FileReader();
      reader.onload = e => {
        this.images.push({
          file,
          url: e.target?.result as string,
          isMain: this.images.length === 0
        });
      };
      reader.readAsDataURL(file);
    });
    this.prepareImagesData(files);
  }
  imagesNames:ImageDTO[]=[]
private prepareImagesData(files: File[], slug?: string) {
  if (!files?.length) return;

  const formData = new FormData();
  for (const f of files) formData.append('file', f, f.name)

  const fileType = FileTypeEnum.Parts; // Use the correct enum value for Parts
  const params = new HttpParams().set('fileType', String(fileType));

  this.http.post(`${this.baseUrl}/api/File/UploadFile`, formData, {
    reportProgress: true,
    observe: 'events',
    params
  }).subscribe({
    next: (event) => {
      if ((event as any)?.type === HttpEventType.Response) {
        console.log('Upload response:', (event as any)?.body); // Debug log
        const responseBody = (event as any)?.body;
        
        // Handle both single object and array responses
        const uploadResults = Array.isArray(responseBody) ? responseBody : [responseBody];
        
        uploadResults.forEach((result: any) => {
          if (result?.fileName) {
            // Use the proper ImageDTO constructor
            let images = new ImageDTO({
              id: 0,
              imagePath: result.fileName
            });
            this.imagesNames.push(images);
          }
        });
      }
    },
    error: (error) => {
      console.error('Upload error:', error);
      alert('فشل في رفع الصورة');
    }
  });
}
    
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF, WEBP)');
      return false;
    }
    if (file.size > maxSize) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return false;
    }
    return true;
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    if (this.images.length > 0 && !this.images.some(img => img.isMain)) {
      this.images[0].isMain = true;
      this.partForm.patchValue({ mainImageIndex: 0 });
    }
  }

  setMainImage(index: number): void {
    this.images.forEach((img, i) => img.isMain = i === index);
    this.partForm.patchValue({ mainImageIndex: index });
  }

  submitForm(): void {
    if (!this.partForm.valid) {
      this.markAllFieldsAsTouched();
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    // Check if we have images with valid paths (skip for edit mode)
    if (!this.editMode && (this.imagesNames.length === 0 || !this.imagesNames.some(img => img.imagePath))) {
      alert('يرجى رفع صورة واحدة على الأقل للقطعة');
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();

    setTimeout(() => {
      this.lastSubmittedPart = { ...formData };
      this.isLoading = false;
      
      // Emit the form data to the parent component
      this.formSubmitted.emit(formData);
      
      if (!this.editMode) {
        // Only reset form if not in edit mode
        this.resetForm();
      }
    }, 1500);
  }

  submitAndAddAnother(): void {
    if (!this.partForm.valid) {
      this.markAllFieldsAsTouched();
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();

    setTimeout(() => {
      this.lastSubmittedPart = { ...formData };
      this.isLoading = false;
      alert('تم حفظ القطعة بنجاح! سيتم إضافة قطعة جديدة...');
      this.resetFormForNewEntry();
    }, 1500);
  }

  private prepareFormData(): any {
    const formValue = this.partForm.getRawValue();
    return {
      ...formValue,
      images: this.images.map(img => ({ file: img.file, isMain: img.isMain })),
      submittedAt: new Date(),
      id: this.generateId()
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  saveAsDraft(): void {
    const draft = {
      formValue: this.partForm.value,
      currentStep: this.currentStep,
      images: this.images.map(img => ({ url: img.url, isMain: img.isMain })),
      savedAt: new Date()
    };
    localStorage.setItem('partFormDraft', JSON.stringify(draft));
    alert('تم حفظ المسودة بنجاح! 💾');
  }

  private loadDraftIfExists(): void {
    const draftJson = localStorage.getItem('partFormDraft');
    if (!draftJson) return;

    try {
      const draft = JSON.parse(draftJson);
      if (confirm('تم العثور على مسودة محفوظة. هل تريد استكمالها؟')) {
        this.partForm.patchValue(draft.formValue);
        this.currentStep = draft.currentStep || 1;
        // ملاحظة: الصور تحتاج معالجة خاصة لأنها ليست ملفات حقيقية
        alert('تم تحميل المسودة بنجاح!');
      }
    } catch (e) {
      console.error('خطأ في تحميل المسودة:', e);
    }
  }

  duplicateLastEntry(): void {
    if (!this.lastSubmittedPart) {
      alert('لا يوجد إدخال سابق للتكرار');
      return;
    }

    if (confirm('هل تريد تكرار آخر إدخال؟')) {
      this.partForm.patchValue({
        ...this.lastSubmittedPart,
        partName: '',
        price: ''
      });
      this.currentStep = 1;
      this.images = [];
      alert('تم تكرار البيانات! يرجى تعديل اسم القطعة والسعر.');
    }
  }

  private resetForm(): void {
    this.partForm.reset();
    this.initializeDefaultValues();
    this.currentStep = 1;
    this.progressPercent = 0;
    this.images = [];
    this.filteredCarModels = [];
    localStorage.removeItem('partFormDraft');
  }

  private resetFormForNewEntry(): void {
    const storeInfo = {
      storeName: this.partForm.get('storeName')?.value,
      storePhone: this.partForm.get('storePhone')?.value
    };
    this.resetForm();
    this.partForm.patchValue(storeInfo);
  }

  private initializeDefaultValues(): void {
    this.partForm.patchValue({
      condition: 'جديد',
      grade: 'فرز أول',
      hasDelivery: false,
      isFavorite: false,
      discount: 0,
      mainImageIndex: 0
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.partForm.controls).forEach(ctrl => ctrl.markAsTouched());
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.partForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.partForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'هذا الحقل مطلوب';
    if (field.errors['minlength']) return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
    if (field.errors['min']) return `القيمة يجب أن تكون أكبر من ${field.errors['min'].min}`;
    if (field.errors['max']) return `القيمة يجب أن تكون أقل من ${field.errors['max'].max}`;
    if (field.errors['pattern']) return 'تنسيق غير صحيح';

    return 'قيمة غير صحيحة';
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByValue(index: number, item: any): any {
    return item.value || item;
  }

  trackByComboName(index: number, item: CarCombo): string {
    return item.name;
  }

  trackByStoreName(index: number, item: Store): string {
    return item.name;
  }

  trackByImageUrl(index: number, item: ImageFile): string {
    return item.url;
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress();
      this.scrollToTop();
    }
  }


  progressPercent = 0;

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateProgress();
        this.scrollToTop();
      } else {
        this.showValidationErrors();
      }
    } else {
      this.submitForm();
    }
  }

  updateProgress(): void {
    const stepCount = this.totalSteps - 1; // 3 فواصل بين 4 خطوات
    const totalLineWidth = 80; // 80% لأن الخط يبدأ عند 10% وينتهي عند 90%
    const stepWidth = totalLineWidth / stepCount; // 26.6666%

    this.progressPercent = (this.currentStep - 1) * stepWidth;
  }




  private showValidationErrors(): void {
    const invalids: string[] = [];
    Object.keys(this.partForm.controls).forEach(key => {
      const ctrl = this.partForm.get(key);
      if (ctrl && ctrl.invalid && ctrl.touched) invalids.push(key);
    });

    if (invalids.length) alert(`يرجى تعبئة الحقول المطلوبة: ${invalids.join(', ')}`);
  }

  // ----- Getters for complex expressions to avoid Angular template errors -----

  get selectedPartTypeLabel(): string {
    const val = this.partForm.get('partType')?.value;
    const pt = this.partTypes.find(pt => pt.value === val);
    return pt ? pt.label : 'غير محدد';
  }
  countries: string[] = ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'الأردن', 'لبنان', 'تركيا', 'ألمانيا', 'الصين'];

  get selectedCondition(): string {
    return this.partForm.get('condition')?.value || 'جديد';
  }

  // get progressPercent(): number {
  //   // 4 خطوات يعني 3 فواصل بينهم
  //   // نربط الخط الأخضر بالخطوات، مثلاً
  //   switch (this.currentStep) {
  //     case 1: return 33; // ما بين الخطوة 1 و 2
  //     case 2: return 66; // ما بين 2 و 3
  //     case 3: return 100; // ما بين 3 و 4
  //     case 4: return 100; // عند النهاية الخط كامل
  //     default: return 0;
  //   }
  // }

  get selectedGrade(): string {
    return this.partForm.get('grade')?.value || 'فرز أول';
  }

  get selectedCarDescription(): string {
    const brand = this.partForm.get('carBrand')?.value;
    const model = this.partForm.get('carModel')?.value;
    const year = this.partForm.get('carYear')?.value;
    if (brand && model && year) return `${brand} ${model} ${year}`;
    return 'غير محدد';
  }

  get selectedStoreName(): string {
    return this.partForm.get('storeName')?.value || 'غير محدد';
  }

  get selectedPrice(): string {
    const price = this.partForm.get('price')?.value;
    return price ? `${price} ج.م` : '0 ج.م';
  }

  get selectedFinalPrice(): string {
    const price = this.partForm.get('priceAfterDiscount')?.value;
    return price ? `${price} ج.م` : '0 ج.م';
  }

  get imagesCount(): string {
    return this.images.length === 0 ? '0 صورة' : `${this.images.length} صورة`;
  }

  triggerFileInputClick(): void {
    this.imageInput.nativeElement.click();
  }

  toggleDelivery(event: Event) {
    // إذا الضغط على الـ checkbox نفسه، لا نفعل التبديل مرتين
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
      return;
    }
    const control = this.partForm.get('hasDelivery');
    if (control) {
      control.setValue(!control.value);
    }
  }

  toggleCheckbox(event: Event, controlName: string) {
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
      return;
    }
    const control = this.partForm.get(controlName);
    if (control) {
      control.setValue(!control.value);
    }
  }
  getAllCarBrands(){
  this.swagger.apiBrandGetAllGet(50,1,undefined).subscribe((res:DataSourceResultOfBrandDTO) => {
        if(res){
           this.availableCarBrands = res.data;
        }
    })
  }
  getAllModelTypes() {
    this.swagger.apiModelTypeGetAllGet(50, 1, undefined).subscribe((res: any) => {
      if (res && res.data) {
        this.allCarModels = res.data; // Store all models
        this.filteredCarModels = res.data; // Initially show all models
      }
    });
  }
  getAllMerchant(){
      this.swagger.apiMerchantGetAllGet(50, 1, undefined).subscribe((res: any) => { 
            if (res && res.data) {
           this.stores = res.data;
         }
      })
  }
  getAllCounties(){
    this.swagger.apiLookupGetLookupGet('countryofmanufacture',undefined).subscribe((res:any) => {
      if(res){
        this.allcountries = res
      }
    })
  }
    getAllCategory(){
    this.swagger.apiCategoriesGetAllGet(50, 1, undefined).subscribe((res: any) => { 
            if (res && res.data) {
           this.category = res.data;
         }
      })
  }
}

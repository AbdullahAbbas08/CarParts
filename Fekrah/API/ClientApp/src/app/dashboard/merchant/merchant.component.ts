import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CarPart } from '../../Shared/Models/car-card';

export interface FilterOption {
  label: string;
  value: string;
  element?: any;
}

export interface MessageOptions {
  text: string;
  type: 'success' | 'info' | 'error';
}


@Component({
  selector: 'app-merchant',
  templateUrl: './merchant.component.html',
  styleUrl: './merchant.component.scss'
})
export class MerchantComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('advancedFilterPanel') advancedFilterPanel!: ElementRef;
  @ViewChild('activeFiltersContainer') activeFiltersContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Filter states
  activeFilters: { label: string; value: string }[] = [];
  currentFilters: FilterOption[] = [];
  isAdvancedOpen = false;
  showAdvancedFilters = false;

  // Data
  parts: CarPart[] = [];
  filteredParts: CarPart[] = [];
  availableBrands: string[] = [];

  // Search and filter values
  searchTerm = '';
  selectedBrand = '';
  selectedModel = '';
  yearFrom: number | null = null;
  yearTo: number | null = null;
  selectedCondition = '';
  selectedGrade = '';
  selectedPartType = '';
  priceFrom: number | null = null;
  priceTo: number | null = null;
  selectedOrigin = '';
  hasDelivery = false;
  hasWarranty = false;
  hasDiscount = false;
  favoritesOnly = false;
  selectedStore = '';
  selectedLocation = '';
  quantityFrom: number | null = null;
  quantityTo: number | null = null;
  selectedDateAdded = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  // View settings
  viewMode: 'grid' | 'list' = 'list';
  showQuickAddModal = false;
  isLoading = false;
  resultsCount = 120;

  constructor(private renderer: Renderer2) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.loadParts();
    this.setupQuickKeyboardShortcuts();
    this.extractAvailableBrands();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // تحسين دالة toggleAdvancedSearch
  toggleAdvancedSearch(): void {
    console.log('Toggle advanced search called. Current state:', this.isAdvancedOpen);

    if (!this.isAdvancedOpen) {
      // Show advanced filters
      this.showAdvancedFilters = true;
      this.isAdvancedOpen = true;

      console.log('Showing advanced filters...');

      // تحديث نص ومظهر الزر
      this.updateAdvancedSearchButton();

      // Add animation classes after DOM update
      setTimeout(() => {
        const panel = document.getElementById('advancedFilterPanel');
        if (panel) {
          panel.classList.add('active');
          panel.classList.add('slide-down');
          console.log('Added active classes to panel');
        }
      }, 10);

    } else {
      // Hide advanced filters
      console.log('Hiding advanced filters...');
      this.isAdvancedOpen = false;

      // تحديث نص ومظهر الزر
      this.updateAdvancedSearchButton();

      const panel = document.getElementById('advancedFilterPanel');
      if (panel) {
        panel.classList.remove('active');
        panel.classList.remove('slide-down');
        console.log('Removed active classes from panel');
      }

      // Hide after animation
      setTimeout(() => {
        this.showAdvancedFilters = false;
      }, 500);
    }
  }

  updateAdvancedSearchButton(): void {
    const button = document.getElementById('advancedSearchToggle');

    if (button) {
      if (this.isAdvancedOpen) {
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-times"></i> إغلاق البحث المتقدم';
      } else {
        button.classList.remove('active');
        button.innerHTML = '<i class="fas fa-filter"></i> البحث المتقدم';
      }
    }
  }

  // التأكد من أن panel موجود في DOM
  ensureAdvancedFilterPanel(): void {
    let panel = document.getElementById('advancedFilterPanel');

    if (!panel) {
      console.warn('Advanced filter panel not found in DOM');
      // يمكنك إنشاؤه ديناميكياً إذا لزم الأمر
    }
  }


  // Legacy support for existing template
  toggleAdvancedFilters(): void {
    this.toggleAdvancedSearch();
  }

  // View toggle functionality
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    console.log('Changed view to:', mode);
  }

  // Search functionality with live feedback
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
    this.updateResultsCount();
  }

  // Update results count based on search and filters
  updateResultsCount(): void {
    const activeFiltersCount = this.activeFilters.length;
    const searchTerm = this.searchTerm;
    const baseCount = this.parts.length;

    let filteredCount = baseCount;
    if (searchTerm) filteredCount = Math.max(10, filteredCount - 20);
    if (activeFiltersCount > 0) filteredCount = Math.max(5, filteredCount - (activeFiltersCount * 10));

    this.resultsCount = Math.max(5, filteredCount);
  }

  // Update active filters display
  updateActiveFilters(): void {
    this.activeFilters = [];
    this.currentFilters = [];

    // Check search term
    if (this.searchTerm.trim()) {
      this.activeFilters.push({ label: 'بحث', value: this.searchTerm });
    }

    // Check all select filters
    if (this.selectedBrand) {
      this.activeFilters.push({ label: 'ماركة السيارة', value: this.selectedBrand });
    }
    if (this.selectedModel) {
      this.activeFilters.push({ label: 'موديل السيارة', value: this.selectedModel });
    }
    if (this.selectedCondition) {
      this.activeFilters.push({ label: 'حالة القطعة', value: this.selectedCondition });
    }
    if (this.selectedGrade) {
      this.activeFilters.push({ label: 'درجة الجودة', value: this.selectedGrade });
    }
    if (this.selectedPartType) {
      this.activeFilters.push({ label: 'نوع القطعة', value: this.selectedPartType });
    }
    if (this.selectedOrigin) {
      this.activeFilters.push({ label: 'بلد المنشأ', value: this.selectedOrigin });
    }
    if (this.selectedStore) {
      this.activeFilters.push({ label: 'المتجر/المورد', value: this.selectedStore });
    }
    if (this.selectedLocation) {
      this.activeFilters.push({ label: 'الموقع/المحافظة', value: this.selectedLocation });
    }
    if (this.selectedDateAdded) {
      this.activeFilters.push({ label: 'تاريخ الإضافة', value: this.selectedDateAdded });
    }

    // Check range inputs
    if (this.yearFrom || this.yearTo) {
      const value = `${this.yearFrom || 'غير محدد'} - ${this.yearTo || 'غير محدد'}`;
      this.activeFilters.push({ label: 'سنة الصنع', value });
    }
    if (this.priceFrom || this.priceTo) {
      const value = `${this.priceFrom || 'غير محدد'} - ${this.priceTo || 'غير محدد'}`;
      this.activeFilters.push({ label: 'نطاق السعر (جنيه)', value });
    }
    if (this.quantityFrom || this.quantityTo) {
      const value = `${this.quantityFrom || 'غير محدد'} - ${this.quantityTo || 'غير محدد'}`;
      this.activeFilters.push({ label: 'الكمية المتاحة', value });
    }

    // Check toggle switches
    if (this.hasDelivery) {
      this.activeFilters.push({ label: 'يوجد توصيل', value: 'مفعل' });
    }
    if (this.hasWarranty) {
      this.activeFilters.push({ label: 'يوجد ضمان', value: 'مفعل' });
    }
    if (this.hasDiscount) {
      this.activeFilters.push({ label: 'يوجد خصم', value: 'مفعل' });
    }
    if (this.favoritesOnly) {
      this.activeFilters.push({ label: 'المفضلة فقط', value: 'مفعل' });
    }

    this.updateResultsCount();
  }

  // Remove specific filter
  removeFilter(filter: { label: string; value: string }): void {
    switch (filter.label) {
      case 'بحث':
        this.searchTerm = '';
        break;
      case 'ماركة السيارة':
        this.selectedBrand = '';
        break;
      case 'موديل السيارة':
        this.selectedModel = '';
        break;
      case 'سنة الصنع':
        this.yearFrom = null;
        this.yearTo = null;
        break;
      case 'حالة القطعة':
        this.selectedCondition = '';
        break;
      case 'درجة الجودة':
        this.selectedGrade = '';
        break;
      case 'نوع القطعة':
        this.selectedPartType = '';
        break;
      case 'نطاق السعر (جنيه)':
        this.priceFrom = null;
        this.priceTo = null;
        break;
      case 'بلد المنشأ':
        this.selectedOrigin = '';
        break;
      case 'يوجد توصيل':
        this.hasDelivery = false;
        break;
      case 'يوجد ضمان':
        this.hasWarranty = false;
        break;
      case 'يوجد خصم':
        this.hasDiscount = false;
        break;
      case 'المفضلة فقط':
        this.favoritesOnly = false;
        break;
      case 'المتجر/المورد':
        this.selectedStore = '';
        break;
      case 'الموقع/المحافظة':
        this.selectedLocation = '';
        break;
      case 'الكمية المتاحة':
        this.quantityFrom = null;
        this.quantityTo = null;
        break;
      case 'تاريخ الإضافة':
        this.selectedDateAdded = '';
        break;
      default:
        break;
    }
    this.applyFilters();
  }

  // Apply all filters
  applyFilters(): void {
    let filtered = [...this.parts];
    const searchLower = this.searchTerm.trim().toLowerCase();

    if (searchLower) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchLower) ||
        part.car.brand.toLowerCase().includes(searchLower) ||
        part.car.model.toLowerCase().includes(searchLower) ||
        part.store.name.toLowerCase().includes(searchLower) ||
        part.origin.toLowerCase().includes(searchLower)
      );
    }

    if (this.selectedBrand) {
      filtered = filtered.filter(part => part.car.brand === this.selectedBrand);
    }
    if (this.selectedModel) {
      filtered = filtered.filter(part => part.car.model === this.selectedModel);
    }
    if (this.yearFrom !== null) {
      filtered = filtered.filter(part => Number(part.car.year) >= this.yearFrom!);
    }
    if (this.yearTo !== null) {
      filtered = filtered.filter(part => Number(part.car.year) <= this.yearTo!);
    }
    if (this.selectedCondition) {
      filtered = filtered.filter(part => part.condition === this.selectedCondition);
    }
    if (this.selectedGrade) {
      filtered = filtered.filter(part => part.grade === this.selectedGrade);
    }
    if (this.selectedPartType) {
      filtered = filtered.filter(part => part.partType === this.selectedPartType);
    }
    if (this.priceFrom !== null) {
      filtered = filtered.filter(part => part.priceAfterDiscount >= this.priceFrom!);
    }
    if (this.priceTo !== null) {
      filtered = filtered.filter(part => part.priceAfterDiscount <= this.priceTo!);
    }
    if (this.selectedOrigin) {
      filtered = filtered.filter(part => part.origin === this.selectedOrigin);
    }
    if (this.hasDelivery) {
      filtered = filtered.filter(part => part.hasDelivery === true);
    }
    if (this.hasWarranty) {
      filtered = filtered.filter(part => part.hasWarranty === true);
    }
    if (this.hasDiscount) {
      filtered = filtered.filter(part => part.discount > 0);
    }
    if (this.favoritesOnly) {
      filtered = filtered.filter(part => part.isFavorite === true);
    }
    if (this.selectedStore) {
      filtered = filtered.filter(part => part.store.name === this.selectedStore);
    }

    this.filteredParts = filtered;
    this.updateActiveFilters();
    this.calculatePagination();
    this.currentPage = 1;
  }

  // Apply all filters (for button)
  applyAllFilters(): void {
    this.isLoading = true;

    // Simulate loading
    setTimeout(() => {
      this.applyFilters();
      this.isLoading = false;
      this.showMessage('تم تطبيق الفلاتر بنجاح', 'success');

      // Optionally close advanced panel after applying
      if (this.isAdvancedOpen) {
        setTimeout(() => {
          this.toggleAdvancedSearch();
        }, 1000);
      }
    }, 1500);
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBrand = '';
    this.selectedModel = '';
    this.yearFrom = null;
    this.yearTo = null;
    this.selectedCondition = '';
    this.selectedGrade = '';
    this.selectedPartType = '';
    this.priceFrom = null;
    this.priceTo = null;
    this.selectedOrigin = '';
    this.hasDelivery = false;
    this.hasWarranty = false;
    this.hasDiscount = false;
    this.favoritesOnly = false;
    this.selectedStore = '';
    this.selectedLocation = '';
    this.quantityFrom = null;
    this.quantityTo = null;
    this.selectedDateAdded = '';

    this.activeFilters = [];
    this.applyFilters();
    this.showMessage('تم مسح جميع الفلاتر', 'success');
  }

  // Reset all filters
  resetAllFilters(): void {
    this.clearFilters();
    this.showMessage('تم إعادة تعيين الفلاتر', 'info');
  }

  // Show message function
  showMessage(text: string, type: 'success' | 'info' | 'error' = 'success'): void {
    const message = this.renderer.createElement('div');
    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      info: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };

    const styles = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-family: 'Cairo', sans-serif;
    `;

    this.renderer.setAttribute(message, 'style', styles);

    const icon = type === 'success' ? 'fa-check' : type === 'info' ? 'fa-info' : 'fa-exclamation';
    message.innerHTML = `<i class="fas ${icon}"></i> ${text}`;

    this.renderer.appendChild(document.body, message);

    // Animate in
    setTimeout(() => {
      this.renderer.setStyle(message, 'transform', 'translateX(0)');
    }, 100);

    // Remove after delay
    setTimeout(() => {
      this.renderer.setStyle(message, 'transform', 'translateX(100%)');
      setTimeout(() => {
        if (document.body.contains(message)) {
          this.renderer.removeChild(document.body, message);
        }
      }, 300);
    }, 3000);
  }

  // Filter change handlers
  onFilterChange(): void {
    this.updateActiveFilters();
    this.applyFilters();
  }

  // Focus search input
  focusSearchInput(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Handle responsive behavior
  handleResize(): void {
    if (window.innerWidth <= 768) {
      // Mobile adjustments can be implemented here
    }
  }

  // Keyboard shortcuts
  setupQuickKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + F to open advanced search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        if (!this.isAdvancedOpen) {
          this.toggleAdvancedSearch();
        }
        setTimeout(() => {
          this.focusSearchInput();
        }, 100);
      }

      // Escape to close advanced search
      if (event.key === 'Escape' && this.isAdvancedOpen) {
        this.toggleAdvancedSearch();
      }

      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.focusSearchInput();
      }

      // Ctrl/Cmd + N for quick add
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        this.openQuickAddModal();
      }

      // Close modal on Escape
      if (event.key === 'Escape') {
        this.closeQuickAddModal();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  // Existing methods preserved
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredParts.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  openQuickAddModal(): void {
    this.showQuickAddModal = true;
  }

  closeQuickAddModal(): void {
    this.showQuickAddModal = false;
  }

  onPartAdded(formData: any): void {
    const carPart: CarPart = this.mapFormDataToCarPart(formData);
    this.parts.unshift(carPart);
    this.extractAvailableBrands();
    this.applyFilters();
    this.closeQuickAddModal();
    this.showMessage('تم إضافة القطعة بنجاح', 'success');
  }

  toggleFavorite(part: CarPart): void {
    part.isFavorite = !part.isFavorite;
    this.showMessage(part.isFavorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة', 'success');
  }

  private mapFormDataToCarPart(formData: any): CarPart {
    return {
      id: this.generateId(),
      name: formData.partName,
      subtitle: formData.subtitle,
      condition: formData.condition as 'جديد' | 'مستعمل',
      store: {
        name: formData.storeName || 'غير محدد',
        phone: formData.storePhone || '01000000000',
      },
      car: {
        brand: formData.carBrand || '',
        model: formData.carModel || '',
        year: formData.carYear || ''
      },
      price: formData.price,
      priceAfterDiscount: formData.priceAfterDiscount,
      discount: formData.discount,
      isFavorite: formData.isFavorite,
      hasDelivery: formData.hasDelivery,
      hasWarranty: formData.hasWarranty,
      grade: formData.grade as 'فرز أول' | 'فرز تاني',
      partType: formData.partType || '',
      origin: formData.origin,
      image: formData.images && formData.images.length > 0 ? formData.images[formData.mainImageIndex ?? 0]?.url : '',
      thumbnails: formData.images ? formData.images.map((img: any) => img.url) : []
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private extractAvailableBrands(): void {
    const brands = new Set(this.parts.map(part => part.car.brand));
    this.availableBrands = Array.from(brands).sort();
  }

  editPart(part: CarPart): void {
    console.log('Editing:', part);
  }

  deletePart(part: CarPart): void {
    this.parts = this.parts.filter(p => p.id !== part.id);
    this.applyFilters();
    this.showMessage('تم حذف القطعة بنجاح', 'success');
  }

  duplicatePart(part: CarPart): void {
    const newPart = { ...part, id: this.generateId(), name: `${part.name} (نسخة)` };
    this.parts.unshift(newPart);
    this.applyFilters();
    this.showMessage('تم نسخ القطعة بنجاح', 'success');
  }

  openBulkImport(): void {
    console.log('Bulk import dialog triggered');
  }

  openImageGallery(part: CarPart): void {
    console.log('Opening image gallery for:', part.name);
  }

  loadParts(): void {
    this.parts = [
      {
        id: 'p1',
        name: 'فلتر هواء',
        subtitle: 'فلتر هواء أصلي للسيارات',
        condition: 'جديد',
        store: { name: 'مخزن أبو علي', phone: '01123456789' },
        car: { brand: 'تويوتا', model: 'كورولا', year: '2020' },
        price: 350,
        priceAfterDiscount: 300,
        discount: 50,
        isFavorite: false,
        hasDelivery: true,
        hasWarranty: true,
        grade: 'فرز أول',
        partType: 'فلتر',
        origin: 'اليابان',
        image: 'https://example.com/images/air-filter.jpg',
        thumbnails: ['https://example.com/images/air-filter1.jpg', 'https://example.com/images/air-filter2.jpg']
      },
      {
        id: 'p2',
        name: 'مراية جانبية',
        subtitle: 'مراية جانبية كهربائية',
        condition: 'مستعمل',
        store: { name: 'ورشة الشرق', phone: '01098765432' },
        car: { brand: 'هيونداي', model: 'أكسنت', year: '2018' },
        price: 450,
        priceAfterDiscount: 400,
        discount: 50,
        isFavorite: true,
        hasDelivery: false,
        hasWarranty: false,
        grade: 'فرز تاني',
        partType: 'مرايات',
        origin: 'كوريا',
        image: 'https://example.com/images/mirror.jpg',
        thumbnails: ['https://example.com/images/mirror1.jpg']
      },
      {
        id: 'p3',
        name: 'بطارية سيارة',
        subtitle: 'بطارية 12 فولت عالية الجودة',
        condition: 'جديد',
        store: { name: 'قطع الغيار السريعة', phone: '01234567890' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2019' },
        price: 1200,
        priceAfterDiscount: 1100,
        discount: 100,
        isFavorite: false,
        hasDelivery: true,
        hasWarranty: true,
        grade: 'فرز أول',
        partType: 'بطاريات',
        origin: 'مصر',
        image: 'https://example.com/images/battery.jpg',
        thumbnails: ['https://example.com/images/battery1.jpg']
      },
      {
        id: 'p4',
        name: 'مصباح أمامي',
        subtitle: 'مصباح LED أمامي مع ضمان سنة',
        condition: 'جديد',
        store: { name: 'مركز الإضاءة', phone: '01122334455' },
        car: { brand: 'كيا', model: 'ريو', year: '2021' },
        price: 900,
        priceAfterDiscount: 850,
        discount: 50,
        isFavorite: true,
        hasDelivery: true,
        hasWarranty: false,
        grade: 'فرز أول',
        partType: 'إضاءة',
        origin: 'ألمانيا',
        image: 'https://example.com/images/headlight.jpg',
        thumbnails: ['https://example.com/images/headlight1.jpg']
      }
    ];
    this.applyFilters();
  }

  trackByPartId(index: number, part: CarPart): string {
    return part.id;
  }

  ngAfterViewInit(): void {
    // تأخير قصير للتأكد من تحميل DOM
    setTimeout(() => {
      this.setupAdvancedSearchListener();
      this.ensureAdvancedFilterPanel();
    }, 100);
  }

  setupAdvancedSearchListener(): void {
    // استدعاء هذه الدالة في ngOnInit أو ngAfterViewInit
    const advancedBtn = document.getElementById('advancedSearchToggle');

    if (advancedBtn) {
      advancedBtn.addEventListener('click', () => {
        this.toggleAdvancedSearch();
      });
    }
  }

  // إضافة هذه الوظائف في component
  toggleDelivery(): void {
    this.hasDelivery = !this.hasDelivery;
    this.onFilterChange();
  }

  toggleWarranty(): void {
    this.hasWarranty = !this.hasWarranty;
    this.onFilterChange();
  }

  toggleDiscount(): void {
    this.hasDiscount = !this.hasDiscount;
    this.onFilterChange();
  }

  toggleFavoritesOnly(): void {
    this.favoritesOnly = !this.favoritesOnly;
    this.onFilterChange();
  }

}

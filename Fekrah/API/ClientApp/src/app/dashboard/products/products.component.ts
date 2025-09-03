import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CarPart } from '../../Shared/Models/car-card';
import { ProductManagementService } from './product-management.service';
import { SwaggerClient, PartDTO, DataSourceResultOfPartDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';

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
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
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
  partsFromApi: PartDTO[] = [];
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
  totalCount = 0;

  // View settings
  viewMode: 'grid' | 'list' = 'list';
  showQuickAddModal = false;
  showEditModal = false;
  editingPart: CarPart | null = null;
  isLoading = false;
  resultsCount = 120;

  constructor(
    private renderer: Renderer2,
    private productMangment: ProductManagementService,
    private swagger: SwaggerClient
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1; // Reset to first page on search
      this.loadParts(); // Load parts with new search term
    });
  }

  ngOnInit(): void {
    this.loadParts();
    this.setupQuickKeyboardShortcuts();
    this.extractAvailableBrands();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Ensure body scrolling is re-enabled if component is destroyed while modal is open
    if (this.showQuickAddModal) {
      this.renderer.removeClass(document.body, 'modal-open');
    }
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

  // Apply filters method updated to trigger API call
  applyFilters(): void {
    // Reset to first page when applying new filters
    this.currentPage = 1;
    // Reload data from API with current search term
    this.loadParts();
  }

  // Update results count based on search and filters
  updateResultsCount(): void {
    this.resultsCount = this.totalCount;
  }

  // Update active filters display
  updateActiveFilters(): void {
    this.activeFilters = [];
    this.currentFilters = [];

    // Check search term
    if (this.searchTerm.trim()) {
      this.activeFilters.push({ label: 'بحث', value: this.searchTerm });
    }

    // Note: For now, only search is implemented via API
    // Other filters would require backend API support for advanced filtering
    
    this.updateResultsCount();
  }

  // Remove specific filter
  removeFilter(filter: { label: string; value: string }): void {
    switch (filter.label) {
      case 'بحث':
        this.searchTerm = '';
        break;
      // Add other filter removals when advanced filtering is implemented
      default:
        break;
    }
    this.applyFilters();
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
    // Pagination is now calculated based on API response in loadParts()
    this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadParts(); // Reload data for new page
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
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  closeQuickAddModal(): void {
    this.showQuickAddModal = false;
    // Re-enable body scrolling when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingPart = null;
    // Re-enable body scrolling when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
  }

  onPartAdded(formData: any): void {
    console.log('Part added with data:', formData);
    const carPart: CarPart = this.mapFormDataToCarPart(formData);
    this.parts.unshift(carPart);
    this.extractAvailableBrands();
    this.applyFilters();
    this.closeQuickAddModal();
    this.showMessage('تم إضافة القطعة بنجاح', 'success');
  }

  onPartUpdated(formData: any): void {
    console.log('Part updated with data:', formData);
    
    if (!this.editingPart) return;
    
    // Convert form data to PartDTO for API call
    const partDto = this.mapFormDataToPartDTO(formData, this.editingPart.id);
    
    this.isLoading = true;
    this.swagger.apiPartsUpdatePost(partDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPart: PartDTO) => {
          console.log('Part updated successfully:', updatedPart);
          
          // Update the part in the local array
          const index = this.parts.findIndex(p => p.id === this.editingPart!.id);
          if (index !== -1) {
            this.parts[index] = this.mapPartDTOToCarPart(updatedPart);
          }
          
          this.extractAvailableBrands();
          this.applyFilters();
          this.closeEditModal();
          this.showMessage('تم تحديث القطعة بنجاح', 'success');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating part:', error);
          this.showMessage('خطأ في تحديث القطعة', 'error');
          this.isLoading = false;
        }
      });
  }

  toggleFavorite(part: CarPart): void {
    part.isFavorite = !part.isFavorite;
    this.showMessage(part.isFavorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة', 'success');
  }

  private mapPartDTOToCarPart(part: PartDTO): CarPart {
    return {
      id: part.id?.toString() || this.generateId(),
      name: part.name || 'غير محدد',
      subtitle: part.description || '',
      condition: this.mapConditionEnum(part.condition) as 'جديد' | 'مستعمل',
      store: {
        name: part.merchantName || 'غير محدد',
        phone: '01000000000', // PartDTO doesn't contain phone
      },
      car: {
        brand: part.brandName || 'غير محدد',
        model: part.carModelName || 'غير محدد',
        year: part.yearOfManufacture?.toString() || 'غير محدد'
      },
      price: part.price || 0,
      priceAfterDiscount: part.finalPrice || part.price || 0,
      discount: part.discount || 0,
      isFavorite: false, // PartDTO doesn't have favorite field
      hasDelivery: false, // PartDTO doesn't have delivery field
      hasWarranty: false, // PartDTO doesn't have warranty field
      grade: this.mapQualityEnum(part.quality) as 'فرز أول' | 'فرز تاني',
      partType: this.mapPartTypeEnum(part.partType),
      origin: part.countryOfManufactureName || 'غير محدد',
      image: part.imageUrls && part.imageUrls.length > 0 ? `./assets/Parts/${part.imageUrls[0].imagePath}` : '',
      thumbnails: part.imageUrls ? part.imageUrls.map(img => `./assets/Parts/${img.imagePath}`) : []
    };
  }

  private mapConditionEnum(condition: any): string {
    // Map PartConditionEnum to Arabic
    switch (condition) {
      case 1: return 'جديد';
      case 2: return 'مستعمل';
      default: return 'جديد';
    }
  }

  private mapQualityEnum(quality: any): string {
    // Map PartQualityEnum to Arabic
    switch (quality) {
      case 1: return 'فرز أول';
      case 2: return 'فرز ثاني';
      default: return 'فرز أول';
    }
  }

  private mapPartTypeEnum(partType: any): string {
    // Map PartTypeEnum to Arabic
    switch (partType) {
      case 1: return 'أصلي';
      case 2: return 'هاي كوبي';
      case 3: return 'بديل';
      default: return 'غير محدد';
    }
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

  private mapFormDataToPartDTO(formData: any, partId: string): PartDTO {
    const partDto = new PartDTO();
    partDto.id = parseInt(partId);
    partDto.name = formData.partName;
    partDto.description = formData.subtitle;
    partDto.price = formData.price || 0;
    partDto.finalPrice = formData.price || 0; // Since we removed discount
    partDto.discount = 0;
    
    // Map condition from Arabic to enum
    partDto.condition = formData.condition === 'جديد' ? 1 : 2;
    
    // Map quality from Arabic to enum
    partDto.quality = formData.grade === 'فرز أول' ? 1 : 2;
    
    // Map part type from Arabic to enum
    switch (formData.partType) {
      case 'أصلي': partDto.partType = 1; break;
      case 'هاي كوبي': partDto.partType = 2; break;
      case 'بديل': partDto.partType = 3; break;
      default: partDto.partType = 1;
    }
    
    // Set other properties with correct PartDTO property names
    partDto.countryOfManufactureId = formData.origin;
    partDto.brandId = formData.carBrand;
    partDto.modelTypeId = formData.carModel;
    partDto.yearOfManufacture = parseInt(formData.carYear);
    partDto.categoryId = formData.category;
    partDto.merchantId = formData.storeName;
    
    // Initialize imageUrls as empty array if not provided
    partDto.imageUrls = [];
    
    return partDto;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private extractAvailableBrands(): void {
    const brands = new Set(this.parts.map(part => part.car.brand));
    this.availableBrands = Array.from(brands).sort();

  }

  editPart(part: CarPart): void {
    this.editingPart = part;
    this.showEditModal = true;
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
    console.log('Editing part:', part);
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
    this.isLoading = true;
    
    this.swagger.apiPartsGetAllGet(this.itemsPerPage, this.currentPage, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfPartDTO) => {
          this.partsFromApi = result.data || [];
          this.totalCount = result.count || 0;
          this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
          
          // Convert PartDTO to CarPart format for existing UI
          this.parts = this.partsFromApi.map(part => this.mapPartDTOToCarPart(part));
          this.filteredParts = [...this.parts];
          this.extractAvailableBrands();
          this.resultsCount = this.totalCount;
          this.isLoading = false;
          
          console.log('Parts loaded successfully:', result);
        },
        error: (error) => {
          console.error('Error loading parts:', error);
          this.isLoading = false;
          this.showMessage('خطأ في تحميل البيانات', 'error');
        }
      });
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

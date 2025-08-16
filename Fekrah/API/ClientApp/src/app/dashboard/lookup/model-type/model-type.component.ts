import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ModelTypeDTO, DataSourceResultOfBrandDTO, BrandDTO, SwaggerClient } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-model-type',
  templateUrl: './model-type.component.html',
  styleUrls: ['./model-type.component.scss']
})
export class ModelTypeComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Data properties
  modelTypes: ModelTypeDTO[] = [];
  filteredModelTypes: ModelTypeDTO[] = [];
  brands: BrandDTO[] = [];
  totalCount = 0;
  loading = false;
  brandsLoading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Search and filters
  searchTerm = '';
  selectedBrandId: number | null = null;
  selectedYear: number | null = null;
  availableYears: number[] = [];
  
  // Forms
  modelTypeForm: FormGroup;
  searchForm: FormGroup;
  
  // Modal state
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedModelType: ModelTypeDTO | null = null;
  modelTypeToDelete: ModelTypeDTO | null = null;
  savingModelType = false;
  deletingModelType = false;
  
  // Statistics
  statistics = {
    totalModelTypes: 0,
    totalBrands: 0
  };

  // Form Control Getters
  get searchTermControl(): FormControl {
    return this.searchForm.get('searchTerm') as FormControl;
  }

  get brandFilterControl(): FormControl {
    return this.searchForm.get('brandFilter') as FormControl;
  }

  get yearFilterControl(): FormControl {
    return this.searchForm.get('yearFilter') as FormControl;
  }

  constructor(
    private swagger: SwaggerClient,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.modelTypeForm = this.createModelTypeForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.initializeAvailableYears();
    this.setupSubscriptions();
    this.loadBrands();
    this.loadModelTypes();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Ensure body scrolling is restored if component is destroyed while modal is open
    if (this.isModalOpen) {
      this.renderer.removeClass(document.body, 'modal-open');
    }
  }

  private createModelTypeForm(): FormGroup {
    return this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(2)]],
      brandId: [null, [Validators.required]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2030)]]
    });
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      brandFilter: [null],
      yearFilter: [null]
    });
  }

  private setupSubscriptions(): void {
    // Search form subscription
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm = value || '';
        this.currentPage = 1;
        this.loadModelTypes();
      });

    // Brand filter subscription
    this.searchForm.get('brandFilter')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Brand filter changed:', value, typeof value);
        // Convert string value to number for proper comparison
        this.selectedBrandId = value ? parseInt(value) : null;
        this.currentPage = 1;
        this.loadModelTypes();
      });

    // Year filter subscription
    this.searchForm.get('yearFilter')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Year filter changed:', value, typeof value);
        // Convert string value to number for proper comparison
        this.selectedYear = value ? parseInt(value) : null;
        this.currentPage = 1;
        this.loadModelTypes();
      });
  }

  // Data loading methods
  loadBrands(): void {
    this.brandsLoading = true;
    // Using SwaggerClient API: api/CarsModel/GetAll to get brands data
    this.swagger.apiBrandGetAllGet(1000, 1, undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          this.brands = result.data || [];
          this.brandsLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading brands:', error);
          this.brandsLoading = false;
        }
      });
  }

  loadModelTypes(): void {
    this.loading = true;
    // Using SwaggerClient API: api/ModelType/GetAll to get model types directly
    // Fetch all records when filters are applied, otherwise use pagination
    const hasFilters = this.selectedBrandId || this.selectedYear;
    const fetchSize = hasFilters ? 10000 : this.pageSize; // Get all records when filtering
    
    this.swagger.apiModelTypeGetAllGet(fetchSize, 1, this.searchTerm || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          const allModelTypes: ModelTypeDTO[] = result.data || [];
          
          // Extract available years from all model types
          this.extractAvailableYears(allModelTypes);
          
          // Apply filters
          this.modelTypes = this.applyFilters(allModelTypes);
          
          // Apply pagination
          this.totalCount = this.modelTypes.length;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          const startIndex = (this.currentPage - 1) * this.pageSize;
          this.filteredModelTypes = this.modelTypes.slice(startIndex, startIndex + this.pageSize);
          
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading model types:', error);
          this.loading = false;
        }
      });
  }

  private applyFilters(modelTypes: ModelTypeDTO[]): ModelTypeDTO[] {
    console.log('Applying filters:', {
      totalModelTypes: modelTypes.length,
      selectedBrandId: this.selectedBrandId,
      selectedYear: this.selectedYear,
      searchTerm: this.searchTerm
    });
    
    let filtered = [...modelTypes];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mt => 
        mt.name?.toLowerCase().includes(searchTerm) ||
        mt?.brand?.name?.toLowerCase().includes(searchTerm) ||
        mt.year?.toString().includes(searchTerm)
      );
      console.log('After search filter:', filtered.length);
    }
    
    // Apply brand filter
    if (this.selectedBrandId) {
      const beforeBrandFilter = filtered.length;
      filtered = filtered.filter(mt => mt.brandId === this.selectedBrandId);
      console.log('After brand filter:', {
        before: beforeBrandFilter,
        after: filtered.length,
        selectedBrandId: this.selectedBrandId
      });
    }
    
    // Apply year filter
    if (this.selectedYear) {
      const beforeYearFilter = filtered.length;
      // Ensure both sides are numbers for comparison
      const targetYear = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear) : this.selectedYear;
      filtered = filtered.filter(mt => {
        const modelYear = typeof mt.year === 'string' ? parseInt(mt.year) : mt.year;
        return modelYear === targetYear;
      });
      console.log('After year filter:', {
        before: beforeYearFilter,
        after: filtered.length,
        selectedYear: this.selectedYear,
        targetYear: targetYear
      });
    }
    
    console.log('Final filtered results:', filtered.length);
    return filtered;
  }

  private extractAvailableYears(modelTypes: ModelTypeDTO[]): void {
    // If no model types provided, initialize with a comprehensive year range
    if (!modelTypes || modelTypes.length === 0) {
      this.initializeAvailableYears();
      return;
    }

    const yearsSet = new Set<number>();
    modelTypes.forEach(mt => {
      if (mt.year) {
        yearsSet.add(mt.year);
      }
    });
    
    // If we have years from data, use them. Otherwise, use the full range
    if (yearsSet.size > 0) {
      this.availableYears = Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order
    } else {
      this.initializeAvailableYears();
    }
  }

  private initializeAvailableYears(): void {
    // Initialize with a comprehensive range of years from 1980 to 2030
    const currentYear = new Date().getFullYear();
    const startYear = 1980;
    const endYear = 2030;
    
    this.availableYears = [];
    for (let year = endYear; year >= startYear; year--) {
      this.availableYears.push(year);
    }
  }

  loadStatistics(): void {
    // Using SwaggerClient API: api/CarsModel/GetAll to load statistics from all brands
    this.swagger.apiBrandGetAllGet(1000, 1, undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          const allBrands = result.data || [];
          this.statistics.totalBrands = allBrands.length;
          
          let totalModelTypes = 0;
          allBrands.forEach(brand => {
            if (brand.modelTypes) {
              totalModelTypes += brand.modelTypes.length;
            }
          });
          this.statistics.totalModelTypes = totalModelTypes;
        },
        error: (error: any) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  // Modal methods
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedModelType = null;
    this.modelTypeForm.reset();
    this.modelTypeForm.patchValue({
      id: 0,
      year: new Date().getFullYear()
    });
    this.isModalOpen = true;
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  openEditModal(modelType: ModelTypeDTO): void {
    this.modalMode = 'edit';
    this.selectedModelType = new ModelTypeDTO(modelType);
    this.modelTypeForm.patchValue(modelType);
    this.isModalOpen = true;
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedModelType = null;
    this.modelTypeForm.reset();
    
    // Restore body scrolling and positioning when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'width');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  // CRUD operations using SwaggerClient API
  saveModelType(): void {
    if (this.modelTypeForm.valid && !this.savingModelType) {
      this.savingModelType = true;
      const formValue = this.modelTypeForm.value;
      
      if (this.modalMode === 'create') {
        this.createModelType(formValue);
      } else {
        this.updateModelType(formValue);
      }
    }
  }

  private createModelType(modelTypeData: any): void {
    // Use the dedicated ModelType create API - only set BrandId, let server handle Brand
    const newModelType = {
      id: 0, // Will be assigned by the server
      name: modelTypeData.name,
      brandId: modelTypeData.brandId,
      year: modelTypeData.year
    } as ModelTypeDTO;
    
    this.swagger.apiModelTypeInsertPost(newModelType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdModelType: ModelTypeDTO) => {
          console.log('Model type created successfully:', createdModelType);
          this.savingModelType = false;
          this.closeModal();
          this.refreshData();
        },
        error: (error: any) => {
          console.error('Error creating model type:', error);
          this.savingModelType = false;
        }
      });
  }

  private updateModelType(modelTypeData: any): void {
    if (this.selectedModelType) {
      // Use the dedicated ModelType update API - only set BrandId, let server handle Brand
      const updatedModelType = {
        id: this.selectedModelType.id,
        name: modelTypeData.name,
        brandId: modelTypeData.brandId,
        year: modelTypeData.year
      } as ModelTypeDTO;
      
      this.swagger.apiModelTypeUpdatePost(updatedModelType)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedModelType: ModelTypeDTO) => {
            console.log('Model type updated successfully:', updatedModelType);
            this.savingModelType = false;
            this.closeModal();
            this.refreshData();
          },
          error: (error: any) => {
            console.error('Error updating model type:', error);
            this.savingModelType = false;
          }
        });
    }
  }

  confirmDelete(modelType: ModelTypeDTO): void {
    this.modelTypeToDelete = modelType;
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  deleteModelType(): void {
    if (this.modelTypeToDelete !=null && !this.deletingModelType) {
      console.log('Attempting to delete model type:', this.modelTypeToDelete);
      this.deletingModelType = true;
      
      // Use the dedicated ModelType delete API
      this.swagger.apiModelTypeDeletePost(this.modelTypeToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (deletedModelType: ModelTypeDTO) => {
            console.log('Model type deleted successfully:', deletedModelType);
            this.deletingModelType = false;
            this.cancelDelete();
            this.refreshData();
          },
          error: (error: any) => {
            console.error('Error deleting model type:', error);
            this.deletingModelType = false;
            this.cancelDelete();
          }
        });
    } else {
      console.log('Delete conditions not met:', {
        modelTypeToDelete: this.modelTypeToDelete,
        deletingModelType: this.deletingModelType
      });
    }
  }

  cancelDelete(): void {
    this.modelTypeToDelete = null;
    
    // Restore body scrolling and positioning when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'width');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  // Utility methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadModelTypes();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadModelTypes();
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  refreshData(): void {
    this.loadModelTypes();
    this.loadStatistics();
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchTerm = '';
    this.selectedBrandId = null;
    this.selectedYear = null;
    this.currentPage = 1;
    this.loadModelTypes();
  }

  // Helper methods
  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'غير محدد';
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.modelTypeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.modelTypeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} مطلوب`;
      if (field.errors['minlength']) return `${fieldName} يجب أن يكون أكثر من ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['min']) return `السنة يجب أن تكون أكبر من ${field.errors['min'].min}`;
      if (field.errors['max']) return `السنة يجب أن تكون أصغر من ${field.errors['max'].max}`;
    }
    return '';
  }

  trackByModelTypeId(index: number, modelType: ModelTypeDTO): number {
    return modelType.id;
  }
}

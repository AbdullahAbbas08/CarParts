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

  constructor(
    private swagger: SwaggerClient,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.modelTypeForm = this.createModelTypeForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
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
      brandFilter: [null]
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
        this.selectedBrandId = value;
        this.currentPage = 1;
        this.loadModelTypes();
      });
  }

  // Data loading methods
  loadBrands(): void {
    this.brandsLoading = true;
    // Using SwaggerClient API: api/CarsModel/GetAll to get brands data
    this.swagger.apiCarsModelGetAllGet(1000, 1, undefined)
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
    // Using SwaggerClient API: api/CarsModel/GetAll to get brands with their model types
    this.swagger.apiModelTypeGetAllGet(this.pageSize * 10, 1, this.searchTerm || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          const allBrands = result.data || [];
          let allModelTypes: ModelTypeDTO[] = [];
          
          // Extract all model types from brands
          allBrands.forEach(brand => {
            if (brand.modelTypes && brand.modelTypes.length > 0) {
              brand.modelTypes.forEach(modelType => {
                // Ensure brandName is set for display purposes
                modelType.brandName = brand.name;
                allModelTypes.push(modelType);
              });
            }
          });
          
          // Apply filters
          this.modelTypes = this.applyFilters(allModelTypes);
          this.filteredModelTypes = [...this.modelTypes];
          
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
    let filtered = [...modelTypes];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mt => 
        mt.name?.toLowerCase().includes(searchTerm) ||
        mt.brandName?.toLowerCase().includes(searchTerm) ||
        mt.year?.toString().includes(searchTerm)
      );
    }
    
    // Apply brand filter
    if (this.selectedBrandId) {
      filtered = filtered.filter(mt => mt.brandId === this.selectedBrandId);
    }
    
    return filtered;
  }

  loadStatistics(): void {
    // Using SwaggerClient API: api/CarsModel/GetAll to load statistics from all brands
    this.swagger.apiCarsModelGetAllGet(1000, 1, undefined)
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
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  openEditModal(modelType: ModelTypeDTO): void {
    this.modalMode = 'edit';
    this.selectedModelType = new ModelTypeDTO(modelType);
    this.modelTypeForm.patchValue(modelType);
    this.isModalOpen = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedModelType = null;
    this.modelTypeForm.reset();
    
    // Restore body scrolling when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
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
    // To create a model type, we need to add it to the parent brand's modelTypes array
    // First, get the brand details using SwaggerClient API
    this.swagger.apiCarsModelGetDetailsGet(modelTypeData.brandId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (brand: BrandDTO) => {
          // Add the new model type to the brand's modelTypes array
          if (!brand.modelTypes) {
            brand.modelTypes = [];
          }
          
          const newModelType = new ModelTypeDTO({
            id: 0, // Will be assigned by the server
            name: modelTypeData.name,
            brandId: modelTypeData.brandId,
            year: modelTypeData.year,
            brandName: brand.name
          });
          
          brand.modelTypes.push(newModelType);
          
          // Update the brand with the new model type using SwaggerClient API
          this.swagger.apiCarsModelUpdatePost(brand)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (updatedBrand: BrandDTO) => {
                console.log('Model type created successfully');
                this.savingModelType = false;
                this.closeModal();
                this.refreshData();
              },
              error: (error: any) => {
                console.error('Error creating model type:', error);
                this.savingModelType = false;
              }
            });
        },
        error: (error: any) => {
          console.error('Error getting brand details:', error);
          this.savingModelType = false;
        }
      });
  }

  private updateModelType(modelTypeData: any): void {
    if (this.selectedModelType) {
      // To update a model type, we need to update it in the parent brand's modelTypes array
      this.swagger.apiCarsModelGetDetailsGet(modelTypeData.brandId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (brand: BrandDTO) => {
            // Find and update the model type in the brand's modelTypes array
            const modelTypeIndex = brand.modelTypes?.findIndex(mt => mt.id === this.selectedModelType!.id);
            
            if (modelTypeIndex !== undefined && modelTypeIndex !== -1 && brand.modelTypes) {
              brand.modelTypes[modelTypeIndex] = new ModelTypeDTO({
                id: this.selectedModelType!.id,
                name: modelTypeData.name,
                brandId: modelTypeData.brandId,
                year: modelTypeData.year,
                brandName: brand.name
              });
              
              // Update the brand with the modified model type using SwaggerClient API
              this.swagger.apiCarsModelUpdatePost(brand)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (updatedBrand: BrandDTO) => {
                    console.log('Model type updated successfully');
                    this.savingModelType = false;
                    this.closeModal();
                    this.refreshData();
                  },
                  error: (error: any) => {
                    console.error('Error updating model type:', error);
                    this.savingModelType = false;
                  }
                });
            } else {
              console.error('Model type not found in brand');
              this.savingModelType = false;
            }
          },
          error: (error: any) => {
            console.error('Error getting brand details:', error);
            this.savingModelType = false;
          }
        });
    }
  }

  confirmDelete(modelType: ModelTypeDTO): void {
    this.modelTypeToDelete = modelType;
  }

  deleteModelType(): void {
    if (this.modelTypeToDelete && !this.deletingModelType) {
      this.deletingModelType = true;
      
      // To delete a model type, we need to remove it from the parent brand's modelTypes array
      // First, find the brand that contains this model type
      const brandId = this.modelTypeToDelete.brandId;
      
      this.swagger.apiCarsModelGetDetailsGet(brandId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (brand: BrandDTO) => {
            // Remove the model type from the brand's modelTypes array
            if (brand.modelTypes) {
              brand.modelTypes = brand.modelTypes.filter(mt => mt.id !== this.modelTypeToDelete!.id);
              
              // Update the brand with the removed model type using SwaggerClient API
              this.swagger.apiCarsModelUpdatePost(brand)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (updatedBrand: BrandDTO) => {
                    console.log('Model type deleted successfully');
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
              console.error('Brand has no model types');
              this.deletingModelType = false;
              this.cancelDelete();
            }
          },
          error: (error: any) => {
            console.error('Error getting brand details:', error);
            this.deletingModelType = false;
            this.cancelDelete();
          }
        });
    }
  }

  cancelDelete(): void {
    this.modelTypeToDelete = null;
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

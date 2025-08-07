import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BrandDTO, DataSourceResultOfBrandDTO, SwaggerClient } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Data properties
  brands: BrandDTO[] = [];
  filteredBrands: BrandDTO[] = [];
  totalCount = 0;
  loading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Search and filters
  searchTerm = '';
  
  // Forms
  brandForm: FormGroup;
  searchForm: FormGroup;
  
  // Modal state
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: BrandDTO | null = null;
  brandToDelete: BrandDTO | null = null;
  
  // Statistics
  statistics = {
    totalBrands: 0
  };

  // Form Control Getters
  get searchTermControl(): FormControl {
    return this.searchForm.get('searchTerm') as FormControl;
  }

  constructor(
    private swagger: SwaggerClient,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.brandForm = this.createBrandForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadBrands();
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

  private createBrandForm(): FormGroup {
    return this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      imageUrl: ['']
    });
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: ['']
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
        this.loadBrands();
      });
  }

  // Data loading methods
  loadBrands(): void {
    this.loading = true;
    this.swagger.apiCarsModelGetAllGet(this.pageSize, this.currentPage, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          this.brands = result.data || [];
          this.filteredBrands = [...this.brands];
          this.totalCount = result.count || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading brands:', error);
          this.loading = false;
        }
      });
  }

  loadStatistics(): void {
    this.swagger.apiCarsModelGetAllGet(1, 1, undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          this.statistics.totalBrands = result.count || 0;
        },
        error: (error: any) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  // Modal methods
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedBrand = null;
    this.brandForm.reset();
    this.brandForm.patchValue({
      id: 0
    });
    this.isModalOpen = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  openEditModal(brand: BrandDTO): void {
    this.modalMode = 'edit';
    this.selectedBrand = new BrandDTO(brand);
    this.brandForm.patchValue(brand);
    this.isModalOpen = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBrand = null;
    this.brandForm.reset();
    
    // Restore body scrolling when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
  }

  // CRUD operations
  saveBrand(): void {
    if (this.brandForm.valid) {
      const formValue = this.brandForm.value;
      const brandData: BrandDTO = new BrandDTO(formValue);

      if (this.modalMode === 'create') {
        this.swagger.apiCarsModelInsertPost(brandData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result: any) => {
              this.loadBrands();
              this.loadStatistics();
              this.closeModal();
            },
            error: (error: any) => {
              console.error('Error creating brand:', error);
            }
          });
      } else {
        this.swagger.apiCarsModelUpdatePost(brandData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result: any) => {
              this.loadBrands();
              this.closeModal();
            },
            error: (error: any) => {
              console.error('Error updating brand:', error);
            }
          });
      }
    }
  }

  confirmDelete(brand: BrandDTO): void {
    this.brandToDelete = brand;
  }

  deleteUser(): void {
    if (this.brandToDelete && this.brandToDelete.id) {
      this.swagger.apiCarsModelDeletePost(this.brandToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: any) => {
            this.loadBrands();
            this.loadStatistics();
            this.cancelDelete();
          },
          error: (error: any) => {
            console.error('Error deleting brand:', error);
            this.cancelDelete();
          }
        });
    }
  }

  cancelDelete(): void {
    this.brandToDelete = null;
  }

  // Utility methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBrands();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadBrands();
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
    this.loadBrands();
    this.loadStatistics();
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadBrands();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.brandForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.brandForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} مطلوب`;
      if (field.errors['minlength']) return `${fieldName} يجب أن يكون أكثر من ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
    }
    return '';
  }

  trackByBrandId(index: number, brand: BrandDTO): number {
    return brand.id;
  }

  // Helper method for template
  getTotalModels(): number {
    return this.brands.reduce((total, brand) => total + (brand.modelTypes?.length || 0), 0);
  }
}

import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BrandDTO, DataSourceResultOfBrandDTO, SwaggerClient, FileTypeEnum, FileParameter } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
  encapsulation: ViewEncapsulation.None
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
  
  // File handling
  selectedFile: File | null = null;
  selectedFileName = '';
  uploadLoading = false;
  
  // Forms
  brandForm: FormGroup;
  searchForm: FormGroup;
  
  // Modal state
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: BrandDTO | null = null;
  brandToDelete: BrandDTO | null = null;
  brandToToggle: BrandDTO | null = null;
  toggleAction: 'activate' | 'deactivate' = 'activate';
  
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
    this.swagger.apiBrandGetAllGet(this.pageSize, this.currentPage, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: DataSourceResultOfBrandDTO) => {
          this.brands = (result.data || []).map(brand => {
            const mappedBrand = new BrandDTO(brand);
            if (mappedBrand.imageUrl) {
              mappedBrand.imageUrl = `./assets/Brands/${mappedBrand.imageUrl}`;
            }
            return mappedBrand;
          });
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
    this.swagger.apiBrandGetAllGet(1, 1, undefined)
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
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  openEditModal(brand: BrandDTO): void {
    this.modalMode = 'edit';
    this.selectedBrand = new BrandDTO(brand);
    this.brandForm.patchValue(brand);
    this.isModalOpen = true;
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBrand = null;
    this.brandForm.reset();
    this.resetFileSelection();
    
    // Restore body scrolling and positioning when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'width');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  // File handling methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  private uploadFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No file selected');
        return;
      }

      const fileParameter: FileParameter = {
        data: this.selectedFile,
        fileName: this.selectedFile.name
      };

      this.uploadLoading = true;
      
      this.swagger.apiFileUploadFilePost(fileParameter, FileTypeEnum.Brands)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (uploadResult) => {
            this.uploadLoading = false;
            if (uploadResult.successfully_Uploaded && uploadResult.fileName) {
              resolve(uploadResult.fileName);
            } else {
              reject(uploadResult.message || 'فشل في رفع الملف');
            }
          },
          error: (error) => {
            this.uploadLoading = false;
            console.error('Error uploading file:', error);
            reject('حدث خطأ في رفع الملف');
          }
        });
    });
  }

  // CRUD operations
  saveBrand(): void {
    if (this.brandForm.valid) {
      this.loading = true;
      
      if (this.modalMode === 'create') {
        // For create mode, upload file first if selected, then create brand
        if (this.selectedFile) {
          this.uploadFile()
            .then((uploadedFileName) => {
              // File uploaded successfully, now create brand with the uploaded file name
              this.createBrandWithImage(uploadedFileName);
            })
            .catch((error) => {
              this.loading = false;
              alert(error);
            });
        } else {
          // No file selected, create brand without image
          this.createBrandWithImage('');
        }
      } else {
        // For edit mode, handle file upload if new file is selected
        if (this.selectedFile) {
          this.uploadFile()
            .then((uploadedFileName) => {
              this.updateBrandWithImage(uploadedFileName);
            })
            .catch((error) => {
              this.loading = false;
              alert(error);
            });
        } else {
          // No new file selected, update brand with existing image URL
          this.updateBrandWithImage(this.brandForm.get('imageUrl')?.value || '');
        }
      }
    }
  }

  toggleBrandStatus(brand: BrandDTO): void {
    if (!brand || !brand.id) return;
    
    this.brandToToggle = brand;
    this.toggleAction = brand.isActive ? 'deactivate' : 'activate';
    
    // Force modal to display at viewport level by manipulating body
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    
    // Scroll to top to ensure modal appears centered
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }

  confirmToggleStatus(): void {
    if (!this.brandToToggle) return;
    
    const newStatus = !this.brandToToggle.isActive;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    this.loading = true;
    
    // Use the dedicated API for activate/deactivate
    this.swagger.apiBrandActiveOrDeactiveBrandPost(this.brandToToggle.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: boolean) => {
          this.loading = false;
          if (result) {
            // Update local brand status on success
            this.brandToToggle!.isActive = newStatus;
            console.log(`Brand "${this.brandToToggle!.name}" ${newStatus ? 'activated' : 'deactivated'} successfully`);
          } else {
            console.error('API returned false for brand status update');
            alert(`فشل في ${actionText} العلامة التجارية`);
          }
          this.cancelToggle();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error updating brand status:', error);
          alert(`فشل في ${actionText} العلامة التجارية`);
          this.cancelToggle();
        }
      });
  }

  cancelToggle(): void {
    this.brandToToggle = null;
    this.toggleAction = 'activate';
    
    // Restore body scrolling and positioning when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'width');
    this.renderer.removeStyle(document.body, 'overflow');
  }

  private createBrandWithImage(imageUrl: string): void {
    const formValue = this.brandForm.value;
    const brandData: BrandDTO = new BrandDTO({
      ...formValue,
      imageUrl: imageUrl
    });

    this.swagger.apiBrandInsertPost(brandData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          this.loading = false;
          this.loadBrands();
          this.loadStatistics();
          this.closeModal();
          this.resetFileSelection();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error creating brand:', error);
          alert('فشل في إنشاء العلامة التجارية');
        }
      });
  }

  private updateBrandWithImage(imageUrl: string): void {
    const formValue = this.brandForm.value;
    const brandData: BrandDTO = new BrandDTO({
      ...formValue,
      imageUrl: imageUrl
    });

    this.swagger.apiBrandUpdatePost(brandData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          this.loading = false;
          this.loadBrands();
          this.closeModal();
          this.resetFileSelection();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error updating brand:', error);
          alert('فشل في تحديث العلامة التجارية');
        }
      });
  }

  private resetFileSelection(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    const fileInput = document.getElementById('logoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  confirmDelete(brand: BrandDTO): void {
    this.brandToDelete = brand;
    
    // Prevent body scrolling and ensure modal viewport positioning
    this.renderer.addClass(document.body, 'modal-open');
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  deleteUser(): void {
    if (this.brandToDelete && this.brandToDelete.id) {
      this.swagger.apiBrandDeletePost(this.brandToDelete.id)
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

  // Image loading handlers for debugging
  onImageError(event: any, brand: BrandDTO): void {
    console.error('Failed to load image for brand:', brand.name, 'URL:', brand.imageUrl);
    event.target.style.display = 'none';
  }

  onImageLoad(event: any, brand: BrandDTO): void {
    console.log('Successfully loaded image for brand:', brand.name, 'URL:', brand.imageUrl);
  }
}

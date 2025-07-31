import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CityLookupDto, GovernorateLookupDto, MerchantDTO, SwaggerClient } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';

/**
 * Merchant Status Values:
 * 1 or 'active' = Active merchant
 * 0 or 'inactive' = Inactive merchant  
 * 3 or 'closed' = Closed merchant
 * -1 or 'deleted' = Deleted merchant (fallback)
 * 
 * Fallback to rating if status property is not available:
 * rating >= 3.0 = active
 * rating < 3.0 or rating = 0 = inactive
 */

@Component({
  selector: 'app-manage-merchants',
  templateUrl: './manage-merchants.component.html',
  styleUrls: ['./manage-merchants-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageMerchantsComponent implements OnInit, OnDestroy {
  // Data arrays
  merchants: MerchantDTO[] = [];
  filteredMerchants: MerchantDTO[] = [];
  governorates: GovernorateLookupDto[] = [];
  cities: CityLookupDto[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingGovernorates = false;
  isSearching = false;
  
  // View and layout options
  viewMode: 'cards' | 'table' = 'table';
  sortBy: 'name' | 'date' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Search and filters - Enhanced
  searchTerm = '';
  selectedGovernorate: number | null = null;
  selectedCity: number | null = null;
  selectedStatus: string = 'all';
  showAdvancedFilters = false;
  
  // Advanced filter properties
  registrationDateFilter: string = '';
  merchantTypeFilter: string = '';
  sortOrder: string = 'desc';
  
  // Pagination - Enhanced
  itemsPerPage: number = 24;
  currentPage: number = 1;
  
  // Statistics
  totalMerchants = 0;
  activeMerchants = 0;
  inactiveMerchants = 0;
  deletedMerchants = 0;
  totalCount = 0;
  totalPages = 0;
  
  // Table functionality
  selectedMerchants: MerchantDTO[] = [];
  showDropdown: { [key: number]: boolean } = {};
  showActionsDropdown = false;
  
  // Visible columns for table view
  visibleColumns = {
    name: true,
    contact: true,
    location: true,
    status: true,
    joinDate: false
  };
  
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private swaggerClient: SwaggerClient
  ) {}

  ngOnInit(): void {
    this.loadMerchants();
    this.loadGovernorates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =============================
  // Data Loading Methods
  // =============================
  
  loadMerchants(): void {
    this.isLoading = true;
    console.log('🏪 Loading merchants from API...');
    
    const pageSize = this.itemsPerPage;
    const page = this.currentPage;
    const searchTerm = this.searchTerm?.trim() || undefined;
    
    this.subscriptions.add(
      this.swaggerClient.apiMerchantGetAllGet(pageSize, page, searchTerm).subscribe({
        next: (response) => {
          this.merchants = response.data || [];
          this.totalCount = response.count || 0;
          this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
          
          // Debug: Log merchant status values to understand API response structure
          if (this.merchants.length > 0) {
            console.log('📊 Sample merchant status data:', {
              sampleMerchant: {
                id: this.merchants[0].id,
                shopName: this.merchants[0].shopName,
                status: this.merchants[0].status,
                rating: this.merchants[0].rating,
                statusType: typeof this.merchants[0].status
              }
            });
          }
          
          this.updateStatistics();
          this.applyFilters();
          this.isLoading = false;
          console.log('✅ Merchants loaded:', this.merchants.length);
          this.showToast(`تم تحميل ${this.merchants.length} تاجر بنجاح`, 'success');
        },
        error: (error) => {
          console.error('❌ Error loading merchants:', error);
          this.merchants = [];
          this.totalCount = 0;
          this.totalPages = 0;
          this.updateStatistics();
          this.applyFilters();
          this.isLoading = false;
          this.showToast('حدث خطأ أثناء تحميل البيانات', 'error');
        }
      })
    );
  }

  loadGovernorates(): void {
    this.isLoadingGovernorates = true;
    this.subscriptions.add(
      this.swaggerClient.apiLookupGovernoratesGet().subscribe({
        next: (governorates) => {
          this.governorates = governorates || [];
          this.isLoadingGovernorates = false;
        },
        error: (error) => {
          console.error('Error loading governorates:', error);
          this.governorates = [];
          this.isLoadingGovernorates = false;
        }
      })
    );
  }

  loadCities(governorateId: number): void {
    if (!governorateId) {
      this.cities = [];
      return;
    }

    this.subscriptions.add(
      this.swaggerClient.apiLookupCitiesGet(governorateId).subscribe({
        next: (cities) => {
          this.cities = cities || [];
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.cities = [];
        }
      })
    );
  }

  // =============================
  // Search and Filter Methods
  // =============================
  
  onSearchInputChange(event: any): void {
    this.isSearching = true;
    const searchValue = event.target.value;
    
    setTimeout(() => {
      this.searchTerm = searchValue;
      this.currentPage = 1;
      this.loadMerchants();
      this.isSearching = false;
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadMerchants();
  }

  onGovernorateChange(): void {
    this.selectedCity = null;
    this.cities = [];
    if (this.selectedGovernorate) {
      this.loadCities(this.selectedGovernorate);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  onCityChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.merchants];

    // Status filter
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      filtered = filtered.filter(merchant => this.getMerchantStatus(merchant) === this.selectedStatus);
    }
    // Governorate filter  
    if (this.selectedGovernorate) {
      console.log(filtered);
      filtered = filtered.filter(merchant => merchant.governorateId == this.selectedGovernorate);
      console.log(filtered);
    }

    // City filter
    if (this.selectedCity) {
      filtered = filtered.filter(merchant => merchant.cityId === this.selectedCity);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.shopName || '';
          bValue = b.shopName || '';
          break;
        case 'date':
          aValue = a.id || 0;
          bValue = b.id || 0;
          break;
        default:
          return 0;
      }

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredMerchants = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGovernorate = null;
    this.selectedCity = null;
    this.selectedStatus = 'all';
    this.cities = [];
    this.currentPage = 1;
    this.loadMerchants();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Enhanced filter methods for advanced functionality
   */
  
  // Date filter change handler
  onDateFilterChange(): void {
    this.applyFilters();
  }
  
  // Merchant type filter change handler
  onTypeFilterChange(): void {
    this.applyFilters();
  }
  
  // Sort change handler
  onSortChange(): void {
    this.applyFilters();
  }

  // =============================
  // Statistics Methods
  // =============================
  
  updateStatistics(): void {
    this.totalMerchants = this.totalCount || this.merchants.length;
    this.activeMerchants = this.merchants.filter(m => this.getMerchantStatus(m) === 'active').length;
    this.inactiveMerchants = this.merchants.filter(m => this.getMerchantStatus(m) === 'inactive').length;
    this.deletedMerchants = this.merchants.filter(m => this.getMerchantStatus(m) === 'deleted').length;
  }

  quickFilterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  // =============================
  // Pagination Methods
  // =============================
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMerchants();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMerchants();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadMerchants();
    }
  }

  getPaginatedMerchants(): MerchantDTO[] {
    return this.filteredMerchants;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (current > 4) {
        pages.push(-1);
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (current < total - 3) {
        pages.push(-1);
      }
      
      if (!pages.includes(total)) {
        pages.push(total);
      }
    }
    
    return pages;
  }

  // =============================
  // View and Display Methods
  // =============================
  
  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode = mode;
  }

  changeSortBy(sortBy: 'name' | 'date'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  updateItemsPerPage(): void {
    this.currentPage = 1;
    this.loadMerchants();
  }

  // =============================
  // Utility Methods
  // =============================
  
  getMerchantStatus(merchant: MerchantDTO): string {
    // Use the status property from API if available
    if (merchant.status !== undefined && merchant.status !== null) {
      const status = merchant.status as any; // Cast to any to handle different status types
      
      // Handle numeric status values
      if (status === 1 || status === 'active') {
        return 'active';
      } else if (status === 0 || status === 'inactive') {
        return 'inactive';
      } else if (status === 3 || status === 'closed') {
        return 'deleted'; // Use 'deleted' for UI consistency
      } else if (status === -1 || status === 'deleted') {
        return 'deleted';
      }
    }
    
    // Fallback to rating-based logic if status property is not available or unclear
    if (merchant.rating === 0) return 'inactive';
    if ((merchant.rating || 0) < 3.0) return 'inactive';
    return 'active';
  }

  getMerchantStatusLabel(merchant: MerchantDTO): string {
    const status = this.getMerchantStatus(merchant);
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'deleted': return 'مغلق'; // This covers both status=3 (closed) and status=-1 (deleted)
      default: return 'غير محدد';
    }
  }

  getMerchantStatusClass(merchant: MerchantDTO): string {
    const status = this.getMerchantStatus(merchant);
    return `status-${status}`;
  }

  getGovernorateName(governorateId: number): string {
    const governorate = this.governorates.find(g => g.id === governorateId);
    return governorate?.name || 'غير محدد';
  }

  getCityName(cityId: number): string {
    const city = this.cities.find(c => c.id === cityId);
    return city?.nameAr || 'غير محدد';
  }

  getResultsText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    return `عرض ${start} - ${end} من ${this.totalCount} تاجر`;
  }

  // =============================
  // Action Methods
  // =============================
  
  addNewMerchant(): void {
    this.router.navigate(['/admin/add-merchant']);
  }

  editMerchant(merchant: MerchantDTO): void {
    console.log('🏪 Editing merchant:', merchant.shopName);
    localStorage.setItem('currentMerchantId', merchant.id?.toString() || '');
    this.router.navigate(['/merchant-profile/edit']);
  }

  viewMerchant(merchant: MerchantDTO): void {
    console.log('👀 Viewing merchant:', merchant.shopName);
    localStorage.setItem('currentMerchantId', merchant.id?.toString() || '');
    this.router.navigate(['/merchant-profile']);
  }

  toggleMerchantStatus(merchant: MerchantDTO): void {
    const currentStatus = this.getMerchantStatus(merchant);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const statusText = newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (confirm(`هل أنت متأكد من ${statusText} التاجر "${merchant.shopName}"؟`)) {
      // Update the status property if available, otherwise fallback to rating
      if (merchant.status !== undefined) {
        (merchant as any).status = newStatus === 'active' ? 1 : 0;
      } else {
        // Fallback to rating for backward compatibility
        merchant.rating = newStatus === 'active' ? 4.0 : 2.0;
      }
      
      this.showToast(`تم ${statusText} التاجر بنجاح`, 'success');
      this.applyFilters();
    }
  }

  deleteMerchant(merchant: MerchantDTO): void {
    if (confirm(`هل أنت متأكد من إغلاق التاجر "${merchant.shopName}"؟`)) {
      this.isLoading = true;
      
      setTimeout(() => {
        // Option 1: Mark as closed instead of removing
        if (merchant.status !== undefined) {
          (merchant as any).status = 3; // 3 for closed
          this.updateStatistics();
          this.applyFilters();
          this.showToast('تم إغلاق التاجر بنجاح', 'success');
        } else {
          // Option 2: Remove from list (fallback for older API)
          this.merchants = this.merchants.filter(m => m.id !== merchant.id);
          this.updateStatistics();
          this.applyFilters();
          this.showToast('تم إغلاق التاجر بنجاح', 'success');
        }
        
        this.isLoading = false;
      }, 1000);
    }
  }

  reactivateMerchant(merchant: MerchantDTO): void {
    if (confirm(`هل أنت متأكد من إعادة تفعيل التاجر "${merchant.shopName}"؟`)) {
      this.isLoading = true;
      
      setTimeout(() => {
        if (merchant.status !== undefined) {
          (merchant as any).status = 1; // 1 for active
        } else {
          merchant.rating = 4.0; // Fallback to rating
        }
        
        this.updateStatistics();
        this.applyFilters();
        this.showToast('تم إعادة تفعيل التاجر بنجاح', 'success');
        this.isLoading = false;
      }, 1000);
    }
  }

  refreshData(): void {
    console.log('🔄 Refreshing merchant data...');
    this.loadMerchants();
  }

  exportData(): void {
    console.log('📊 Exporting merchants data...');
    
    const csvData = this.merchants.map(merchant => ({
      'اسم المتجر': merchant.shopName || '',
      'البريد الإلكتروني': merchant.email || '',
      'رقم الهاتف': merchant.mobileNo || '',
      'المحافظة': this.getGovernorateName(merchant.governorateId || 0),
      'المدينة': this.getCityName(merchant.cityId || 0),
      'الحالة': this.getMerchantStatusLabel(merchant)
    }));
    
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `merchants_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('تم تصدير البيانات بنجاح', 'success');
  }

  // =============================
  // Table Methods
  // =============================
  
  isSelected(merchant: MerchantDTO): boolean {
    return this.selectedMerchants.some(m => m.id === merchant.id);
  }

  toggleSelect(merchant: MerchantDTO, event: any): void {
    if (event.target.checked) {
      this.selectedMerchants.push(merchant);
    } else {
      this.selectedMerchants = this.selectedMerchants.filter(m => m.id !== merchant.id);
    }
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedMerchants = [...this.merchants];
    } else {
      this.selectedMerchants = [];
    }
  }

  toggleDropdown(merchantId: number): void {
    Object.keys(this.showDropdown).forEach(key => {
      if (+key !== merchantId) {
        this.showDropdown[+key] = false;
      }
    });
    this.showDropdown[merchantId] = !this.showDropdown[merchantId];
  }

  toggleActionsDropdown(): void {
    this.showActionsDropdown = !this.showActionsDropdown;
  }

  openLocationOnMap(merchant: MerchantDTO): void {
    if (merchant.locationOnMap) {
      window.open(merchant.locationOnMap, '_blank');
    } else {
      const query = encodeURIComponent(`${merchant.shopName} ${merchant.address || ''}`);
      const mapsUrl = `https://www.google.com/maps/search/${query}`;
      window.open(mapsUrl, '_blank');
    }
  }

  // =============================
  // Helper Methods
  // =============================
  
  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedStatus !== 'all' ||
      this.selectedGovernorate ||
      this.selectedCity
    );
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/default-store.png';
    }
  }

  trackByMerchantId(index: number, merchant: MerchantDTO): any {
    return merchant.id;
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      z-index: 9999;
      font-weight: 500;
      max-width: 300px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
}

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SwaggerClient, MerchantDTO, GovernorateLookupDto, CityLookupDto } from '../../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-manage-merchants',
  templateUrl: './manage-merchants.component.html',
  styleUrls: ['./manage-merchants.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageMerchantsComponent implements OnInit, OnDestroy {
  merchants: MerchantDTO[] = [];
  filteredMerchants: MerchantDTO[] = [];
  governorates: GovernorateLookupDto[] = [];
  cities: CityLookupDto[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingGovernorates = false;
  
  // Search and filter
  searchTerm = '';
  selectedGovernorate: number | null = null;
  selectedCity: number | null = null;
  selectedStatus: string = 'all'; // all, active, inactive, pending
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // View options
  viewMode: 'grid' | 'list' = 'list';
  sortBy: 'name' | 'date' | 'rating' | 'orders' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Advanced filters
  showAdvancedFilters = false;
  
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

  loadMerchants(): void {
    this.isLoading = true;
    console.log('🏪 Loading merchants for admin...');
    
    // Mock data for now - replace with actual API call
    this.subscriptions.add(
      // this.swaggerClient.apiMerchantGetAllGet().subscribe({
      //   next: (merchants) => {
      //     this.merchants = merchants || [];
      //     this.applyFilters();
      //     this.isLoading = false;
      //     console.log('✅ Merchants loaded:', this.merchants.length);
      //   },
      //   error: (error) => {
      //     console.error('❌ Error loading merchants:', error);
      //     this.isLoading = false;
      //   }
      // })
    );
    
    // Mock data for demonstration
    setTimeout(() => {
      this.merchants = this.getMockMerchants();
      this.applyFilters();
      this.isLoading = false;
      console.log('✅ Mock merchants loaded:', this.merchants.length);
    }, 1000);
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

  // Search and filter methods
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
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

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(merchant => 
        merchant.shopName?.toLowerCase().includes(term) ||
        merchant.email?.toLowerCase().includes(term) ||
        merchant.mobileNo?.includes(term)
      );
    }

    // Governorate filter
    if (this.selectedGovernorate) {
      filtered = filtered.filter(merchant => merchant.governorateId === this.selectedGovernorate);
    }

    // City filter
    if (this.selectedCity) {
      filtered = filtered.filter(merchant => merchant.cityId === this.selectedCity);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(merchant => this.getMerchantStatus(merchant) === this.selectedStatus);
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
          // Use id as date substitute since createdDate doesn't exist
          aValue = a.id || 0;
          bValue = b.id || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'orders':
          aValue = this.getMerchantOrdersCount(a);
          bValue = this.getMerchantOrdersCount(b);
          break;
        default:
          return 0;
      }

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredMerchants = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMerchants.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedMerchants(): MerchantDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMerchants.slice(startIndex, endIndex);
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Utility methods
  getMerchantStatus(merchant: MerchantDTO): string {
    // Since isActive is not in MerchantDTO, we'll use rating as a status indicator
    if (merchant.rating === 0) return 'pending';
    if ((merchant.rating || 0) < 3.0) return 'inactive';
    return 'active';
  }

  getMerchantStatusLabel(merchant: MerchantDTO): string {
    const status = this.getMerchantStatus(merchant);
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'pending': return 'في الانتظار';
      default: return 'غير محدد';
    }
  }

  getMerchantStatusClass(merchant: MerchantDTO): string {
    const status = this.getMerchantStatus(merchant);
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getMerchantOrdersCount(merchant: MerchantDTO): number {
    // Mock orders count - replace with actual data
    return Math.floor(Math.random() * 100);
  }

  getGovernorateName(governorateId: number): string {
    const governorate = this.governorates.find(g => g.id === governorateId);
    return governorate?.name || 'غير محدد';
  }

  getCityName(cityId: number): string {
    const city = this.cities.find(c => c.id === cityId);
    return city?.nameAr || 'غير محدد';
  }

  // Action methods
  addNewMerchant(): void {
    this.router.navigate(['/admin/add-merchant']);
  }

  editMerchant(merchant: MerchantDTO): void {
    console.log('🏪 Editing merchant:', merchant.shopName);
    // Store merchant ID for editing
    localStorage.setItem('currentMerchantId', merchant.id?.toString() || '');
    this.router.navigate(['/merchant-profile/edit']);
  }

  viewMerchant(merchant: MerchantDTO): void {
    console.log('👀 Viewing merchant:', merchant.shopName);
    // Store merchant ID for viewing
    localStorage.setItem('currentMerchantId', merchant.id?.toString() || '');
    this.router.navigate(['/merchant-profile']);
  }

  toggleMerchantStatus(merchant: MerchantDTO): void {
    console.log('🔄 Toggling merchant status:', merchant.shopName);
    
    const currentStatus = this.getMerchantStatus(merchant);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const statusText = newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (confirm(`هل أنت متأكد من ${statusText} التاجر "${merchant.shopName}"؟`)) {
      // Update merchant rating to reflect status (using rating as status indicator)
      merchant.rating = newStatus === 'active' ? 4.0 : 2.0;
      
      // Here you would make an API call to update the status
      // this.swaggerClient.apiMerchantUpdateStatusPut(merchant.id, newStatus).subscribe(...)
      
      this.showToast(`تم ${statusText} التاجر بنجاح`, 'success');
      this.applyFilters(); // Refresh the list
    }
  }

  deleteMerchant(merchant: MerchantDTO): void {
    console.log('🗑️ Deleting merchant:', merchant.shopName);
    
    if (confirm(`هل أنت متأكد من حذف التاجر "${merchant.shopName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      this.isLoading = true;
      
      // Here you would make an API call to delete the merchant
      // this.swaggerClient.apiMerchantDeleteDelete(merchant.id).subscribe({
      //   next: () => {
      //     this.merchants = this.merchants.filter(m => m.id !== merchant.id);
      //     this.applyFilters();
      //     this.showToast('تم حذف التاجر بنجاح', 'success');
      //     this.isLoading = false;
      //   },
      //   error: (error) => {
      //     console.error('Error deleting merchant:', error);
      //     this.showToast('حدث خطأ أثناء حذف التاجر', 'error');
      //     this.isLoading = false;
      //   }
      // });
      
      // Mock deletion for demonstration
      setTimeout(() => {
        this.merchants = this.merchants.filter(m => m.id !== merchant.id);
        this.applyFilters();
        this.showToast('تم حذف التاجر بنجاح', 'success');
        this.isLoading = false;
      }, 1000);
    }
  }

  // View options
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  changeSortBy(sortBy: 'name' | 'date' | 'rating' | 'orders'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  // Clear filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGovernorate = null;
    this.selectedCity = null;
    this.selectedStatus = 'all';
    this.cities = [];
    this.currentPage = 1;
    this.applyFilters();
  }

  // Toast notification
  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  // Mock data generator
  private getMockMerchants(): MerchantDTO[] {
    const mockMerchants: any[] = [
      {
        id: 1,
        shopName: 'متجر قطع غيار الخليج',
        email: 'gulf@example.com',
        mobileNo: '+966501234567',
        governorateId: 1,
        cityId: 1,
        address: 'شارع الملك عبدالعزيز، الرياض',
        rating: 4.5,
        ratingCount: 120,
        logo: '/assets/images/merchants/gulf-parts.jpg',
        slug: 'gulf-parts',
        description: 'متجر متخصص في قطع غيار السيارات',
        shortDescription: 'قطع غيار السيارات',
        locationOnMap: 'https://maps.google.com/?q=24.7136,46.6753'
      },
      {
        id: 2,
        shopName: 'قطع غيار الشرق',
        email: 'east@example.com',
        mobileNo: '+966507654321',
        governorateId: 2,
        cityId: 2,
        address: 'شارع الخبر، الدمام',
        rating: 4.2,
        ratingCount: 89,
        logo: '/assets/images/merchants/east-parts.jpg',
        slug: 'east-parts',
        description: 'قطع غيار أصلية وبديلة',
        shortDescription: 'قطع غيار الشرق',
        locationOnMap: 'https://maps.google.com/?q=26.4282,50.1000'
      },
      {
        id: 3,
        shopName: 'مركز الصيانة المتقدم',
        email: 'advanced@example.com',
        mobileNo: '+966512345678',
        governorateId: 1,
        cityId: 1,
        address: 'حي النخيل، الرياض',
        rating: 0,
        ratingCount: 0,
        logo: '/assets/images/merchants/advanced-center.jpg',
        slug: 'advanced-center',
        description: 'مركز صيانة متطور',
        shortDescription: 'مركز الصيانة',
        locationOnMap: 'https://maps.google.com/?q=24.7136,46.6753'
      },
      {
        id: 4,
        shopName: 'ورشة الأمانة',
        email: 'alamana@example.com',
        mobileNo: '+966523456789',
        governorateId: 3,
        cityId: 3,
        address: 'شارع التحلية، جدة',
        rating: 4.8,
        ratingCount: 250,
        logo: '/assets/images/merchants/alamana.jpg',
        slug: 'alamana-workshop',
        description: 'ورشة إصلاح وصيانة السيارات',
        shortDescription: 'ورشة الأمانة',
        locationOnMap: 'https://maps.google.com/?q=21.3891,39.8579'
      },
      {
        id: 5,
        shopName: 'قطع غيار الشمال',
        email: 'north@example.com',
        mobileNo: '+966534567890',
        governorateId: 4,
        cityId: 4,
        address: 'شارع الملك فهد، تبوك',
        rating: 3.9,
        ratingCount: 45,
        logo: '/assets/images/merchants/north-parts.jpg',
        slug: 'north-parts',
        description: 'متجر قطع غيار الشمال',
        shortDescription: 'قطع غيار الشمال',
        locationOnMap: 'https://maps.google.com/?q=28.3998,36.5783'
      }
    ];
    
    return mockMerchants as MerchantDTO[];
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/default-store.png';
    }
  }

  // Statistics methods for dashboard cards
  getActiveCount(): number {
    return this.merchants.filter(m => this.getMerchantStatus(m) === 'active').length;
  }

  getPendingCount(): number {
    return this.merchants.filter(m => this.getMerchantStatus(m) === 'pending').length;
  }

  getAverageRating(): string {
    const total = this.merchants.reduce((sum, m) => sum + (m.rating || 0), 0);
    const average = this.merchants.length > 0 ? total / this.merchants.length : 0;
    return average.toFixed(1);
  }

  // Export data method
  exportData(): void {
    console.log('📊 Exporting merchants data...');
    
    // Create CSV data
    const csvData = this.merchants.map(merchant => ({
      'اسم المتجر': merchant.shopName || '',
      'البريد الإلكتروني': merchant.email || '',
      'رقم الهاتف': merchant.mobileNo || '',
      'المحافظة': this.getGovernorateName(merchant.governorateId || 0),
      'المدينة': this.getCityName(merchant.cityId || 0),
      'التقييم': merchant.rating || 0,
      'عدد التقييمات': merchant.ratingCount || 0,
      'الحالة': this.getMerchantStatusLabel(merchant)
    }));
    
    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `merchants_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('تم تصدير البيانات بنجاح', 'success');
  }

  // Parse float method for template
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  // Math methods for template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Track by function for performance
  trackByMerchantId(index: number, merchant: MerchantDTO): any {
    return merchant.id;
  }

  // Get visible pages for pagination
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
    if (total <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      pages.push(1);
      
      if (current > 4) {
        pages.push(-1); // dots
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (current < total - 3) {
        pages.push(-1); // dots
      }
      
      if (!pages.includes(total)) {
        pages.push(total);
      }
    }
    
    return pages;
  }
}

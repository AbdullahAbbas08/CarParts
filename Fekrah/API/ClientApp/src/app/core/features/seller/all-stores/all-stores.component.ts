// all-stores.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { StoresService } from '../../../../Shared/Services/stores.service';

export interface Store {
  id: number;
  arabicName: string;
  description: string;
  arabicDescription: string;
  logo: string;
  rating: number;
  reviewsCount: number;
  location: string;
  arabicLocation: string;
  isVerified: boolean;
  isFeatured: boolean;
  arabicSpecialties: string[];
  openingHours: string;
  arabicOpeningHours: string;
  productsCount: number;
  establishedYear: number;
  tags: string[];
  arabicTags: string[];
  phone?: string;
  email?: string;
  website?: string;
}

export interface FilterOption {
  value: string | number;
  label: string;
  arabicLabel?: string;
   icon?: string;
}

export interface ActiveFilter {
  type: string;
  value: any;
  label: string;
}

export interface SearchFilters {
  verifiedOnly: boolean;
  featuredOnly: boolean;
}

@Component({
  selector: 'app-all-stores',
  templateUrl: './all-stores.component.html',
  styleUrls: ['./all-stores.component.scss']
})
export class AllStoresComponent implements OnInit, OnDestroy {
  // Core data
  stores: Store[] = [];
  filteredStores: Store[] = [];
  
  // Search and filters
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedRating: number = 0;
  selectedLocation: string = 'all';
  sortBy: string = 'name';
  sortOrder: string = 'asc';
  
  // UI state
  currentPage: number = 1;
  itemsPerPage: number = 12;
  isLoading: boolean = false;
  isSearching: boolean = false;
  searchTime: number = 0;
  showAdvancedFilters: boolean = false;
  showSearchSuggestions: boolean = false;
  
  // Voice search
  isVoiceSupported: boolean = false;
  isRecording: boolean = false;
  
  // Search functionality
  searchSubject = new Subject<string>();
  searchHistory: string[] = [];
  searchSuggestions: string[] = [];
  popularSearches: string[] = [
    'قطع محرك',
    'فرامل',
    'إطارات',
    'بطاريات',
    'زيوت',
    'فلاتر'
  ];
  
  // Filter state
  filters: SearchFilters = {
    verifiedOnly: false,
    featuredOnly: false
  };
  
  activeFilters: ActiveFilter[] = [];
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Filter options
  categories: FilterOption[] = [
    { value: 'all', label: 'جميع المتاجر', arabicLabel: 'جميع المتاجر' },
    { value: 'engine', label: 'قطع المحرك', arabicLabel: 'قطع المحرك' },
    { value: 'brakes', label: 'الفرامل', arabicLabel: 'الفرامل' },
    { value: 'tires', label: 'الإطارات', arabicLabel: 'الإطارات' },
    { value: 'electrical', label: 'الكهرباء', arabicLabel: 'الكهرباء' },
    { value: 'body', label: 'قطع الهيكل', arabicLabel: 'قطع الهيكل' },
    { value: 'accessories', label: 'الإكسسوارات', arabicLabel: 'الإكسسوارات' }
  ];

  ratingOptions: FilterOption[] = [
    { value: 0, label: 'جميع التقييمات' },
    { value: 4, label: '4 نجوم فأكثر' },
    { value: 3, label: '3 نجوم فأكثر' },
    { value: 2, label: '2 نجوم فأكثر' }
  ];

  locationOptions: FilterOption[] = [
    { value: 'all', label: 'جميع المحافظات' },
    { value: 'cairo', label: 'القاهرة' },
    { value: 'alexandria', label: 'الإسكندرية' },
    { value: 'giza', label: 'الجيزة' },
    { value: 'mansoura', label: 'المنصورة' },
    { value: 'aswan', label: 'أسوان' },
    { value: 'luxor', label: 'الأقصر' }
  ];

  sortOptions: FilterOption[] = [
    { value: 'name', label: 'الاسم' },
    { value: 'rating', label: 'التقييم' },
    { value: 'reviewsCount', label: 'عدد المراجعات' },
    { value: 'establishedYear', label: 'سنة التأسيس' }
  ];

  constructor(private router: Router, private storesService: StoresService) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.loadStores();
    this.setupSearchDebounce();
    this.loadSearchHistory();
    this.checkVoiceSupport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialization methods
  private initializeComponent(): void {
    this.updateActiveFilters();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performSearch();
      });
  }

  private checkVoiceSupport(): void {
    this.isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private loadSearchHistory(): void {
    const history = localStorage.getItem('store-search-history');
    if (history) {
      this.searchHistory = JSON.parse(history).slice(0, 5);
    }
  }

  private saveSearchHistory(): void {
    localStorage.setItem('store-search-history', JSON.stringify(this.searchHistory));
  }

  // Data loading
  loadStores(): void {
    this.isLoading = true;
    
    // Simulate API call with enhanced mock data
    setTimeout(() => {
      //    this.storesService.getFeaturedStores(8)
      // .pipe(
      //   finalize(() =>    this.isLoading = false)
      // )
      // .subscribe({
      //   next: (stores: any[]) => {

      //   },
      //   error: (error) => {
      //    this.filteredStores = [];
      //   }
      // });
    this.storesService.getFeaturedStores(8).subscribe((res:any) => {
         this.filteredStores = res.map((store:any) => ({
          id: store.sellerId,
          arabicName: store.shopName,
          description: store.description,
          arabicDescription: store.description,
          logo:  store.imageUrl || 'assets/images/image100_100.png',
          rating: store.rating,
          reviewsCount: store.reviewsCount,
          location: store.location,
          arabicLocation: store.location,
          isVerified: store.isVerified || true,
          isFeatured:true,
          arabicSpecialties: store.sellerCategories ? store.sellerCategories.map((category:any) => category.name) : [],
          openingHours: '9:00 AM - 10:00 PM',
          arabicOpeningHours: '9:00 ص - 10:00 م',
          productsCount: 1500,
          establishedYear: 2010,
          tags: ['engine', 'brakes', 'electrical', 'tires'],
          arabicTags: ['محرك', 'فرامل', 'كهرباء', 'إطارات'],
          phone: '+20123456789',
          email: 'info@autozone.com',
          website: 'www.autozone-egypt.com'
          }));
    });
      this.isLoading = false;
      this.sortStores();
    }, 1000);
  }

  // Search functionality
  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.updateSearchSuggestions();
    this.searchSubject.next(this.searchTerm);
  }

  onSearch(): void {
    this.performSearch();
    this.addToSearchHistory(this.searchTerm);
    this.hideSearchSuggestions();
   
  }

  private performSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.isSearching = false;
      this.applyFilters();
      return;
    }

    this.isSearching = true;
    const startTime = performance.now();

    // Simulate search delay for demo
    setTimeout(() => {
      this.applyFilters();
      this.searchTime = Math.round(performance.now() - startTime);
      this.isSearching = false;
    }, 200);
  }

  private updateSearchSuggestions(): void {
    if (this.searchTerm.length === 0) {
      this.searchSuggestions = this.searchHistory;
    } else {
      this.searchSuggestions = this.searchHistory.filter(item =>
        item.includes(this.searchTerm)
      );
    }
  }

  private addToSearchHistory(term: string): void {
    if (term.trim() === '' || this.searchHistory.includes(term)) return;
    
    this.searchHistory.unshift(term);
    this.searchHistory = this.searchHistory.slice(0, 5);
    this.saveSearchHistory();
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.onSearch();
  }

  selectPopularSearch(search: string): void {
    this.searchTerm = search;
    this.onSearch();
  }

  removeSuggestion(suggestion: string): void {
    this.searchHistory = this.searchHistory.filter(item => item !== suggestion);
    this.saveSearchHistory();
    this.updateSearchSuggestions();
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    this.searchSuggestions = [];
    this.saveSearchHistory();
  }

  hideSearchSuggestions(): void {
    setTimeout(() => {
      this.showSearchSuggestions = false;
    }, 200);
  }

  // Voice search
  startVoiceSearch(): void {
    if (!this.isVoiceSupported) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    this.isRecording = true;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.searchTerm = transcript;
      this.onSearch();
      this.isRecording = false;
    };

    recognition.onerror = () => {
      this.isRecording = false;
    };

    recognition.onend = () => {
      this.isRecording = false;
    };

    recognition.start();
  }

  // Filter management
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onCategoryChange(): void {
    this.updateActiveFilters();
    this.applyFilters();
  }

  onLocationChange(): void {
    this.updateActiveFilters();
    this.applyFilters();
  }

  selectRating(rating: any): void {
    this.selectedRating = rating;
    this.updateActiveFilters();
    this.applyFilters();
  }

  onFilterChange(): void {
    this.updateActiveFilters();
    this.applyFilters();
  }

  private updateActiveFilters(): void {
    this.activeFilters = [];

    if (this.selectedCategory !== 'all') {
      const category = this.categories.find(c => c.value === this.selectedCategory);
      if (category) {
        this.activeFilters.push({
          type: 'category',
          value: this.selectedCategory,
          label: category.arabicLabel || category.label
        });
      }
    }

    if (this.selectedLocation !== 'all') {
      const location = this.locationOptions.find(l => l.value === this.selectedLocation);
      if (location) {
        this.activeFilters.push({
          type: 'location',
          value: this.selectedLocation,
          label: location.label
        });
      }
    }

    if (this.selectedRating > 0) {
      const rating = this.ratingOptions.find(r => r.value === this.selectedRating);
      if (rating) {
        this.activeFilters.push({
          type: 'rating',
          value: this.selectedRating,
          label: rating.label
        });
      }
    }

    if (this.filters.verifiedOnly) {
      this.activeFilters.push({
        type: 'verified',
        value: true,
        label: 'متاجر موثقة'
      });
    }

    if (this.filters.featuredOnly) {
      this.activeFilters.push({
        type: 'featured',
        value: true,
        label: 'متاجر مميزة'
      });
    }
  }

  removeFilter(filter: ActiveFilter): void {
    switch (filter.type) {
      case 'category':
        this.selectedCategory = 'all';
        break;
      case 'location':
        this.selectedLocation = 'all';
        break;
      case 'rating':
        this.selectedRating = 0;
        break;
      case 'verified':
        this.filters.verifiedOnly = false;
        break;
      case 'featured':
        this.filters.featuredOnly = false;
        break;
    }
    this.updateActiveFilters();
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredStores = this.stores.filter(store => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        store.arabicName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.arabicDescription.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.arabicSpecialties.some(specialty => 
          specialty.toLowerCase().includes(this.searchTerm.toLowerCase())
        ) ||
        store.arabicTags.some(tag => 
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      // Category filter
      const matchesCategory = this.selectedCategory === 'all' || 
        store.tags.includes(this.selectedCategory);

      // Location filter
      const matchesLocation = this.selectedLocation === 'all' ||
        store.arabicLocation.includes(this.getLocationName(this.selectedLocation));

      // Rating filter
      const matchesRating = this.selectedRating === 0 || 
        store.rating >= this.selectedRating;

      // Verification filter
      const matchesVerified = !this.filters.verifiedOnly || store.isVerified;

      // Featured filter
      const matchesFeatured = !this.filters.featuredOnly || store.isFeatured;

      return matchesSearch && matchesCategory && matchesLocation && 
             matchesRating && matchesVerified && matchesFeatured;
    });

    this.sortStores();
    this.currentPage = 1;
  }

  private getLocationName(locationValue: string): string {
    const location = this.locationOptions.find(l => l.value === locationValue);
    return location ? location.label : '';
  }

  // Sorting
  setSortBy(sortBy: string): void {
    this.sortBy = sortBy;
    this.sortStores();
  }

  setSortOrder(order: string): void {
    this.sortOrder = order;
    this.sortStores();
  }

  sortStores(): void {
    this.filteredStores.sort((a, b) => {
      let aValue = a[this.sortBy as keyof Store];
      let bValue = b[this.sortBy as keyof Store];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedLocation = 'all';
    this.selectedRating = 0;
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.currentPage = 1;
    this.filters = {
      verifiedOnly: false,
      featuredOnly: false
    };
    this.activeFilters = [];
    this.filteredStores = [...this.stores];
    this.sortStores();
    this.showAdvancedFilters = false;
  }

  // Pagination
  get paginatedStores(): Store[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredStores.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStores.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: number[] = [];
    const halfRange = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Navigation
  viewStoreDetails(store: Store): void {
    this.router.navigate(['/stores', store.id]);
  }

  viewStoreProducts(store: Store): void {
    this.router.navigate(['seller'], { queryParams: { store: store.id } });
  }

  addToFavorites(store: Store): void {
    // Implementation for adding to favorites
    console.log('Adding to favorites:', store.arabicName);
  }

  // Utility methods
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  trackByStoreId(index: number, store: Store): number {
    return store.id;
  }


  getWhatsAppLink(phone: string | undefined): string {
  if (!phone) return '';
  const numericPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${numericPhone}`;
}


}
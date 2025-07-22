// enhanced-search.component.ts - مع تشغيل البحث المتقدم عند النقر على input
import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';

export interface SearchSuggestion {
  id?: string;
  text: string;
  category?: string;
  type?: 'product' | 'category' | 'brand' | 'recent';
  icon?: string;
}

export interface SearchResult {
  query: string;
  category?: string;
}

export interface CarSearchFilters {
  brand?: string;
  model?: string;
  year?: string;
  category?: string;
  subcategory?: string;
  query?: string;
}

@Component({
  selector: 'app-enhanced-search',
  templateUrl: './enhanced-search.component.html',
  styleUrls: ['./enhanced-search.component.scss']
})
export class EnhancedSearchComponent implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInputRef!: ElementRef;

  // Inputs
  @Input() placeholder = 'ابحث عن المنتجات، قطع الغيار، أو الخدمات...';
  @Input() categories: any[] = [];
  @Input() isHeaderMode = false;
  @Input() showQuickActions = true;
  @Input() showHistory = true;
  @Input() showVoiceSearch = true;
  @Input() showAdvancedSearch = true; // إضافة خاصية إظهار البحث المتقدم

  // Outputs
  @Output() searchPerformed = new EventEmitter<SearchResult>();
  @Output() suggestionSelected = new EventEmitter<SearchSuggestion>();
  @Output() categoryChanged = new EventEmitter<string>();
  @Output() advancedSearchPerformed = new EventEmitter<CarSearchFilters>();

  // State properties
  searchQuery = '';
  selectedCategory = '';
  showSuggestions = false;
  showAdvancedSearchModal = false; // تغيير الاسم لوضوح أكبر
  isVoiceSearching = false;
  
  // Advanced search filters
  selectedBrand = '';
  selectedModel = '';
  selectedYear = '';
  selectedPartCategory = '';
  selectedSubcategory = '';

  // Data arrays
  suggestions: SearchSuggestion[] = [];
  searchHistory: string[] = [];
  
  // Car brands and models
  carBrands = [
    {
      name: 'تويوتا',
      value: 'toyota',
      models: ['كامري', 'كورولا', 'يارس', 'هايلكس', 'برادو', 'لاند كروزر', 'أفالون', 'RAV4']
    },
    {
      name: 'هوندا',
      value: 'honda',
      models: ['أكورد', 'سيفيك', 'سيتي', 'بايلوت', 'CR-V', 'HR-V']
    },
    {
      name: 'نيسان',
      value: 'nissan',
      models: ['التيما', 'سنترا', 'مكسيما', 'باترول', 'اكس تريل', 'تيدا']
    },
    {
      name: 'مازدا',
      value: 'mazda',
      models: ['مازدا 3', 'مازدا 6', 'CX-5', 'CX-9', 'مياتا']
    },
    {
      name: 'كيا',
      value: 'kia',
      models: ['أوبتيما', 'سيراتو', 'ريو', 'سورينتو', 'سبورتاج']
    },
    {
      name: 'هيونداي',
      value: 'hyundai',
      models: ['إلنترا', 'سوناتا', 'أكسنت', 'توسان', 'سانتا في']
    },
    {
      name: 'مرسيدس',
      value: 'mercedes',
      models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class']
    },
    {
      name: 'بي ام دبليو',
      value: 'bmw',
      models: ['الفئة الثالثة', 'الفئة الخامسة', 'X3', 'X5', 'X1']
    },
    {
      name: 'أودي',
      value: 'audi',
      models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7']
    },
    {
      name: 'لكزس',
      value: 'lexus',
      models: ['ES', 'IS', 'LS', 'RX', 'LX', 'NX']
    }
  ];

  carYears = Array.from({length: 25}, (_, i) => (new Date().getFullYear() - i).toString());

  // Car part categories
  carCategories = [
    {
      name: 'محرك وناقل الحركة',
      icon: 'fas fa-cog',
      subcategories: ['فلتر زيت', 'فلتر هواء', 'شمعات الإشعال', 'حزام التوقيت', 'مضخة المياه', 'مبرد الزيت']
    },
    {
      name: 'نظام الفرامل',
      icon: 'fas fa-stop-circle',
      subcategories: ['أقراص الفرامل', 'فحمات الفرامل', 'سائل الفرامل', 'خراطيم الفرامل', 'اسطوانة الفرامل']
    },
    {
      name: 'نظام التعليق',
      icon: 'fas fa-car',
      subcategories: ['امتصاص الصدمات', 'زنبركات', 'مقصات التعليق', 'كراسي المقص', 'طقم التعليق']
    },
    {
      name: 'نظام التبريد',
      icon: 'fas fa-thermometer-half',
      subcategories: ['مبرد المياه', 'مروحة التبريد', 'خرطوم المياه', 'غطاء المبرد', 'حساس الحرارة']
    },
    {
      name: 'الإضاءة والكهرباء',
      icon: 'fas fa-lightbulb',
      subcategories: ['مصابيح أمامية', 'مصابيح خلفية', 'بطارية', 'مولد الكهرباء', 'بواجي الإشعال']
    },
    {
      name: 'الإطارات والجنوط',
      icon: 'fas fa-circle',
      subcategories: ['إطارات صيفي', 'إطارات شتوي', 'جنوط ألمونيوم', 'جنوط حديد', 'صبابات الإطارات']
    },
    {
      name: 'قطع الهيكل الخارجي',
      icon: 'fas fa-car-side',
      subcategories: ['صدام أمامي', 'صدام خلفي', 'مرايا جانبية', 'أبواب', 'زجاج السيارة']
    },
    {
      name: 'الداخلية والراحة',
      icon: 'fas fa-chair',
      subcategories: ['مقاعد', 'عجلة القيادة', 'طبلون', 'سجاد أرضي', 'مكيف الهواء']
    }
  ];

  // Quick searches for popular car parts
  quickSearches = [
    { text: 'فلتر زيت تويوتا كامري', icon: 'fas fa-filter' },
    { text: 'فحمات فرامل هوندا سيفيك', icon: 'fas fa-stop-circle' },
    { text: 'شمعات إشعال نيسان التيما', icon: 'fas fa-bolt' },
    { text: 'امتصاص صدمات مازدا 3', icon: 'fas fa-car' },
    { text: 'مصابيح أمامية كيا أوبتيما', icon: 'fas fa-lightbulb' },
    { text: 'إطارات ميشلين 195/65/15', icon: 'fas fa-circle' }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.loadSearchHistory();
    this.generateSampleSuggestions();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const searchContainer = this.elementRef.nativeElement.querySelector('.search-container');
    
    if (!searchContainer?.contains(target)) {
      this.showSuggestions = false;
      this.showAdvancedSearchModal = false; // إغلاق البحث المتقدم عند النقر خارجه
    }
  }

  // ========================================
  // تشغيل البحث المتقدم عند النقر على Input
  // ========================================

  onInputClick(): void {
    if (this.showAdvancedSearch) {
      this.showAdvancedSearchModal = true;
      this.showSuggestions = false;
    }
  }

  onInputFocus(): void {
    if (this.showAdvancedSearch && !this.searchQuery.trim()) {
      // إظهار البحث المتقدم عند التركيز إذا كان الحقل فارغ
      this.showAdvancedSearchModal = true;
      this.showSuggestions = false;
    } else {
      // إظهار الاقتراحات عند التركيز إذا كان هناك نص
      this.showSuggestions = true;
      this.showAdvancedSearchModal = false;
    }
  }

  onInputChange(): void {
    if (this.searchQuery.trim()) {
      // إذا بدأ المستخدم في الكتابة، أخفي البحث المتقدم وأظهر الاقتراحات
      this.showAdvancedSearchModal = false;
      this.showSuggestions = true;
      this.updateSuggestions();
    } else {
      // إذا أصبح الحقل فارغ، أظهر البحث المتقدم مرة أخرى
      this.showSuggestions = false;
      if (this.showAdvancedSearch) {
        this.showAdvancedSearchModal = true;
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.showAdvancedSearchModal = false;
      this.searchInputRef?.nativeElement.blur();
    }
  }

  // ========================================
  // Search Functions
  // ========================================

  performSearch(): void {
    if (!this.searchQuery.trim()) return;

    const result: SearchResult = {
      query: this.searchQuery,
      category: this.selectedCategory
    };

    this.addToSearchHistory(this.searchQuery);
    this.showSuggestions = false;
    this.showAdvancedSearchModal = false;
    this.searchPerformed.emit(result);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.text;
    this.showSuggestions = false;
    this.showAdvancedSearchModal = false;
    this.suggestionSelected.emit(suggestion);
  }

  onCategoryChange(): void {
    this.categoryChanged.emit(this.selectedCategory);
  }

  // ========================================
  // Advanced Search Functions
  // ========================================

  performAdvancedSearch(): void {
    const filters: CarSearchFilters = {
      brand: this.selectedBrand,
      model: this.selectedModel,
      year: this.selectedYear,
      category: this.selectedPartCategory,
      subcategory: this.selectedSubcategory,
      query: this.searchQuery
    };

    this.showAdvancedSearchModal = false;
    this.advancedSearchPerformed.emit(filters);
  }

  selectQuickSearch(searchText: string): void {
    this.searchQuery = searchText;
    this.performSearch();
  }

  onBrandChange(): void {
    this.selectedModel = ''; // مسح الموديل عند تغيير الماركة
  }

  getModelsForSelectedBrand(): string[] {
    const brand = this.carBrands.find(b => b.value === this.selectedBrand);
    return brand ? brand.models : [];
  }

  selectCategory(category: any): void {
    this.selectedPartCategory = category.name;
    this.selectedSubcategory = ''; // مسح الفئة الفرعية
  }

  getSubcategoriesForSelectedCategory(): string[] {
    const category = this.carCategories.find(c => c.name === this.selectedPartCategory);
    return category ? category.subcategories : [];
  }

  // ========================================
  // Voice Search
  // ========================================

  startVoiceSearch(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('البحث الصوتي غير مدعوم في هذا المتصفح');
      return;
    }

    this.isVoiceSearching = true;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.searchQuery = transcript;
      this.isVoiceSearching = false;
      this.performSearch();
    };

    recognition.onerror = () => {
      this.isVoiceSearching = false;
      alert('حدث خطأ في البحث الصوتي');
    };

    recognition.onend = () => {
      this.isVoiceSearching = false;
    };

    recognition.start();
  }

  // ========================================
  // Helper Functions
  // ========================================

  private updateSuggestions(): void {
    // محاكاة اقتراحات البحث
   this.suggestions = [
  { text: `${this.searchQuery} تويوتا`, type: 'product' as const, icon: 'fas fa-car' },
  { text: `${this.searchQuery} هوندا`, type: 'product' as const, icon: 'fas fa-car' },
  { text: `${this.searchQuery} نيسان`, type: 'product' as const, icon: 'fas fa-car' },
  { text: `فلتر ${this.searchQuery}`, type: 'category' as const, icon: 'fas fa-filter' },
  { text: `قطع غيار ${this.searchQuery}`, type: 'category' as const, icon: 'fas fa-cog' }
];

  }

  private generateSampleSuggestions(): void {
    this.suggestions = [
      { text: 'فلتر زيت', type: 'product', icon: 'fas fa-filter' },
      { text: 'فحمات فرامل', type: 'product', icon: 'fas fa-stop-circle' },
      { text: 'شمعات إشعال', type: 'product', icon: 'fas fa-bolt' },
      { text: 'امتصاص صدمات', type: 'product', icon: 'fas fa-car' },
      { text: 'مصابيح أمامية', type: 'product', icon: 'fas fa-lightbulb' }
    ];
  }

  private addToSearchHistory(query: string): void {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 5); // الاحتفاظ بآخر 5 عمليات بحث
      this.saveSearchHistory();
    }
  }

  private loadSearchHistory(): void {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      this.searchHistory = JSON.parse(history);
    }
  }

  private saveSearchHistory(): void {
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }
}
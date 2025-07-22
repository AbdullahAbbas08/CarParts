import { Component, HostListener, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  // New filter properties
  @Input() isFilterOpen = false;
  @Output() toggleFilter = new EventEmitter<void>();

  // Existing properties
  isSticky = false;
  searchTerm = '';
  cartCount = 0;
  showMobileMenu = false;
  showMobileNav = false;
  showSearch = false;

  // Enhanced search properties (OLD SYSTEM)
  isSearching = false;
  showSearchSuggestions = false;
  searchSuggestions: string[] = [];
  recentSearches: string[] = [];

  // ===================================
  // NEW SIMPLE SEARCH PROPERTIES
  // ===================================

  // خصائص البحث البسيط
  simpleSearchTerm = '';
  showSimpleAutocomplete = false;
  simpleSearchSuggestions: string[] = [];
  isSearchLoading = false;
  searchFocusIndex = -1;

  // قاعدة بيانات قطع الغيار
  carPartsDatabase = [
    // فلاتر
    'فلتر زيت', 'فلتر هواء', 'فلتر بنزين', 'فلتر مكيف', 'فلتر هيدروليك',

    // إشعال
    'بوجيهات', 'بوجيه إشعال', 'أسلاك بوجيهات', 'كويل إشعال', 'موزع إشعال',

    // فرامل
    'فرامل أمامية', 'فرامل خلفية', 'أقراص فرامل', 'تيل فرامل', 'زيت فرامل',
    'خراطيم فرامل', 'مساعد فرامل', 'اسطوانة فرامل',

    // تعليق
    'مساعدين أمامي', 'مساعدين خلفي', 'زنبرك مساعد', 'كاوتش مساعد',
    'مقص علوي', 'مقص سفلي', 'جلدة مساعد',

    // كهرباء
    'بطارية', 'بطارية جافة', 'بطارية سائلة', 'دينامو', 'فحمات دينامو',
    'منظم دينامو', 'سلف', 'مارش', 'ريلاي',

    // تبريد
    'رادياتير', 'مروحة رادياتير', 'خرطوم رادياتير', 'غطاء رادياتير',
    'ترموستات', 'مضخة ماء', 'سير مروحة',

    // محرك
    'كتاوت', 'سير كتاوت', 'بكرة كتاوت', 'محرك', 'جسم محرك', 'رأس محرك',
    'جوان رأس', 'جوان كارتير', 'سبائك محرك', 'حلقات مكبس',

    // قيادة
    'دركسيون', 'عجلة قيادة', 'مقص دركسيون', 'علبة دركسيون',
    'خرطوم باور', 'زيت باور', 'مضخة باور',

    // إطارات وجنط
    'إطارات', 'جنط', 'كاوتش', 'إطار احتياطي', 'جنط حديد', 'جنط الومنيوم',

    // ناقل حركة
    'ناقل حركة', 'جير عادي', 'جير أوتوماتيك', 'زيت جير', 'فلتر جير',
    'حساس جير', 'سير جير',

    // عادم
    'شكمان', 'دبة تلوث', 'عادم أمامي', 'عادم خلفي', 'حساس أكسجين',

    // إضاءة
    'مصابيح', 'فانوس أمامي', 'فانوس خلفي', 'لمبات', 'لمبة زينون',
    'بروجكتر', 'ليد', 'إشارة جانبية',

    // زجاج ومرايا
    'زجاج أمامي', 'زجاج خلفي', 'زجاج جانبي', 'مرايا', 'مرآة داخلية',
    'مرآة خارجية', 'زجاج مرآة',

    // بودي وأبواب
    'أبواب', 'شنطة', 'كابوت', 'رفرف', 'مقص باب', 'يد باب', 'قفل باب',
    'زجاج كهرباء', 'مجنص نافذة',

    // تكييف
    'مكيف', 'كمبروسور مكيف', 'مكثف مكيف', 'فلتر مكيف', 'غاز مكيف',
    'ترموستات مكيف', 'مروحة مكيف',

    // وقود
    'طلمبة بنزين', 'تانك بنزين', 'خرطوم بنزين', 'حساس بنزين',
    'فوهة رش', 'منظم ضغط',

    // اكسسوارات
    'سجادة أرضية', 'كفرات مقاعد', 'مساند رأس', 'حزام أمان',
    'إسفنج مقاعد', 'تابلوه', 'عداد سرعة'
  ];

  // البحثات الشائعة
  popularCarParts = [
    'فلتر زيت', 'بوجيهات', 'فرامل', 'مساعدين',
    'بطارية', 'رادياتير', 'كتاوت', 'دينامو',
    'دركسيون', 'إطارات', 'شكمان', 'مكيف'
  ];

  // اقتراحات البحث المسبقة (OLD SYSTEM)
  popularSearches = [
    'فلتر زيت',
    'بوجيهات',
    'فرامل',
    'مساعدين',
    'بطارية',
    'رادياتير',
    'كتاوت',
    'دينامو',
    'دركسيون',
    'إطارات'
  ];

  // New properties for orders management
  isMerchant = false;
  isDriver = false;
  isLoggedIn = false;
  userName = '';
  userAvatar = '';
  pendingOrdersCount = 0;
  showUserMenu = false;
  userType: 'customer' | 'merchant' | 'driver' | 'admin' = 'customer';
  deliveryOrdersCount = 0;

  // نصوص الواجهة
  searchPlaceholder = 'ابحث عن قطعة غيار...';
  searchButtonText = 'بحث';
  cartText = 'السلة';

  // قائمة البحث
  searchCategories = {
    default: 'جميع الأقسام',
    options: [
      { value: 'الموتور', label: 'الموتور' },
      { value: 'الكهرباء', label: 'الكهرباء' },
      { value: 'البودي', label: 'البودي' },
      { value: 'الفرامل', label: 'الفرامل' },
      { value: 'اكسسوارات', label: 'اكسسوارات' }
    ]
  };

  // قائمة التنقل الرئيسية
  navItems = [
    { label: 'الرئيسية', type: 'route', target: '/category' },
    { label: 'المتاجر', type: 'section', target: '/seller/all-store' },
    { label: 'الماركات', type: 'section', target: 'brands' },
    { label: 'العروض', type: 'section', target: 'offers' },
    { label: 'أحدث القطع', type: 'section', target: '/category' },
    { label: 'المقترحات', type: 'section', target: '/category' },
    { label: 'الأصناف', type: 'section', target: '/parts' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateCartCount();
    this.loadUserData();
    this.loadPendingOrders();
    this.loadRecentSearches();
    this.loadSimpleSearchData();

    // للتجربة - إظهار pre-navbar
    this.isMerchant = true;
    this.pendingOrdersCount = 7;

    // تحديث عدد العناصر في السلة كل ثانية
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateCartCount();
      this.showSearchSuggestions = false;
    });

    // تحديث عدد الطلبات المعلقة كل 30 ثانية
    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isMerchant || this.isDriver) {
        this.loadPendingOrders();
      }
    });

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeMobileMenus();
      }
    });
  }

  // مراقبة تغييرات isFilterOpen من الـ parent
  ngOnChanges(): void {
    if (!this.isFilterOpen && this.searchMode === 'advanced') {
      this.searchMode = 'simple';
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset > 20;
  }

  // ===================================
  // SEARCH MODE MANAGEMENT
  // ===================================

  searchMode: 'simple' | 'advanced' = 'simple';

  /**
   * تبديل وضع البحث بين البسيط والمتقدم
   */
  toggleSearchMode(): void {
    this.searchMode = this.searchMode === 'simple' ? 'advanced' : 'simple';

    if (this.searchMode === 'advanced') {
      // إظهار البحث المتقدم
      this.showSearch = true;
      this.hideSimpleAutocomplete();
    } else {
      // العودة للبحث البسيط
      this.hideSearchSuggestions();
    }
  }

  /**
   * تفعيل البحث المتقدم
   */
  enableAdvancedSearch(): void {
    this.searchMode = 'advanced';
    this.hideSimpleAutocomplete();

    // إخفاء البحث البسيط في الموبايل
    this.showSearch = false;

    // فتح الفلتر المتقدم
    this.openAdvancedFilter();

    // في الموبايل
    if (window.innerWidth <= 768) {
      this.showMobileMenu = false;
      this.showMobileNav = false;
      this.showUserMenu = false;
    }
  }

  /**
   * تفعيل البحث البسيط
   */
  enableSimpleSearch(): void {
    this.searchMode = 'simple';
    this.hideSearchSuggestions();
    this.showSearch = false;

    // إغلاق الفلتر المتقدم إذا كان مفتوح
    this.closeAdvancedFilter();
  }

  /**
   * التحقق من وضع البحث الحالي
   */
  isSimpleSearchMode(): boolean {
    return this.searchMode === 'simple';
  }

  isAdvancedSearchMode(): boolean {
    return this.searchMode === 'advanced';
  }

  /**
   * تحديث مصطلح البحث
   */
  onSimpleSearchInput(): void {
    const term = this.simpleSearchTerm.trim();

    if (term.length === 0) {
      this.showDefaultSimpleAutocomplete();
    } else if (term.length >= 2) {
      this.updateSimpleSearchSuggestions(term);
      this.showSimpleAutocomplete = true;
    } else {
      this.hideSimpleAutocomplete();
    }
  }

  /**
   * تحديث اقتراحات البحث
   */
  updateSimpleSearchSuggestions(term: string): void {
    const normalizedTerm = this.normalizeArabicText(term.toLowerCase());

    // البحث في قاعدة البيانات
    const suggestions = this.carPartsDatabase.filter(part => {
      const normalizedPart = this.normalizeArabicText(part.toLowerCase());
      return normalizedPart.includes(normalizedTerm) ||
             part.toLowerCase().includes(term.toLowerCase());
    });

    // البحث في البحثات الأخيرة
    const recentMatches = this.recentSearches.filter(search => {
      const normalizedSearch = this.normalizeArabicText(search.toLowerCase());
      return normalizedSearch.includes(normalizedTerm) ||
             search.toLowerCase().includes(term.toLowerCase());
    });

    // دمج النتائج وإزالة المكرر
    const allSuggestions = [...new Set([...recentMatches, ...suggestions])];

    // الحد الأقصى 10 اقتراحات
    this.simpleSearchSuggestions = allSuggestions.slice(0, 10);
  }

  /**
   * تطبيع النص العربي للبحث الأفضل
   */
  normalizeArabicText(text: string): string {
    return text
      .replace(/[أإآ]/g, 'ا')  // توحيد الألف
      .replace(/[ؤ]/g, 'و')    // توحيد الواو
      .replace(/[ئي]/g, 'ي')   // توحيد الياء
      .replace(/[ة]/g, 'ه')    // توحيد التاء المربوطة
      .replace(/[ك]/g, 'ك')    // توحيد الكاف
      .replace(/\s+/g, ' ')    // توحيد المسافات
      .trim();
  }

  /**
   * إظهار الاقتراحات الافتراضية
   */
  showDefaultSimpleAutocomplete(): void {
    this.simpleSearchSuggestions = [
      ...this.recentSearches.slice(0, 5),
      ...this.popularCarParts.slice(0, 8)
    ];
    this.showSimpleAutocomplete = this.simpleSearchSuggestions.length > 0;
  }

  /**
   * إخفاء اقتراحات البحث
   */
  hideSimpleAutocomplete(): void {
    this.showSimpleAutocomplete = false;
    this.searchFocusIndex = -1;
  }

  /**
   * التركيز على البحث
   */
  onSimpleSearchFocus(): void {
    if (this.simpleSearchTerm.length >= 2) {
      this.updateSimpleSearchSuggestions(this.simpleSearchTerm);
    } else {
      this.showDefaultSimpleAutocomplete();
    }
    this.showSimpleAutocomplete = this.simpleSearchSuggestions.length > 0;
  }

  /**
   * فقدان التركيز
   */
  onSimpleSearchBlur(): void {
    // تأخير إخفاء الاقتراحات للسماح بالنقر عليها
    setTimeout(() => {
      this.hideSimpleAutocomplete();
    }, 200);
  }

  /**
   * معالجة ضغط المفاتيح
   */
  onSimpleSearchKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (this.searchFocusIndex >= 0 && this.simpleSearchSuggestions[this.searchFocusIndex]) {
          this.selectSimpleSuggestion(this.simpleSearchSuggestions[this.searchFocusIndex]);
        } else {
          this.performSimpleSearch();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.searchFocusIndex = this.searchFocusIndex < this.simpleSearchSuggestions.length - 1
          ? this.searchFocusIndex + 1
          : 0;
        this.updateFocusedSuggestion();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.searchFocusIndex = this.searchFocusIndex > 0
          ? this.searchFocusIndex - 1
          : this.simpleSearchSuggestions.length - 1;
        this.updateFocusedSuggestion();
        break;

      case 'Escape':
        this.hideSimpleAutocomplete();
        break;
    }
  }

  /**
   * تحديث العنصر المركز عليه في القائمة
   */
  updateFocusedSuggestion(): void {
    // يمكن إضافة logic لتحديث UI هنا
  }

  /**
   * اختيار اقتراح من القائمة
   */
  selectSimpleSuggestion(suggestion: string): void {
    this.simpleSearchTerm = suggestion;
    this.hideSimpleAutocomplete();
    this.performSimpleSearch();
  }

  /**
   * تنفيذ البحث
   */
  performSimpleSearch(): void {
    const query = this.simpleSearchTerm.trim();
    if (!query) return;

    // إضافة تأثير التحميل
    this.isSearchLoading = true;

    // حفظ البحث في القائمة الأخيرة
    this.saveSimpleRecentSearch(query);

    // محاكاة تأخير البحث
    setTimeout(() => {
      this.isSearchLoading = false;

      // التنقل إلى صفحة البحث
      this.router.navigate(['/search'], {
        queryParams: { q: query, type: 'parts' }
      });

      // إخفاء البحث في الموبايل
      this.hideSimpleSearch();
    }, 800);
  }

  /**
   * حفظ البحث في القائمة الأخيرة
   */
  saveSimpleRecentSearch(term: string): void {
    if (!term.trim()) return;

    // إزالة البحث إذا كان موجود مسبقاً
    this.recentSearches = this.recentSearches.filter(search =>
      search.toLowerCase() !== term.toLowerCase()
    );

    // إضافة البحث في المقدمة
    this.recentSearches.unshift(term.trim());

    // الاحتفاظ بآخر 10 بحثات فقط
    this.recentSearches = this.recentSearches.slice(0, 10);

    // حفظ في localStorage
    try {
      localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }

  /**
   * مسح نص البحث
   */
  clearSimpleSearch(): void {
    this.simpleSearchTerm = '';
    this.hideSimpleAutocomplete();

    // التركيز على خانة البحث
    setTimeout(() => {
      const searchInput = document.querySelector('#simpleSearchInput') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }

  /**
   * إظهار/إخفاء البحث في الموبايل
   */
  toggleSimpleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      this.showMobileMenu = false;
      this.showMobileNav = false;
      this.showUserMenu = false;

      // التركيز على البحث بعد الانتهاء من الانيميشن
      setTimeout(() => {
        const searchInput = document.querySelector('#simpleSearchInput') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    }
  }

  /**
   * إخفاء البحث في الموبايل
   */
  hideSimpleSearch(): void {
    this.showSearch = false;
    this.hideSimpleAutocomplete();
  }

  /**
   * فلترة الاقتراحات حسب النوع
   */
  getFilteredSuggestions(type: 'recent' | 'suggestions' | 'popular'): string[] {
    const term = this.simpleSearchTerm.toLowerCase().trim();

    switch (type) {
      case 'recent':
        return term.length > 0
          ? this.recentSearches.filter(search =>
              search.toLowerCase().includes(term)
            ).slice(0, 5)
          : this.recentSearches.slice(0, 5);

      case 'suggestions':
        if (term.length < 2) return [];
        return this.simpleSearchSuggestions.filter(suggestion =>
          !this.recentSearches.includes(suggestion)
        ).slice(0, 6);

      case 'popular':
        return term.length === 0
          ? this.popularCarParts.filter(popular =>
              !this.recentSearches.includes(popular)
            ).slice(0, 6)
          : [];

      default:
        return [];
    }
  }

  /**
   * التحقق من وجود اقتراحات
   */
  hasSimpleSuggestions(): boolean {
    return this.getFilteredSuggestions('recent').length > 0 ||
           this.getFilteredSuggestions('suggestions').length > 0 ||
           this.getFilteredSuggestions('popular').length > 0;
  }

  /**
   * مسح البحثات الأخيرة
   */
  clearSimpleRecentSearches(): void {
    this.recentSearches = [];
    try {
      localStorage.removeItem('recent_searches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }

    // تحديث الاقتراحات
    if (this.simpleSearchTerm.length >= 2) {
      this.updateSimpleSearchSuggestions(this.simpleSearchTerm);
    } else {
      this.showDefaultSimpleAutocomplete();
    }
  }

  /**
   * البحث السريع - للاختصارات
   */
  quickSearch(query: string): void {
    this.simpleSearchTerm = query;
    this.performSimpleSearch();
  }

  /**
   * تحميل بيانات البحث
   */
  loadSimpleSearchData(): void {
    // تحميل البحثات الأخيرة
    try {
      const recent = localStorage.getItem('recent_searches');
      this.recentSearches = recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      this.recentSearches = [];
    }

    // إعداد الاقتراحات الافتراضية
    this.showDefaultSimpleAutocomplete();
  }

  /**
   * تمييز النص المطابق في الاقتراحات
   */
  highlightMatch(text: string, term: string): string {
    if (!term || term.length < 2) return text;

    const normalizedTerm = this.normalizeArabicText(term.toLowerCase());
    const normalizedText = this.normalizeArabicText(text.toLowerCase());

    const index = normalizedText.indexOf(normalizedTerm);
    if (index >= 0) {
      const beforeMatch = text.substring(0, index);
      const match = text.substring(index, index + term.length);
      const afterMatch = text.substring(index + term.length);
      return `${beforeMatch}<mark class="highlight">${match}</mark>${afterMatch}`;
    }

    return text;
  }

  /**
   * تصنيف قطع الغيار
   */
  categorizeCarPart(part: string): string {
    const categories = {
      'فلاتر': ['فلتر'],
      'إشعال': ['بوجي', 'كويل', 'إشعال'],
      'فرامل': ['فرامل', 'تيل', 'قرص'],
      'تعليق': ['مساعد', 'زنبرك', 'مقص'],
      'كهرباء': ['بطارية', 'دينامو', 'سلف', 'مارش'],
      'تبريد': ['رادياتير', 'مروحة', 'ترموستات'],
      'محرك': ['كتاوت', 'محرك', 'جوان'],
      'قيادة': ['دركسيون', 'باور'],
      'إطارات': ['إطار', 'جنط', 'كاوتش'],
      'عادم': ['شكمان', 'عادم', 'دبة'],
      'إضاءة': ['فانوس', 'لمبة', 'مصباح'],
      'تكييف': ['مكيف', 'كمبروسور'],
      'وقود': ['طلمبة', 'تانك', 'بنزين']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => part.includes(keyword))) {
        return category;
      }
    }

    return 'عام';
  }

  // ===================================
  // OLD SEARCH SYSTEM METHODS (KEEP FOR COMPATIBILITY)
  // ===================================

  // New filter method
  onFilterToggle(): void {
    this.toggleFilter.emit();
  }

  /**
   * فتح الفلتر المتقدم مباشرة
   */
  openAdvancedFilter(): void {
    // إذا الفلتر مش مفتوح، افتحه
    if (!this.isFilterOpen) {
      this.toggleFilter.emit();
    }
  }

  /**
   * إغلاق الفلتر المتقدم مباشرة
   */
  closeAdvancedFilter(): void {
    // إذا الفلتر مفتوح، اقفله
    if (this.isFilterOpen) {
      this.toggleFilter.emit();
    }
  }

  // Enhanced Search Methods
  loadRecentSearches(): void {
    try {
      const recent = localStorage.getItem('recent_searches');
      this.recentSearches = recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      this.recentSearches = [];
    }
  }

  saveRecentSearch(term: string): void {
    if (!term.trim()) return;

    // إزالة البحث إذا كان موجود مسبقاً
    this.recentSearches = this.recentSearches.filter(search =>
      search.toLowerCase() !== term.toLowerCase()
    );

    // إضافة البحث في المقدمة
    this.recentSearches.unshift(term.trim());

    // الاحتفاظ بآخر 10 بحثات فقط
    this.recentSearches = this.recentSearches.slice(0, 10);

    // حفظ في localStorage
    try {
      localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }

  search(): void {
    if (!this.searchTerm.trim()) return;

    // إضافة تأثير البحث
    this.isSearching = true;
    this.hideSearchSuggestions();

    // إضافة كلاس للزر للتأثير البصري
    const searchButton = document.querySelector('.search-button') as HTMLElement;
    if (searchButton) {
      searchButton.classList.add('searching');
    }

    // حفظ البحث في القائمة الأخيرة
    this.saveRecentSearch(this.searchTerm);

    // محاكاة تأخير البحث للتأثير البصري
    setTimeout(() => {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchTerm }
      }).then(() => {
        this.isSearching = false;
        if (searchButton) {
          searchButton.classList.remove('searching');
        }
      });
    }, 500);
  }

  onSearchInput(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (term.length === 0) {
      this.hideSearchSuggestions();
      return;
    }

    if (term.length >= 2) {
      this.updateSearchSuggestions(term);
      this.showSearchSuggestions = false;
    } else {
      this.hideSearchSuggestions();
    }
  }

  updateSearchSuggestions(term: string): void {
    const suggestions: string[] = [];

    // إضافة البحثات الأخيرة المطابقة
    const matchingRecent = this.recentSearches.filter(search =>
      search.toLowerCase().includes(term)
    );
    suggestions.push(...matchingRecent);

    // إضافة البحثات الشائعة المطابقة
    const matchingPopular = this.popularSearches.filter(search =>
      search.toLowerCase().includes(term) &&
      !suggestions.some(s => s.toLowerCase() === search.toLowerCase())
    );
    suggestions.push(...matchingPopular);

    // الحد الأقصى 8 اقتراحات
    this.searchSuggestions = suggestions.slice(0, 8);
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.hideSearchSuggestions();
    this.search();
  }

  hideSearchSuggestions(): void {
    this.showSearchSuggestions = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.hideSearchSuggestions();

    // التركيز على خانة البحث
    const searchInput = document.querySelector('.search-bar input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.search();
    } else if (event.key === 'Escape') {
      this.hideSearchSuggestions();
    } else if (event.key === 'ArrowDown' && this.showSearchSuggestions) {
      // يمكن إضافة navigation بالأسهم لاحقاً
      event.preventDefault();
    }
  }

  onSearchFocus(): void {
    if (this.searchTerm.length >= 2) {
      this.updateSearchSuggestions(this.searchTerm.toLowerCase());
      this.showSearchSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // تأخير إخفاء الاقتراحات للسماح بالنقر عليها
    setTimeout(() => {
      this.hideSearchSuggestions();
    }, 200);
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    try {
      localStorage.removeItem('recent_searches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }

  // ===================================
  // USER MANAGEMENT METHODS
  // ===================================

  // Load user data from localStorage or service
  loadUserData(): void {
    try {
      const userData = localStorage.getItem('user_data');
      const authToken = localStorage.getItem('auth_token');

      if (authToken && userData) {
        const user = JSON.parse(userData);
        this.isLoggedIn = true;
        this.userName = user.name || user.username || 'المستخدم';
        this.userAvatar = user.avatar || '';
        this.userType = user.type || 'customer';
        this.isMerchant = this.userType === 'merchant';
        this.isDriver = this.userType === 'driver';
      } else {
        this.resetUserData();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.resetUserData();
    }
  }

  // Reset user data
  resetUserData(): void {
    this.isLoggedIn = false;
    this.userName = '';
    this.userAvatar = '';
    this.userType = 'customer';
    this.isMerchant = false;
    this.isDriver = false;
    this.pendingOrdersCount = 0;
    this.deliveryOrdersCount = 0;
  }

  // Load pending orders count
  loadPendingOrders(): void {
    if (this.isMerchant) {
      try {
        const mockPendingOrders = localStorage.getItem('pending_orders_count');
        this.pendingOrdersCount = mockPendingOrders ? parseInt(mockPendingOrders) : 0;
      } catch (error) {
        console.error('Error loading pending orders:', error);
        this.pendingOrdersCount = 0;
      }
    }

    if (this.isDriver) {
      try {
        const mockDeliveryOrders = localStorage.getItem('delivery_orders_count');
        this.deliveryOrdersCount = mockDeliveryOrders ? parseInt(mockDeliveryOrders) : 0;
      } catch (error) {
        console.error('Error loading delivery orders:', error);
        this.deliveryOrdersCount = 0;
      }
    }
  }

  // Toggle user menu dropdown
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  // Switch to customer mode
  switchToCustomerMode(): void {
    if (this.isMerchant || this.isDriver) {
      this.isMerchant = false;
      this.isDriver = false;
      this.showUserMenu = false;
      localStorage.setItem('view_mode', 'customer');
      this.router.navigate(['/']);
    }
  }

  // Logout function
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('view_mode');
    localStorage.removeItem('pending_orders_count');
    this.resetUserData();
    this.showUserMenu = false;
    this.router.navigate(['/auth/login']);
  }

  // Get user initials for avatar fallback
  getUserInitials(): string {
    if (!this.userName) return 'M';
    return this.userName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  // ===================================
  // NAVIGATION METHODS
  // ===================================

  // Navigation functions
  goToNavItem(item: any) {
    this.router.navigateByUrl(item.target);
    this.closeMobileMenus();
  }

  // Scroll to section
  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = window.innerHeight / 2 - el.offsetHeight / 2;
      const y = el.getBoundingClientRect().top + window.scrollY - yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  // ===================================
  // CART MANAGEMENT METHODS
  // ===================================

  // Update cart count
  updateCartCount(): void {
    this.cartCount = 0;
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        if (Array.isArray(cart)) {
          this.cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
  }

  // Cart functions
  goToCart() {
    this.router.navigate(['/cart']);
  }

  addToCart(item: any) {
    const cartData = localStorage.getItem('cart');
    let cart = [];

    if (cartData) {
      try {
        cart = JSON.parse(cartData);
      } catch (e) {
        cart = [];
      }
    }

    const existingItem = cart.find((cartItem: any) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartCount();
  }

  // ===================================
  // MOBILE MENU METHODS
  // ===================================

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.showMobileNav = false;
      this.showSearch = false;
      this.showUserMenu = false;
    }
  }

  toggleMobileNav(): void {
    this.showMobileNav = !this.showMobileNav;
    if (this.showMobileNav) {
      this.showMobileMenu = false;
      this.showSearch = false;
      this.showUserMenu = false;
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      this.showMobileMenu = false;
      this.showMobileNav = false;
      this.showUserMenu = false;
    }
  }

  // Close all mobile menus - UPDATED TO INCLUDE SIMPLE SEARCH
  closeMobileMenus(): void {
    this.showMobileMenu = false;
    this.showMobileNav = false;
    this.showSearch = false;
    this.showUserMenu = false;
    this.hideSearchSuggestions();
    this.hideSimpleAutocomplete();
  }

  // ===================================
  // EVENT LISTENERS
  // ===================================

  // Listen for window resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 768) {
      this.closeMobileMenus();
    }
  }

  // Close menus when clicking outside - UPDATED TO INCLUDE SIMPLE SEARCH
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    const target = event.target;

    // معالجة البحث البسيط
    const simpleSearchBar = document.querySelector('.simple-search-bar');
    const simpleAutocomplete = document.querySelector('.autocomplete-dropdown');

    if (this.showSimpleAutocomplete &&
        !simpleSearchBar?.contains(target) &&
        !simpleAutocomplete?.contains(target)) {
      this.hideSimpleAutocomplete();
    }

    // معالجة البحث في الموبايل
    const centerSearch = document.querySelector('.center-search');
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');

    if (this.showSearch &&
        !centerSearch?.contains(target) &&
        target !== mobileSearchToggle) {
      this.hideSimpleSearch();
    }

    // معالجة البحث القديم
    const searchBar = document.querySelector('.search-bar');
    const searchSuggestions = document.querySelector('.search-suggestions');

    if (this.showSearchSuggestions &&
        !searchBar?.contains(target) &&
        !searchSuggestions?.contains(target)) {
      this.hideSearchSuggestions();
    }

    // باقي القوائم
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navToggle = document.querySelector('.nav-toggle');
    const searchToggle = document.querySelector('.search-toggle');
    const userMenu = document.querySelector('.user-menu');

    if (this.showMobileMenu && !target.closest('.right-menu') && target !== mobileMenuToggle) {
      this.showMobileMenu = false;
    }

    if (this.showMobileNav && !target.closest('.main-nav') && target !== navToggle) {
      this.showMobileNav = false;
    }

    if (this.showSearch && !target.closest('.search-bar') && target !== searchToggle) {
      this.showSearch = false;
    }

    if (this.showUserMenu && !target.closest('.user-menu') && target !== userMenu) {
      this.showUserMenu = false;
    }
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  /**
   * احصائيات البحث
   */
  getSearchStats(): { total: number; categories: Record<string, number> } {
    const categories: Record<string, number> = {};

    this.recentSearches.forEach(search => {
      const category = this.categorizeCarPart(search);
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      total: this.recentSearches.length,
      categories
    };
  }

  /**
   * تصدير البحثات الأخيرة
   */
  exportRecentSearches(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      searches: this.recentSearches,
      stats: this.getSearchStats()
    }, null, 2);
  }

  /**
   * استيراد البحثات الأخيرة
   */
  importRecentSearches(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.searches && Array.isArray(imported.searches)) {
        this.recentSearches = imported.searches.slice(0, 10);
        this.saveSimpleRecentSearch(''); // حفظ التحديث
        return true;
      }
    } catch (error) {
      console.error('Error importing searches:', error);
    }
    return false;
  }

  // ===================================
  // DEBUG FUNCTIONS (FOR TESTING)
  // ===================================

  // Debug functions للتجربة
  debugSimulateMerchant(): void {
    this.isMerchant = true;
    this.isDriver = false;
    this.pendingOrdersCount = 5;
    console.log('تم تفعيل وضع التاجر');
  }

  debugSimulateDriver(): void {
    this.isDriver = true;
    this.isMerchant = false;
    this.deliveryOrdersCount = 3;
    console.log('تم تفعيل وضع المراسل');
  }

  debugClearMode(): void {
    this.isMerchant = false;
    this.isDriver = false;
    this.pendingOrdersCount = 0;
    this.deliveryOrdersCount = 0;
    console.log('تم إلغاء جميع الأوضاع');
  }

  debugTestSimpleSearch(): void {
    console.log('Testing Simple Search:');
    console.log('Car Parts Database:', this.carPartsDatabase.length, 'items');
    console.log('Recent Searches:', this.recentSearches);
    console.log('Popular Parts:', this.popularCarParts);
    console.log('Current Search Term:', this.simpleSearchTerm);
    console.log('Autocomplete Visible:', this.showSimpleAutocomplete);
  }

  debugAddTestSearches(): void {
    const testSearches = ['فلتر زيت', 'بوجيهات', 'فرامل أمامية', 'رادياتير'];
    testSearches.forEach(search => this.saveSimpleRecentSearch(search));
    console.log('تم إضافة بحثات تجريبية:', testSearches);
  }

  debugClearAllData(): void {
    this.recentSearches = [];
    this.simpleSearchTerm = '';
    this.hideSimpleAutocomplete();
    localStorage.removeItem('recent_searches');
    console.log('تم مسح جميع بيانات البحث');
  }

  debugTestFilterToggle(): void {
    console.log('Current filter state:', this.isFilterOpen);
    console.log('Current search mode:', this.searchMode);
    console.log('Testing filter toggle...');
    this.openAdvancedFilter();
  }

  debugForceOpenFilter(): void {
    console.log('Force opening filter...');
    this.toggleFilter.emit();
  }
}

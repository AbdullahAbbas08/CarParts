

import { Component, OnInit, OnDestroy, HostListener, Renderer2, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterService } from './Shared/Services/filter.service';
import { AuthService } from './core/features/auth/auth.service';
import { FilterSections, SelectedFilters } from './Shared/components/filters-sidebar/filters-sidebar.component';

interface UserData {
  isLoggedIn: boolean;
  isMerchant: boolean;
  isDriver: boolean;
  userName: string;
  userAvatar: string;
  userType: 'customer' | 'merchant' | 'driver' | 'admin';
  pendingOrdersCount: number;
  deliveryOrdersCount: number;
}

interface FilterData {
  searchText?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  partCategory?: string;
  priceRange?: string;
  location?: string;
  inStock?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'قطع غيار';
  private destroy$ = new Subject<void>();

  filtersOpened = false;
  isMobile = false;
  isTablet = false;
  showDisabledMessage = false; // لإظهار رسالة التعطيل (اختياري)

  // للتحكم في تأثيرات الانميشن
  private animationTimeout: any;

  // Filter-related properties
  filterSections: FilterSections[] = [
    { key: 'brands', title: 'الماركات', icon: 'fa-tag' },
    { key: 'models', title: 'الموديلات', icon: 'fa-car' },
    { key: 'years', title: 'السنوات', icon: 'fa-calendar' },
    { key: 'types', title: 'الأنواع', icon: 'fa-cogs' },
    { key: 'price', title: 'السعر', icon: 'fa-dollar-sign' },
    { key: 'categories', title: 'التصنيفات', icon: 'fa-list' },
    { key: 'condition', title: 'الحالة', icon: 'fa-star' }
  ];

  availableBrands: string[] = ['تويوتا', 'هوندا', 'نيسان', 'مازدا', 'ميتسوبيشي', 'هيونداي', 'كيا'];
  availableModels: string[] = ['كورولا', 'كامري', 'أكورد', 'سيفيك', 'التيما', 'سنترا'];
  availableYears: string[] = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
  availableTypes: string[] = ['محرك', 'فرامل', 'إطارات', 'بطارية', 'زيوت', 'مرشحات'];
  availableCategories: string[] = ['قطع أصلية', 'قطع تقليد', 'قطع مستعملة', 'إكسسوارات'];
  availableConditions: string[] = ['جديد', 'مستعمل بحالة ممتازة', 'مستعمل بحالة جيدة', 'يحتاج إصلاح'];

  selectedFilters: SelectedFilters = {
    brands: [],
    models: [],
    years: [],
    types: [],
    categories: [],
    condition: [],
    priceRange: { min: 0, max: 10000 }
  };

  activeFilterSection: string = '';

  userData: UserData = {
    isLoggedIn: true,
    isMerchant: false,
    isDriver: false,
    userName: 'أدمن النظام',
    userAvatar: '/assets/images/admin-avatar.png',
    userType: 'admin',
    pendingOrdersCount: 5,
    deliveryOrdersCount: 3
  };

  constructor(
    private filterService: FilterService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    public authService:AuthService
  ) {
    this.checkDeviceType();
  }

  ngOnInit(): void {
    this.setupAdminTestData(); // إعداد بيانات اختبار للأدمن
    this.loadUserData();
    this.setupOrdersUpdateInterval();
    this.initializePageSetup();
    
    // الاشتراك في حالة الشريط الجانبي من الخدمة
    this.filterService.sidebarState$.subscribe(isOpen => {
      console.log('App component: Sidebar state changed to:', isOpen);
      console.log('App component: filtersOpened BEFORE =', this.filtersOpened);
      this.filtersOpened = isOpen;
      console.log('App component: filtersOpened AFTER =123', this.filtersOpened);
      
      if (isOpen) {
        this.applyFilterOpenStyles();
      } else {
        this.applyFilterCloseStyles();
      }
    });

    console.log('App component initialized with FilterService');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  // مراقبة تغيير حجم الشاشة
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkDeviceType();

    // إغلاق الفلتر تلقائياً عند التبديل من الجوال للكمبيوتر
    if (!this.isMobile && !this.isTablet && this.filtersOpened) {
      this.closeFilters();
    }
  }

  // إغلاق الفلتر عند الضغط على Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.filtersOpened) {
      this.closeFilters();
    }
  }

  // منع التمرير عند فتح الفلتر في الجوال
  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.filtersOpened && (this.isMobile || this.isTablet)) {
      event.preventDefault();
    }
  }

  private checkDeviceType(): void {
    const width = window.innerWidth;
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 1024;
  }

  private initializePageSetup(): void {
    // إضافة classes أساسية للـ body
    this.renderer.addClass(document.body, 'app-initialized');
    this.renderer.setStyle(document.body, 'overflow-x', 'hidden');
  }

  toggleFilters(): void {
    this.filterService.toggleSidebar();
  }

  private openFilters(): void {
    this.filterService.openSidebar();
  }

  closeFilters(): void {
    this.filterService.closeSidebar();
  }

  private applyFilterOpenStyles(): void {
    // إضافة class للـ body
    this.renderer.addClass(document.body, 'filter-open');

    // تعطيل التمرير في جميع الشاشات
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.renderer.setStyle(document.body, 'height', '100vh');

    // منع التفاعل مع الخلفية
    this.renderer.setStyle(document.body, 'user-select', 'none');

    // في الجوال والتابلت، منع التمرير إضافي
    if (this.isMobile || this.isTablet) {
      this.renderer.setStyle(document.body, 'position', 'fixed');
      this.renderer.setStyle(document.body, 'width', '100%');
    }

    // تأثير تأخير لسلاسة الانميشن
    this.animationTimeout = setTimeout(() => {
      this.renderer.addClass(document.body, 'filter-animation-complete');
    }, 100);

    // إحصائيات الاستخدام
    this.trackFilterUsage('opened');
  }

  private applyFilterCloseStyles(): void {
    this.showDisabledMessage = false;

    // إزالة classes
    this.renderer.removeClass(document.body, 'filter-open');
    this.renderer.removeClass(document.body, 'filter-animation-complete');

    // استعادة التمرير والتفاعل
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'height');
    this.renderer.removeStyle(document.body, 'user-select');
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'width');

    // مسح timeout إذا كان موجود
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    // إحصائيات الاستخدام
    this.trackFilterUsage('closed');
  }

  handleFilters(filters: FilterData): void {
    try {
      // تحديث الفلاتر في الخدمة
      this.filterService.updateFilters(filters);

      // حفظ الفلاتر المطبقة
      this.saveFilterState(filters);

      // إحصائيات الفلاتر المطبقة
      this.trackFilterUsage('applied', filters);

      console.log('Applied filters:', filters);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  private loadUserData(): void {
    this.authService.autoAuthUser();
  }

  private resetUserData(): void {
    this.userData = {
      isLoggedIn: false,
      isMerchant: false,
      isDriver: false,
      userName: '',
      userAvatar: '',
      userType: 'customer',
      pendingOrdersCount: 0,
      deliveryOrdersCount: 0
    };
  }

  private setupOrdersUpdateInterval(): void {
    // تحديث عداد الطلبات كل 30 ثانية للمستخدمين المسجلين
    setInterval(() => {
      if (this.userData.isLoggedIn) {
        this.updateOrdersCounts();
      }
    }, 30000);
  }

  private updateOrdersCounts(): void {
    try {
      if (this.userData.isMerchant) {
        const pendingOrders = localStorage.getItem('pending_orders_count');
        this.userData.pendingOrdersCount = pendingOrders ? parseInt(pendingOrders, 10) : 0;
      }

      if (this.userData.isDriver) {
        const deliveryOrders = localStorage.getItem('delivery_orders_count');
        this.userData.deliveryOrdersCount = deliveryOrders ? parseInt(deliveryOrders, 10) : 0;
      }
    } catch (error) {
      console.error('Error updating orders counts:', error);
    }
  }

  // دالة مساعدة لحفظ حالة الفلتر
  private saveFilterState(filters: FilterData): void {
    try {
      localStorage.setItem('saved_filters', JSON.stringify(filters));
      localStorage.setItem('filter_last_used', new Date().toISOString());
    } catch (error) {
      console.error('Error saving filter state:', error);
    }
  }

  // دالة مساعدة لاستعادة حالة الفلتر
  loadFilterState(): FilterData | null {
    try {
      const saved = localStorage.getItem('saved_filters');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading filter state:', error);
      return null;
    }
  }

  // تتبع استخدام الفلتر للإحصائيات
  private trackFilterUsage(action: string, filters?: FilterData): void {
    try {
      const usage = {
        action,
        timestamp: new Date().toISOString(),
        deviceType: this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop',
        filters: filters || null,
        userType: this.userData.userType
      };

      // حفظ في localStorage للإحصائيات
      const existingUsage = JSON.parse(localStorage.getItem('filter_usage') || '[]');
      existingUsage.push(usage);

      // الاحتفاظ بآخر 100 حدث فقط
      const recentUsage = existingUsage.slice(-100);
      localStorage.setItem('filter_usage', JSON.stringify(recentUsage));

    } catch (error) {
      console.error('Error tracking filter usage:', error);
    }
  }

  // دالة للحصول على إحصائيات الفلتر
  getFilterStatistics(): any {
    try {
      const usage = JSON.parse(localStorage.getItem('filter_usage') || '[]');
      const totalOpened = usage.filter((u: any) => u.action === 'opened').length;
      const totalApplied = usage.filter((u: any) => u.action === 'applied').length;

      return {
        totalOpened,
        totalApplied,
        conversionRate: totalOpened > 0 ? (totalApplied / totalOpened * 100).toFixed(2) : 0,
        lastUsed: localStorage.getItem('filter_last_used')
      };
    } catch (error) {
      console.error('Error getting filter statistics:', error);
      return null;
    }
  }

  // دالة لتحسين الأداء - تنظيف الذاكرة
  private cleanupMemory(): void {
    // تنظيف timeouts
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }

    // تنظيف event listeners إضافية إذا كانت موجودة
    // هذا يتم تلقائياً عبر Angular لكن يمكن إضافة تنظيف يدوي إذا لزم الأمر
  }

  onSiteClick(event: Event): void {
    if (this.filtersOpened) {
      // التأكد من أن النقر ليس على زر الفلتر نفسه
      const target = event.target as HTMLElement;
      const isFilterButton = target.closest('.filter-toggle-btn');

      if (!isFilterButton) {
        this.closeFilters();
      }
    }
  }

  // Filter-related methods
  toggleFilterSection(sectionKey: string): void {
    this.activeFilterSection = this.activeFilterSection === sectionKey ? '' : sectionKey;
  }

  toggleFilter(event: {type: string, value: string}): void {
    const { type, value } = event;
    const filterArray = this.selectedFilters[type as keyof SelectedFilters] as string[];
    
    if (Array.isArray(filterArray)) {
      const index = filterArray.indexOf(value);
      if (index > -1) {
        filterArray.splice(index, 1);
      } else {
        filterArray.push(value);
      }
    }
  }

  clearAllFilters(): void {
    this.selectedFilters = {
      brands: [],
      models: [],
      years: [],
      types: [],
      categories: [],
      condition: [],
      priceRange: { min: 0, max: 10000 }
    };
    this.activeFilterSection = '';
  }

  // إعداد بيانات اختبار للأدمن
  private setupAdminTestData(): void {
    // بيانات المستخدم
    localStorage.setItem('auth_token', 'admin_test_token_123');
    localStorage.setItem('user_data', JSON.stringify({
      id: 1,
      name: 'أدمن النظام',
      email: 'admin@carparts.com',
      type: 'admin',
      avatar: '/assets/images/admin-avatar.png',
      permissions: ['all']
    }));

    // إحصائيات الأدمن
    localStorage.setItem('total_users', '250');
    localStorage.setItem('total_merchants', '45');
    localStorage.setItem('total_orders', '1250');
    localStorage.setItem('total_revenue', '450000');
    localStorage.setItem('pending_tickets', '12');
    localStorage.setItem('system_health', 'ممتاز');

    // بيانات إضافية للاختبار
    localStorage.setItem('last_login_time', new Date().toISOString());
    localStorage.setItem('admin_session_id', 'session_' + Date.now());

    console.log('✅ تم إعداد بيانات اختبار الأدمن بنجاح');
  }

  /* 
  🔧 لاختبار أنواع مستخدمين مختلفة، غيّر userData كالتالي:
  
  👑 للأدمن:
  userType: 'admin', isLoggedIn: true, userName: 'أدمن النظام'
  
  🏪 للتاجر:
  userType: 'merchant', isMerchant: true, isLoggedIn: true, userName: 'تاجر قطع الغيار', pendingOrdersCount: 8
  
  🚚 للسائق:
  userType: 'driver', isDriver: true, isLoggedIn: true, userName: 'سائق التوصيل', deliveryOrdersCount: 5
  
  👤 للعميل:
  userType: 'customer', isLoggedIn: false
  */
}

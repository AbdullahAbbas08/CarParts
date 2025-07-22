

import { Component, OnInit, OnDestroy, HostListener, Renderer2, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterService } from './Shared/Services/filter.service';

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

  userData: UserData = {
    isLoggedIn: false,
    isMerchant: false,
    isDriver: false,
    userName: '',
    userAvatar: '',
    userType: 'customer',
    pendingOrdersCount: 0,
    deliveryOrdersCount: 0
  };

  constructor(
    private filterService: FilterService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.checkDeviceType();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.setupOrdersUpdateInterval();
    this.initializePageSetup();
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
    if (this.filtersOpened) {
      this.closeFilters();
    } else {
      this.openFilters();
    }
  }

  private openFilters(): void {
    this.filtersOpened = true;

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

    // إظهار رسالة التعطيل (اختياري)
    // this.showDisabledMessage = true;

    // تأثير تأخير لسلاسة الانميشن
    this.animationTimeout = setTimeout(() => {
      this.renderer.addClass(document.body, 'filter-animation-complete');
    }, 100);

    // إحصائيات الاستخدام
    this.trackFilterUsage('opened');
  }

  closeFilters(): void {
    this.filtersOpened = false;
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
    try {
      const authToken = localStorage.getItem('auth_token');
      const userDataStr = localStorage.getItem('user_data');

      if (authToken && userDataStr) {
        const user = JSON.parse(userDataStr);
        this.userData = {
          ...this.userData,
          isLoggedIn: true,
          userName: user.name || 'المستخدم',
          userAvatar: user.avatar || '',
          userType: user.type || 'customer',
          isMerchant: user.type === 'merchant',
          isDriver: user.type === 'driver'
        };

        this.updateOrdersCounts();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.resetUserData();
    }
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


}

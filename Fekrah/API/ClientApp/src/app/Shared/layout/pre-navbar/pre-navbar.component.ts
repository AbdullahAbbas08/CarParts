import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-pre-navbar',
  templateUrl: './pre-navbar.component.html',
  styleUrls: ['./pre-navbar-simple.component.scss']
})
export class PreNavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Inputs
  @Input() isMerchant = false;
  @Input() isDriver = false;
  @Input() isAdmin = false;
  @Input() pendingOrdersCount = 0;
  @Input() deliveryOrdersCount = 0;
  @Input() userName = '';

  currentRoute = '';
  isVisible = true;
  
  // Admin UI State
  showNotifications = false;
  showQuickSettings = false;
  showProfileMenu = false;
  isMaintenanceMode = false;
  isLoading = false;

  // Admin Nav - Enhanced
  adminNavItems = [
    { 
      route: '/admin/dashboard', 
      icon: 'fas fa-tachometer-alt', 
      label: 'لوحة التحكم',
      hasNotifications: false,
      notificationCount: 0
    },
    { 
      route: '/admin/manage-merchants', 
      icon: 'fas fa-store', 
      label: 'إدارة التجار',
      hasNotifications: true,
      notificationCount: 3
    },
    { 
      route: '/admin/users', 
      icon: 'fas fa-users', 
      label: 'إدارة المستخدمين',
      hasNotifications: false,
      notificationCount: 0
    },
    { 
      route: '/admin/orders', 
      icon: 'fas fa-shopping-cart', 
      label: 'إدارة الطلبات',
      hasNotifications: true,
      notificationCount: 7
    },
    { 
      route: '/admin/reports', 
      icon: 'fas fa-chart-line', 
      label: 'التقارير والإحصائيات',
      hasNotifications: false,
      notificationCount: 0
    },
    { 
      route: '/admin/settings', 
      icon: 'fas fa-cog', 
      label: 'إعدادات النظام',
      hasNotifications: false,
      notificationCount: 0
    }
  ];

  // Merchant Nav - Simplified
  merchantNavItems = [
    { route: '/dashboard/overview', icon: 'fas fa-th-large', label: 'نظرة شاملة', isOverview: true },
    { route: '/dashboard/super', icon: 'fas fa-tachometer-alt', label: 'لوحة التحكم' },
    { route: '/order-mgr/merchant-orders', icon: 'fas fa-clipboard-list', label: 'الطلبات', hasBadge: true, badgeCount: () => this.pendingOrdersCount },
    { route: '/dashboard/merchant', icon: 'fas fa-box', label: 'المنتجات' }
  ];

  // Driver Nav - Simplified
  driverNavItems = [
    { route: '/dashboard/overview', icon: 'fas fa-th-large', label: 'نظرة شاملة', isOverview: true },
    { route: '/driver/dashboard', icon: 'fas fa-tachometer-alt', label: 'لوحة التحكم' },
    { route: '/driver/deliveries', icon: 'fas fa-truck', label: 'طلبات التوصيل', hasBadge: true, badgeCount: () => this.deliveryOrdersCount },
    { route: '/driver/earnings', icon: 'fas fa-dollar-sign', label: 'الأرباح' }
  ];

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.updateVisibility();
    this.updateCurrentRoute();
    this.initializeNavInteractivity();

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentRoute();
        this.updateVisibility();
        this.updateActiveNavLinks();
      }
    });

    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isMerchant || this.isDriver || this.isAdmin) {
        this.loadQuickStats();
      }
    });

    this.loadQuickStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeNavInteractivity(): void {
    setTimeout(() => {
      this.setupNavLinkListeners();
      this.setupCustomerModeButton();
    }, 100);
  }

  setupNavLinkListeners(): void {
    const navLinks = this.elementRef.nativeElement.querySelectorAll('.nav-link');
    navLinks.forEach((link: HTMLElement) => {
      this.renderer.listen(link, 'click', (event) => {
        event.preventDefault();
        navLinks.forEach((l: HTMLElement) => this.renderer.removeClass(l, 'active'));
        this.renderer.addClass(link, 'active');
        const route = link.getAttribute('data-route');
        if (route) this.navigateToRoute(route);
      });

      this.renderer.listen(link, 'mouseenter', () => {
        if (!link.classList.contains('active')) this.renderer.addClass(link, 'hover');
      });

      this.renderer.listen(link, 'mouseleave', () => {
        this.renderer.removeClass(link, 'hover');
      });
    });
  }

  setupCustomerModeButton(): void {
    const customerBtn = this.elementRef.nativeElement.querySelector('.customer-mode-btn');
    if (customerBtn && !this.isAdmin) {
      this.renderer.listen(customerBtn, 'click', () => this.switchToCustomerMode());
    }
  }

  updateActiveNavLinks(): void {
    setTimeout(() => {
      const navLinks = this.elementRef.nativeElement.querySelectorAll('.nav-link');
      navLinks.forEach((link: HTMLElement) => {
        const route = link.getAttribute('data-route');
        if (route && this.isActiveRoute(route)) {
          this.renderer.addClass(link, 'active');
        } else {
          this.renderer.removeClass(link, 'active');
        }
      });
    }, 50);
  }

  updateCurrentRoute(): void {
    this.currentRoute = this.router.url;
  }

  updateVisibility(): void {
    this.isVisible = this.isMerchant || this.isDriver || this.isAdmin;
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  getCurrentNavItems() {
    if (this.isMerchant) {
      return this.merchantNavItems.map((item: any) => ({
        ...item,
        hasNotifications: item.hasBadge || false,
        notificationCount: item.badgeCount ? (typeof item.badgeCount === 'function' ? item.badgeCount() : item.badgeCount) : 0
      }));
    }
    if (this.isDriver) {
      return this.driverNavItems.map((item: any) => ({
        ...item,
        hasNotifications: item.hasBadge || false,
        notificationCount: item.badgeCount ? (typeof item.badgeCount === 'function' ? item.badgeCount() : item.badgeCount) : 0
      }));
    }
    if (this.isAdmin) return this.adminNavItems;
    return [];
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = this.renderer.createElement('div');
    this.renderer.addClass(notification, 'custom-notification');
    this.renderer.addClass(notification, `notification-${type}`);
    this.renderer.setProperty(notification, 'innerHTML', `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `);
    this.renderer.appendChild(document.body, notification);
    setTimeout(() => this.renderer.addClass(notification, 'show'), 100);
    setTimeout(() => {
      this.renderer.removeClass(notification, 'show');
      setTimeout(() => this.renderer.removeChild(document.body, notification), 300);
    }, 3000);
  }

  loadQuickStats(): void {
    try {
      if (this.isMerchant) this.updateMerchantStats(this.getMerchantStats());
      else if (this.isDriver) this.updateDriverStats(this.getDriverStats());
      else if (this.isAdmin) this.updateAdminStats(this.getAdminStats());
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  }

  getMerchantStats() {
    return {
      totalProducts: parseInt(localStorage.getItem('total_products') || '25'),
      monthlyRevenue: parseFloat(localStorage.getItem('monthly_revenue') || '15420'),
      activeOrders: parseInt(localStorage.getItem('active_orders') || '8'),
      completedOrders: parseInt(localStorage.getItem('completed_orders') || '142')
    };
  }

  getDriverStats() {
    return {
      completedToday: parseInt(localStorage.getItem('completed_today') || '5'),
      todayEarnings: parseFloat(localStorage.getItem('today_earnings') || '185.50'),
      monthlyDeliveries: parseInt(localStorage.getItem('monthly_deliveries') || '89'),
      rating: parseFloat(localStorage.getItem('driver_rating') || '4.8')
    };
  }

  getAdminStats() {
    return {
      totalUsers: parseInt(localStorage.getItem('total_users') || '350'),
      systemHealth: 'جيد',
      pendingTickets: parseInt(localStorage.getItem('pending_tickets') || '12')
    };
  }

  updateMerchantStats(stats: any): void {
    console.log('Merchant stats updated:', stats);
  }

  updateDriverStats(stats: any): void {
    console.log('Driver stats updated:', stats);
  }

  updateAdminStats(stats: any): void {
    console.log('Admin stats updated:', stats);
  }

  navigateWithFeedback(route: string): void {
    const activeLink = this.elementRef.nativeElement.querySelector('.nav-link.active');
    if (activeLink) this.renderer.addClass(activeLink, 'loading');
    this.router.navigate([route]).then(() => {
      if (activeLink) this.renderer.removeClass(activeLink, 'loading');
    });
  }

  getDisplayName(): string {
    if (this.isMerchant) return `مرحباً ${this.userName} - لوحة التاجر`;
    if (this.isDriver) return `مرحباً ${this.userName} - لوحة المراسل`;
    if (this.isAdmin) return `مرحباً ${this.userName} - لوحة النظام`;
    return '';
  }

  getBrandIcon(): string {
    if (this.isMerchant) return 'fas fa-store';
    if (this.isDriver) return 'fas fa-truck';
    if (this.isAdmin) return 'fas fa-user-shield';
    return '';
  }

  getBrandText(): string {
    if (this.isMerchant) return 'لوحة التاجر';
    if (this.isDriver) return 'لوحة المراسل';
    if (this.isAdmin) return 'لوحة النظام';
    return '';
  }

  getTotalNotifications(): number {
    if (this.isMerchant) return this.pendingOrdersCount;
    if (this.isDriver) return this.deliveryOrdersCount;
    if (this.isAdmin) return parseInt(localStorage.getItem('pending_tickets') || '0');
    return 0;
  }

  getUserRoleClass(): string {
    if (this.isMerchant) return 'merchant-mode';
    if (this.isDriver) return 'driver-mode';
    if (this.isAdmin) return 'admin-mode';
    return '';
  }

  // ==================== طرق الأدمن الجديدة ====================

  // Navigation helpers
  getAdminNavItems() {
    return this.adminNavItems;
  }

  trackByRoute(index: number, item: any): any {
    return item.route;
  }

  // Statistics methods
  getTotalMerchants(): number {
    return parseInt(localStorage.getItem('total_merchants') || '245');
  }

  getTotalOrders(): number {
    return parseInt(localStorage.getItem('total_orders') || '1,847');
  }

  getRevenue(): string {
    return localStorage.getItem('total_revenue') || '125,400';
  }

  // Notifications methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showQuickSettings = false;
    this.showProfileMenu = false;
  }

  getRecentNotifications() {
    return [
      {
        type: 'merchant',
        icon: 'fas fa-store',
        title: 'تاجر جديد في انتظار الموافقة',
        timeAgo: 'منذ 5 دقائق'
      },
      {
        type: 'order',
        icon: 'fas fa-shopping-cart',
        title: 'طلب جديد يحتاج مراجعة',
        timeAgo: 'منذ 15 دقيقة'
      },
      {
        type: 'system',
        icon: 'fas fa-exclamation-triangle',
        title: 'تحديث النظام متاح',
        timeAgo: 'منذ ساعة'
      }
    ];
  }

  viewAllNotifications(): void {
    this.showNotifications = false;
    this.navigateToRoute('/admin/notifications');
  }

  // Quick Settings methods
  toggleQuickSettings(): void {
    this.showQuickSettings = !this.showQuickSettings;
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  toggleMaintenanceMode(): void {
    this.isMaintenanceMode = !this.isMaintenanceMode;
    console.log('وضع الصيانة:', this.isMaintenanceMode ? 'مفعل' : 'معطل');
    // هنا يمكن إضافة API call لتفعيل/إلغاء وضع الصيانة
  }

  viewSystemHealth(): void {
    this.showQuickSettings = false;
    this.navigateToRoute('/admin/system-health');
  }

  // Platform switching
  switchToCustomerMode(): void {
    console.log('التبديل للمنصة الرئيسية');
    this.navigateToRoute('/');
  }

  // Profile methods
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
    this.showQuickSettings = false;
  }

  getAdminAvatar(): string {
    return localStorage.getItem('admin_avatar') || '/assets/images/admin-avatar.png';
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/default-admin.png';
    }
  }

  getLastLoginTime(): string {
    const lastLogin = localStorage.getItem('last_login_time');
    if (lastLogin) {
      const date = new Date(lastLogin);
      return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return 'اليوم';
  }

  viewProfile(): void {
    this.showProfileMenu = false;
    this.navigateToRoute('/admin/profile');
  }

  viewSettings(): void {
    this.showProfileMenu = false;
    this.navigateToRoute('/admin/settings');
  }

  viewActivityLog(): void {
    this.showProfileMenu = false;
    this.navigateToRoute('/admin/activity-log');
  }

  logout(): void {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      // Clear session data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      
      // Navigate to login
      this.navigateToRoute('/auth/login');
      
      // Show logout message
      console.log('تم تسجيل الخروج بنجاح');
    }
  }

  shouldShowBadge(item: any): boolean {
    return item.hasBadge && item.badgeCount && item.badgeCount() > 0;
  }

  getBadgeCount(item: any): number {
    return item.badgeCount ? item.badgeCount() : 0;
  }

  onNavItemClick(item: any, event: Event): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    this.renderer.addClass(target, 'clicked');
    setTimeout(() => {
      this.renderer.removeClass(target, 'clicked');
      this.navigateWithFeedback(item.route);
    }, 150);
  }

  getQuickStatsText(): string {
    if (this.isMerchant) {
      return `${this.pendingOrdersCount} طلب جديد`;
    } else if (this.isDriver) {
      return `${this.deliveryOrdersCount} طلب توصيل`;
    } else if (this.isAdmin) {
      const pending = parseInt(localStorage.getItem('pending_tickets') || '0');
      return `${pending} تذكرة معلّقة`;
    }
    return '';
  }

  getQuickStatsIcon(): string {
    if (this.isMerchant) return 'fas fa-shopping-bag';
    if (this.isDriver) return 'fas fa-truck';
    if (this.isAdmin) return 'fas fa-exclamation-triangle';
    return '';
  }

  navigateToRoute(route: string): void {
  this.router.navigate([route]);
}


}

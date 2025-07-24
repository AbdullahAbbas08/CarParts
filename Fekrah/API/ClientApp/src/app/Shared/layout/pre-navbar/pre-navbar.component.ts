import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-pre-navbar',
  templateUrl: './pre-navbar.component.html',
  styleUrls: ['./pre-navbar.component.scss']
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

  // Admin Nav
  adminNavItems = [
    { route: '/admin/dashboard', icon: 'fas fa-user-shield', label: 'لوحة التحكم' },
    { route: '/admin/users', icon: 'fas fa-users-cog', label: 'إدارة المستخدمين' },
    { route: '/admin/logs', icon: 'fas fa-file-alt', label: 'سجلات النظام' },
    { route: '/admin/settings', icon: 'fas fa-cogs', label: 'الإعدادات' }
  ];

  // Merchant Nav
  merchantNavItems = [
    { route: '/dashboard/overview', icon: 'fas fa-th-large', label: 'نظرة شاملة', isOverview: true },
    { route: '/dashboard/super', icon: 'fas fa-tachometer-alt', label: 'لوحة التحكم' },
    { route: '/order-mgr/merchant-orders', icon: 'fas fa-clipboard-list', label: 'الطلبات', hasBadge: true, badgeCount: () => this.pendingOrdersCount },
    { route: '/dashboard/merchant', icon: 'fas fa-box', label: 'المنتجات' },
    { route: '/merchant/analytics', icon: 'fas fa-chart-bar', label: 'التقارير' }
  ];

  // Driver Nav
  driverNavItems = [
    { route: '/dashboard/overview', icon: 'fas fa-th-large', label: 'نظرة شاملة', isOverview: true },
    { route: '/driver/dashboard', icon: 'fas fa-tachometer-alt', label: 'لوحة التحكم' },
    { route: '/driver/deliveries', icon: 'fas fa-truck', label: 'طلبات التوصيل', hasBadge: true, badgeCount: () => this.deliveryOrdersCount },
    { route: '/driver/schedule', icon: 'fas fa-calendar-alt', label: 'الجدولة' },
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
    if (this.isMerchant) return this.merchantNavItems;
    if (this.isDriver) return this.driverNavItems;
    if (this.isAdmin) return this.adminNavItems;
    return [];
  }

  switchToCustomerMode(): void {
    if (!this.isAdmin && (this.isMerchant || this.isDriver)) {
      const btn = this.elementRef.nativeElement.querySelector('.customer-mode-btn');
      if (btn) {
        this.renderer.addClass(btn, 'loading');
        setTimeout(() => {
          this.renderer.removeClass(btn, 'loading');
          this.isVisible = false;
          this.router.navigate(['/']);
          this.showNotification('تم التبديل لوضع العميل بنجاح', 'success');
        }, 1000);
      }
    }
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

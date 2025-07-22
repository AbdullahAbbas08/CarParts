import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-pre-navbar',
  templateUrl: './pre-navbar.component.html',
  styleUrls: ['./pre-navbar.component.scss']
})
export class PreNavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Input properties from parent component
  @Input() isMerchant = false;
  @Input() isDriver = false;
  @Input() pendingOrdersCount = 0;
  @Input() deliveryOrdersCount = 0;
  @Input() userName = '';

  // Component state
  currentRoute = '';
  isVisible = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // this.updateVisibility();
    // this.updateCurrentRoute();
    // // Listen to route changes
    // this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     this.updateCurrentRoute();
    //     this.updateVisibility();
    //   }
    // });
    // // Update stats periodically
    // interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
    //   if (this.isMerchant || this.isDriver) {
    //     this.loadQuickStats();
    //   }
    // });

    // this.loadQuickStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Update current route
  updateCurrentRoute(): void {
    this.currentRoute = this.router.url;
  }

  // Update component visibility
  updateVisibility(): void {
    this.isVisible = this.isMerchant || this.isDriver;
  }

  // Check if current route is active
  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  // Switch to customer mode
  switchToCustomerMode(): void {
    if (this.isMerchant || this.isDriver) {
      // في التطبيق الحقيقي، استخدم Service
      // localStorage.setItem('view_mode', 'customer');

      // إخفاء Pre-navbar مؤقتاً
      this.isVisible = false;

      this.router.navigate(['/']);
      console.log('تم التبديل لوضع العميل');
    }
  }

  // Load quick statistics
  loadQuickStats(): void {
    try {
      if (this.isMerchant) {
        // Load merchant stats (in real app, this would be an API call)
        const stats = this.getMerchantStats();
        this.updateMerchantStats(stats);
      } else if (this.isDriver) {
        // Load driver stats
        const stats = this.getDriverStats();
        this.updateDriverStats(stats);
      }
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  }

  // Get merchant statistics
  getMerchantStats() {
    return {
      totalProducts: parseInt(localStorage.getItem('total_products') || '25'),
      monthlyRevenue: parseFloat(localStorage.getItem('monthly_revenue') || '15420'),
      activeOrders: parseInt(localStorage.getItem('active_orders') || '8'),
      completedOrders: parseInt(localStorage.getItem('completed_orders') || '142')
    };
  }

  // Get driver statistics
  getDriverStats() {
    return {
      completedToday: parseInt(localStorage.getItem('completed_today') || '5'),
      todayEarnings: parseFloat(localStorage.getItem('today_earnings') || '185.50'),
      monthlyDeliveries: parseInt(localStorage.getItem('monthly_deliveries') || '89'),
      rating: parseFloat(localStorage.getItem('driver_rating') || '4.8')
    };
  }

  // Update merchant stats
  updateMerchantStats(stats: any): void {
    // Update local properties or emit to parent
    // In real app, you might use a service to share this data
  }

  // Update driver stats
  updateDriverStats(stats: any): void {
    // Update local properties or emit to parent
    // In real app, you might use a service to share this data
  }

  // Navigation helpers
  navigateToMerchantDashboard(): void {
    this.router.navigate(['/merchant/dashboard']);
  }

  navigateToMerchantOrders(): void {
    this.router.navigate(['/merchant/orders']);
  }

  navigateToMerchantProducts(): void {
    this.router.navigate(['/merchant/products']);
  }

  navigateToMerchantAnalytics(): void {
    this.router.navigate(['/merchant/statistics']);
  }

  navigateToDriverDashboard(): void {
    this.router.navigate(['/driver/dashboard']);
  }

  navigateToDriverDeliveries(): void {
    this.router.navigate(['/driver/deliveries']);
  }

  navigateToDriverSchedule(): void {
    this.router.navigate(['/driver/schedule']);
  }

  navigateToDriverEarnings(): void {
    this.router.navigate(['/driver/earnings']);
  }

  // Get display name based on user type
  getDisplayName(): string {
    if (this.isMerchant) {
      return `مرحباً ${this.userName} - لوحة التاجر`;
    } else if (this.isDriver) {
      return `مرحباً ${this.userName} - لوحة المراسل`;
    }
    return '';
  }

  // Get brand icon
  getBrandIcon(): string {
    return this.isMerchant ? 'fas fa-store' : 'fas fa-truck';
  }

  // Get brand text
  getBrandText(): string {
    return this.isMerchant ? 'لوحة التاجر' : 'لوحة المراسل';
  }

  // Get total notifications count
  getTotalNotifications(): number {
    return this.isMerchant ? this.pendingOrdersCount : this.deliveryOrdersCount;
  }
}

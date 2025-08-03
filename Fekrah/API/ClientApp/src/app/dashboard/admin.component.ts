import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserManagementService } from './manage-users/user-management.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Statistics
  totalUsers = 1247;
  totalMerchants = 89;
  totalOrders = 3421;
  monthlyGrowth = 12.5;

  constructor(
    private router: Router,
    private userService: UserManagementService
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
    // Load user statistics
    this.userService.getUserStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.totalUsers = stats.totalUsers;
        },
        error: (error) => {
          console.error('Error loading user statistics:', error);
        }
      });
  }

  // Navigation Methods
  navigateToUsers(): void {
    console.log('🏃‍♂️ Navigating to user management...');
    this.router.navigate(['/admin/users']);
  }

  navigateToOrders(): void {
    console.log('📦 Navigating to order management...');
    // TODO: Implement order management navigation
    // this.router.navigate(['/admin/orders']);
    this.showComingSoon('إدارة الطلبات');
  }

  navigateToReports(): void {
    console.log('📊 Navigating to reports...');
    // TODO: Implement reports navigation
    // this.router.navigate(['/admin/reports']);
    this.showComingSoon('التقارير والإحصائيات');
  }

  // Statistics Methods
  getTotalUsers(): number {
    return this.totalUsers;
  }

  getMerchantsCount(): number {
    return this.totalMerchants;
  }

  getTotalOrders(): number {
    return this.totalOrders;
  }

  getMonthlyGrowth(): number {
    return this.monthlyGrowth;
  }

  // Helper Methods
  private showComingSoon(feature: string): void {
    const toast = document.createElement('div');
    toast.textContent = `${feature} - قريباً`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 15px 25px;
      border-radius: 15px;
      z-index: 10000;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
}

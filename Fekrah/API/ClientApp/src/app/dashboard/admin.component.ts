import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  // Navigation Methods
  navigateToUsers(): void {
    console.log('🏃‍♂️ Navigating to user management...');
    // TODO: Implement user management navigation
    // this.router.navigate(['/admin/users']);
    this.showComingSoon('إدارة المستخدمين');
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
    // TODO: Implement actual user count from API
    return 1247;
  }

  getMerchantsCount(): number {
    // TODO: Implement actual merchant count from API
    return 89;
  }

  getTotalOrders(): number {
    // TODO: Implement actual order count from API
    return 3421;
  }

  getMonthlyGrowth(): number {
    // TODO: Implement actual growth calculation from API
    return 12.5;
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

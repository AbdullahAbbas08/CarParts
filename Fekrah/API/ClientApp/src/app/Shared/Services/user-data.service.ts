import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  isLoggedIn: boolean;
  isMerchant: boolean;
  isDriver: boolean;
  userName: string;
  userAvatar: string;
  userType: 'customer' | 'merchant' | 'driver' | 'admin';
  pendingOrdersCount: number;
  deliveryOrdersCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDataSubject = new BehaviorSubject<UserData>({
    isLoggedIn: false,
    isMerchant: false,
    isDriver: false,
    userName: '',
    userAvatar: '',
    userType: 'customer',
    pendingOrdersCount: 0,
    deliveryOrdersCount: 0
  });

  public userData$ = this.userDataSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // تحديث بيانات المستخدم
  updateUserData(userData: Partial<UserData>): void {
    const currentData = this.userDataSubject.value;
    const newData = { ...currentData, ...userData };
    this.userDataSubject.next(newData);
  }

  // الحصول على البيانات الحالية
  getCurrentUserData(): UserData {
    return this.userDataSubject.value;
  }

  // تحميل البيانات من localStorage
  private loadUserFromStorage(): void {
    try {
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (authToken && userData) {
        const user = JSON.parse(userData);
        this.updateUserData({
          isLoggedIn: true,
          userName: user.name || 'المستخدم',
          userAvatar: user.avatar || '',
          userType: user.type || 'customer',
          isMerchant: user.type === 'merchant',
          isDriver: user.type === 'driver'
        });

        this.loadOrdersCounts();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // تحميل عدد الطلبات
  private loadOrdersCounts(): void {
    const currentData = this.getCurrentUserData();

    if (currentData.isMerchant) {
      const pendingOrders = localStorage.getItem('pending_orders_count');
      this.updateUserData({
        pendingOrdersCount: pendingOrders ? parseInt(pendingOrders) : 0
      });
    }

    if (currentData.isDriver) {
      const deliveryOrders = localStorage.getItem('delivery_orders_count');
      this.updateUserData({
        deliveryOrdersCount: deliveryOrders ? parseInt(deliveryOrders) : 0
      });
    }
  }

  // محاكاة تسجيل الدخول
  simulateLogin(userType: 'customer' | 'merchant' | 'driver'): void {
    const mockUser = {
      id: '1',
      name: userType === 'merchant' ? 'محمد التاجر' :
            userType === 'driver' ? 'أحمد المراسل' : 'سارة العميل',
      email: `${userType}@example.com`,
      type: userType,
      avatar: ''
    };

    localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    localStorage.setItem('user_data', JSON.stringify(mockUser));

    if (userType === 'merchant') {
      localStorage.setItem('pending_orders_count', '5');
    } else if (userType === 'driver') {
      localStorage.setItem('delivery_orders_count', '3');
    }

    this.loadUserFromStorage();
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('pending_orders_count');
    localStorage.removeItem('delivery_orders_count');

    this.updateUserData({
      isLoggedIn: false,
      isMerchant: false,
      isDriver: false,
      userName: '',
      userAvatar: '',
      userType: 'customer',
      pendingOrdersCount: 0,
      deliveryOrdersCount: 0
    });
  }

  // إضافة طلب جديد
  addPendingOrder(): void {
    const currentData = this.getCurrentUserData();
    if (currentData.isMerchant) {
      const newCount = currentData.pendingOrdersCount + 1;
      localStorage.setItem('pending_orders_count', newCount.toString());
      this.updateUserData({ pendingOrdersCount: newCount });
    }
  }

  // إضافة طلب توصيل
  addDeliveryOrder(): void {
    const currentData = this.getCurrentUserData();
    if (currentData.isDriver) {
      const newCount = currentData.deliveryOrdersCount + 1;
      localStorage.setItem('delivery_orders_count', newCount.toString());
      this.updateUserData({ deliveryOrdersCount: newCount });
    }
  }

  // مسح الطلبات
  clearOrders(): void {
    localStorage.setItem('pending_orders_count', '0');
    localStorage.setItem('delivery_orders_count', '0');
    this.updateUserData({
      pendingOrdersCount: 0,
      deliveryOrdersCount: 0
    });
  }
}

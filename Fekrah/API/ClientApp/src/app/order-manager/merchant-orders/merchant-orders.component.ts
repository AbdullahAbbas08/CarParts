import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  category?: string;
  brand?: string;
  model?: string;
  warranty?: string;
  availability?: 'available' | 'limited' | 'out_of_stock';
}

export interface TimelineItem {
  status: string;
  title: string;
  timestamp: Date;
  description?: string;
  date?: Date;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery?: Date;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  deliveryFee: number;
  discount?: number;
  trackingNumber?: string;
  lastUpdated?: Date;
  merchantNotes?: string;
  priority?: 'high' | 'medium' | 'low';
  customerType?: 'new' | 'regular' | 'vip';
  completedDate?: Date;
  cancellationReason?: string;
  timeline?: TimelineItem[];
  specialInstructions?: string;
  deliveryNotes?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAmount?: number;
  remainingAmount?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivering: number;
  delivered: number;
  cancelled: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
}

export interface StatusConfig {
  value: string;
  label: string;
  color: string;
  icon: string;
  nextActions?: string[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'online';
export type CustomerType = 'new' | 'regular' | 'vip';
export type OrderPriority = 'high' | 'medium' | 'low';
export type ProductAvailability = 'available' | 'limited' | 'out_of_stock';

@Component({
  selector: 'app-merchant-orders',
  templateUrl: './merchant-orders.component.html',
  styleUrls: ['./merchant-orders.component.scss']
})

export class MerchantOrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDate: string = '';

  // Pagination properties
  currentPage: number = 1;
  ordersPerPage: number = 5;
  totalPages: number = 1;

  // State properties
  isLoading: boolean = false;
  error: string | null = null;

  // Notification properties
  notificationMessage: string = '';
  notificationType: string = '';

  // Order Details Modal properties
  selectedOrderForDetails: Order | null = null;
  showOrderDetailsModal: boolean = false;

  // FAB Menu properties
  fabMenuOpen: boolean = false;

  // Quick Filter properties
  quickFilter: string = 'all';
  showQuickFilters: boolean = false;

  // Processing properties
  isProcessing: boolean = false;
  processingMessage: string = '';

  // Notification properties
  autoHideNotification: boolean = true;

  // Statistics
  stats: OrderStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0
  };

  // Order statuses configuration
  orderStatuses: StatusConfig[] = [
    { value: 'all', label: 'جميع الطلبات', color: '#6c757d', icon: 'fas fa-list' },
    { value: 'pending', label: 'في الانتظار', color: '#ffc107', icon: 'fas fa-clock' },
    { value: 'confirmed', label: 'مؤكد', color: '#17a2b8', icon: 'fas fa-check' },
    { value: 'preparing', label: 'قيد التحضير', color: '#007bff', icon: 'fas fa-cog' },
    { value: 'ready', label: 'جاهز للتسليم', color: '#28a745', icon: 'fas fa-box' },
    { value: 'delivering', label: 'في الطريق', color: '#fd7e14', icon: 'fas fa-truck' },
    { value: 'delivered', label: 'تم التسليم', color: '#198754', icon: 'fas fa-check-circle' },
    { value: 'cancelled', label: 'ملغي', color: '#dc3545', icon: 'fas fa-times-circle' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Close quick filters when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const quickFiltersContainer = document.querySelector('.quick-filters');
      const toggleButton = document.querySelector('.quick-filters-toggle-btn');

      if (this.showQuickFilters &&
          quickFiltersContainer &&
          !quickFiltersContainer.contains(target) &&
          toggleButton &&
          !toggleButton.contains(target)) {
        this.hideQuickFilters();
      }

      // Existing FAB menu logic
      const fabContainer = document.querySelector('.fab-container');
      if (fabContainer && !fabContainer.contains(target) && this.fabMenuOpen) {
        this.fabMenuOpen = false;
      }
    });

    // Close quick filters with Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.showQuickFilters) {
        this.hideQuickFilters();
      }
    });
  }


    // Quick Filter Methods - ADD THESE NEW METHODS
    toggleQuickFilters(): void {
      this.showQuickFilters = !this.showQuickFilters;

      if (this.showQuickFilters) {
        // Close FAB menu if open
        this.fabMenuOpen = false;
        this.showNotification('تم فتح لوحة التصفية السريعة', 'info');
      } else {
        this.showNotification('تم إغلاق لوحة التصفية السريعة', 'info');
      }
    }

    hideQuickFilters(): void {
      this.showQuickFilters = false;
    }

    showQuickFiltersPanel(): void {
      this.showQuickFilters = true;
      this.showNotification('تم فتح لوحة التصفية السريعة', 'info');
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove event listeners
    document.removeEventListener('click', this.setupEventListeners);

    // Ensure body scroll is re-enabled
    document.body.classList.remove('modal-open');
  }

  // Initialization
  private initializeComponent(): void {
    this.isLoading = true;

    try {
      this.loadOrders();
      this.calculateStats();
      this.applyFilters();
      this.startAutoRefresh();

      // Show welcome message
      setTimeout(() => {
        this.showNotification('مرحباً بك في نظام إدارة الطلبات! 👋', 'info');
      }, 1000);
    } catch (error) {
      this.handleError(error, 'تهيئة النظام');
    } finally {
      this.isLoading = false;
    }
  }

  // Data Loading
  loadOrders(): void {
    this.allOrders = this.generateMockOrders();
    this.filteredOrders = [...this.allOrders];
  }

  private generateMockOrders(): Order[] {
    return [
      {
        id: 'ORD-2025-001',
        orderNumber: 'ORD-2025-001',
        customerName: 'أحمد محمد علي',
        customerPhone: '01012345678',
        customerEmail: 'ahmed@example.com',
        customerAddress: 'شارع الثورة، مصر الجديدة، القاهرة',
        orderDate: new Date('2025-06-22T10:30:00'),
        estimatedDelivery: new Date('2025-06-23T14:00:00'),
        status: 'pending',
        paymentMethod: 'cash',
        deliveryFee: 50,
        discount: 0,
        priority: 'medium',
        customerType: 'regular',
        trackingNumber: 'TRK-456789',
        notes: 'في الطريق - سيصل خلال ساعتين',
        merchantNotes: 'تم إرسال السائق',
        items: [
          {
            id: 'item-06',
            productName: 'فرامل أمامية تويوتا',
            quantity: 1,
            price: 320,
            image: 'https://via.placeholder.com/50x50/fd7e14/ffffff?text=فرامل',
            category: 'فرامل',
            brand: 'تويوتا',
            model: 'أصلي',
            warranty: '18 شهر',
            availability: 'available'
          }
        ],
        totalAmount: 370,
        lastUpdated: new Date(),
        specialInstructions: 'يرجى التعامل بحذر مع القطع',
        deliveryNotes: 'التوصيل للطابق الثاني',
        paymentStatus: 'pending',
        paidAmount: 0,
        remainingAmount: 370,
        timeline: [
          {
            status: 'pending',
            title: 'طلب جديد',
            timestamp: new Date('2025-06-22T10:30:00'),
            date: new Date('2025-06-22T10:30:00'),
            description: 'تم استلام الطلب',
            note: 'العميل طلب التأكيد قبل التحضير'
          }
        ]
      },
      {
        id: 'ORD-2025-005',
        orderNumber: 'ORD-2025-005',
        customerName: 'خالد يوسف',
        customerPhone: '01777888999',
        customerEmail: 'khaled@example.com',
        customerAddress: 'الإسكندرية',
        orderDate: new Date('2025-06-21T18:20:00'),
        estimatedDelivery: new Date('2025-06-21T20:00:00'),
        status: 'delivered',
        paymentMethod: 'online',
        deliveryFee: 70,
        discount: 0,
        priority: 'low',
        customerType: 'new',
        trackingNumber: 'TRK-345678',
        notes: 'تم التسليم بنجاح',
        merchantNotes: 'راضي عن الخدمة',
        items: [
          {
            id: 'item-07',
            productName: 'كشافات ضباب LED',
            quantity: 2,
            price: 180,
            image: 'https://via.placeholder.com/50x50/198754/ffffff?text=كشاف',
            category: 'إضاءة',
            brand: 'Osram',
            model: 'LEDriving',
            warranty: '24 شهر',
            availability: 'available'
          }
        ],
        totalAmount: 430,
        lastUpdated: new Date(),
        completedDate: new Date('2025-06-21T20:00:00'),
        paymentStatus: 'paid',
        paidAmount: 430,
        remainingAmount: 0,
        timeline: [
          {
            status: 'pending',
            title: 'طلب جديد',
            timestamp: new Date('2025-06-21T18:20:00'),
            date: new Date('2025-06-21T18:20:00'),
            description: 'تم استلام الطلب',
            note: 'طلب سريع'
          },
          {
            status: 'delivered',
            title: 'تم التسليم',
            timestamp: new Date('2025-06-21T20:00:00'),
            date: new Date('2025-06-21T20:00:00'),
            description: 'تم تسليم الطلب بنجاح',
            note: 'العميل راضي عن الخدمة'
          }
        ]
      }
    ];
  }

  // Statistics Calculation
  calculateStats(): void {
    this.stats.total = this.allOrders.length;
    this.stats.pending = this.allOrders.filter(o => o.status === 'pending').length;
    this.stats.confirmed = this.allOrders.filter(o => o.status === 'confirmed').length;
    this.stats.preparing = this.allOrders.filter(o => o.status === 'preparing').length;
    this.stats.ready = this.allOrders.filter(o => o.status === 'ready').length;
    this.stats.delivering = this.allOrders.filter(o => o.status === 'delivering').length;
    this.stats.delivered = this.allOrders.filter(o => o.status === 'delivered').length;
    this.stats.cancelled = this.allOrders.filter(o => o.status === 'cancelled').length;

    // Calculate revenue
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deliveredOrders = this.allOrders.filter(o => o.status === 'delivered');

    this.stats.todayRevenue = deliveredOrders
      .filter(o => o.orderDate >= todayStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    this.stats.weekRevenue = deliveredOrders
      .filter(o => o.orderDate >= weekAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    this.stats.monthRevenue = deliveredOrders
      .filter(o => o.orderDate >= monthAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    this.stats.averageOrderValue = this.allOrders.length > 0
      ? this.allOrders.reduce((sum, o) => sum + o.totalAmount, 0) / this.allOrders.length
      : 0;
  }

  // Filtering and Search
  applyFilters(): void {
    let filtered = [...this.allOrders];

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(this.searchTerm) ||
        order.trackingNumber?.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchLower))
      );
    }

    // Date filter
    if (this.selectedDate) {
      const selectedDate = new Date(this.selectedDate);
      filtered = filtered.filter(order =>
        this.isSameDay(order.orderDate, selectedDate)
      );
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedDate = '';
    this.applyFilters();
    this.showNotification('تم إعادة تعيين جميع الفلاتر', 'info');
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    this.updatePaginatedOrders();
  }

  private updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.ordersPerPage;
    const endIndex = startIndex + this.ordersPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedOrders();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.ordersPerPage;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.ordersPerPage, this.filteredOrders.length);
  }

  // Order Management
  updateOrderStatus(orderId: string, newStatus: string): void {
    const order = this.allOrders.find(o => o.id === orderId);
    if (!order) {
      this.showNotification('الطلب غير موجود', 'error');
      return;
    }

    if (!this.isValidStatusTransition(order.status, newStatus)) {
      this.showNotification('لا يمكن تحديث الحالة من ' + this.getStatusLabel(order.status) + ' إلى ' + this.getStatusLabel(newStatus), 'error');
      return;
    }

    const oldStatus = order.status;
    order.status = newStatus as Order['status'];
    order.lastUpdated = new Date();

    // Update estimated delivery
    this.updateEstimatedDelivery(order, newStatus);

    // Save changes
    this.saveOrdersToStorage();

    // Recalculate and update
    this.calculateStats();
    this.applyFilters();

    this.showNotification(`تم تحديث حالة الطلب ${order.orderNumber} من ${this.getStatusLabel(oldStatus)} إلى ${this.getStatusLabel(newStatus)}`, 'success');
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivering'],
      'delivering': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private updateEstimatedDelivery(order: Order, status: string): void {
    const now = new Date();

    switch (status) {
      case 'confirmed':
        order.estimatedDelivery = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'preparing':
        order.estimatedDelivery = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        break;
      case 'ready':
        order.estimatedDelivery = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        break;
      case 'delivering':
        order.estimatedDelivery = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        break;
      case 'delivered':
        order.estimatedDelivery = now;
        break;
    }
  }

  cancelOrder(order: Order): void {
    const confirmMessage = `هل أنت متأكد من إلغاء الطلب ${order.orderNumber}؟`;

    if (confirm(confirmMessage)) {
      this.updateOrderStatus(order.id, 'cancelled');
    }
  }

  canCancelOrder(order: Order): boolean {
    return !['delivered', 'cancelled'].includes(order.status);
  }

  // Helper Methods
  getStatusColor(status: string): string {
    const statusConfig = this.orderStatuses.find(s => s.value === status);
    return statusConfig?.color || '#6c757d';
  }

  getStatusIcon(status: string): string {
    const statusConfig = this.orderStatuses.find(s => s.value === status);
    return statusConfig?.icon || 'fas fa-question';
  }

  getStatusLabel(status: string): string {
    const statusConfig = this.orderStatuses.find(s => s.value === status);
    return statusConfig?.label || status;
  }

  calculateOrderTotal(order: Order): number {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal + order.deliveryFee - (order.discount || 0);
  }

  // Order Details Modal Methods
  viewOrderDetails(order: Order): void {
    this.selectedOrderForDetails = order;
    this.showOrderDetailsModal = true;

    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');

    // Track order view for analytics
    console.log('Opening order details for:', order.id);
    this.showNotification(`عرض تفاصيل الطلب ${order.orderNumber}`, 'info');
  }

  closeOrderDetails(): void {
    this.showOrderDetailsModal = false;
    this.selectedOrderForDetails = null;

    // Re-enable body scroll
    document.body.classList.remove('modal-open');
  }

  onStatusUpdate(event: { orderId: string, newStatus: string }): void {
    this.updateOrderStatus(event.orderId, event.newStatus);

    // Update the selected order if it's the same one
    if (this.selectedOrderForDetails?.id === event.orderId) {
      const updatedOrder = this.allOrders.find(o => o.id === event.orderId);
      if (updatedOrder) {
        this.selectedOrderForDetails = { ...updatedOrder };
      }
    }
  }

  // Actions
  printOrder(order: Order): void {
    this.showNotification(`جاري تحضير طلب ${order.orderNumber} للطباعة...`, 'info');

    setTimeout(() => {
      const printContent = this.generatePrintContent(order);
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        this.showNotification('تم إعداد الطلب للطباعة بنجاح!', 'success');
      } else {
        this.showNotification('تعذر فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح.', 'error');
      }
    }, 1000);
  }

  private generatePrintContent(order: Order): string {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + order.deliveryFee - (order.discount || 0);

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طلب رقم ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-section { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          .items-table th { background-color: #007bff; color: white; }
          .total-section { margin-top: 30px; text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9rem; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>فاتورة طلب قطع الغيار</h1>
          <h2>${order.orderNumber}</h2>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <div class="order-info">
          <div class="info-section">
            <h3>بيانات العميل</h3>
            <p><strong>الاسم:</strong> ${order.customerName}</p>
            <p><strong>التليفون:</strong> ${order.customerPhone}</p>
            <p><strong>العنوان:</strong> ${order.customerAddress}</p>
          </div>

          <div class="info-section">
            <h3>بيانات الطلب</h3>
            <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
            <p><strong>تاريخ الطلب:</strong> ${order.orderDate.toLocaleDateString('ar-EG')}</p>
            <p><strong>الحالة:</strong> ${this.getStatusLabel(order.status)}</p>
            <p><strong>رقم التتبع:</strong> ${order.trackingNumber}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price} ج.م</td>
                <td>${item.price * item.quantity} ج.م</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p><strong>المجموع الفرعي:</strong> ${subtotal} ج.م</p>
          <p><strong>رسوم التوصيل:</strong> ${order.deliveryFee} ج.م</p>
          ${order.discount ? `<p><strong>خصم:</strong> ${order.discount} ج.م</p>` : ''}
          <p style="font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333; padding-top: 10px;"><strong>المجموع الإجمالي:</strong> ${total} ج.م</p>
        </div>

        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>نظام إدارة طلبات قطع الغيار</p>
        </div>
      </body>
      </html>
    `;
  }

  contactCustomer(phone: string): void {
    if (confirm(`هل تريد الاتصال بالعميل على الرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  }

  addNewOrder(): void {
    this.showNotification('سيتم فتح نموذج إضافة طلب جديد', 'info');
    // Navigate to add order form or open modal
    console.log('Opening add new order form');
  }

  // Export functionality
  exportOrders(): void {
    const csvContent = this.generateCSV();
    this.downloadCSV(csvContent, `orders-${new Date().toISOString().split('T')[0]}.csv`);
    this.showNotification('تم تصدير البيانات بنجاح!', 'success');
  }

  private generateCSV(): string {
    const headers = [
      'رقم الطلب', 'اسم العميل', 'التليفون', 'العنوان',
      'المبلغ الإجمالي', 'الحالة', 'تاريخ الطلب', 'طريقة الدفع',
      'رسوم التوصيل', 'رقم التتبع'
    ];

    const rows = this.filteredOrders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.customerAddress,
      this.calculateOrderTotal(order),
      this.getStatusLabel(order.status),
      order.orderDate.toLocaleDateString('ar-EG'),
      this.getPaymentMethodLabel(order.paymentMethod),
      order.deliveryFee,
      order.trackingNumber || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const BOM = '\uFEFF'; // UTF-8 BOM for proper Arabic encoding
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'نقداً عند الاستلام',
      'card': 'بطاقة ائتمان',
      'online': 'دفع إلكتروني'
    };
    return methods[method] || method;
  }

  getPaymentStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'paid': 'مدفوع',
      'failed': 'فشل',
      'refunded': 'مرتجع'
    };
    return statuses[status] || status;
  }

  // Timeline Methods
  isTimelineStepCompleted(stepStatus: string, currentStatus: string): boolean {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    const stepIndex = statusOrder.indexOf(stepStatus);
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex <= currentIndex;
  }

  getTimelineIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check',
      'preparing': 'fas fa-cog',
      'ready': 'fas fa-box',
      'delivering': 'fas fa-truck',
      'delivered': 'fas fa-check-circle'
    };
    return icons[status] || 'fas fa-question';
  }

  // Communication Methods
  sendWhatsApp(phone: string): void {
    const message = encodeURIComponent('مرحباً، بخصوص طلبكم');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // Pagination Methods
  goToFirstPage(): void {
    this.currentPage = 1;
    this.updatePaginatedOrders();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.updatePaginatedOrders();
  }

  // FAB Menu Methods
  toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  refreshOrders(): void {
    this.isProcessing = true;
    this.processingMessage = 'جاري تحديث الطلبات...';

    setTimeout(() => {
      this.loadOrders();
      this.calculateStats();
      this.applyFilters();
      this.isProcessing = false;
      this.fabMenuOpen = false;
      this.showNotification('تم تحديث قائمة الطلبات بنجاح', 'success');
    }, 1500);
  }

  showStatistics(): void {
    this.fabMenuOpen = false;
    this.showNotification('سيتم فتح نافذة الإحصائيات قريباً', 'info');
  }

  // Enhanced Quick Filter Methods - UPDATE EXISTING METHOD
  applyQuickFilter(filter: string): void {
    this.quickFilter = filter;

    switch (filter) {
      case 'all':
        this.selectedStatus = 'all';
        this.selectedDate = '';
        break;
      case 'today':
        this.selectedStatus = 'all';
        this.selectedDate = new Date().toISOString().split('T')[0];
        break;
      case 'pending':
        this.selectedStatus = 'pending';
        this.selectedDate = '';
        break;
      case 'urgent':
        this.selectedStatus = 'all';
        this.selectedDate = '';
        // Filter for high priority orders
        this.filteredOrders = this.filteredOrders.filter(order =>
          order.priority === 'high' ||
          this.isUrgentOrder(order)
        );
        break;
    }

    // Apply filters if not urgent (urgent has custom logic above)
    if (filter !== 'urgent') {
      this.applyFilters();
    } else {
      this.updatePagination();
    }

    const filterLabel = this.getQuickFilterLabel(filter);
    this.showNotification(`تم تطبيق فلتر: ${filterLabel}`, 'success');

    // Auto-hide quick filters after selection on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.hideQuickFilters();
      }, 1500);
    }
  }

  private getQuickFilterLabel(filter: string): string {
    const labels: { [key: string]: string } = {
      'all': 'جميع الطلبات',
      'today': 'طلبات اليوم',
      'pending': 'الطلبات المعلقة',
      'urgent': 'الطلبات العاجلة'
    };
    return labels[filter] || filter;
  }

  // Utility methods
  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  trackByItemId(index: number, item: OrderItem): string {
    return item.id;
  }

  onImageError(event: any): void {
    // event.target.src = 'https://via.placeholder.com/50x50/cccccc/666666?text=صورة';
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Notification system
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    // Auto dismiss notification after 4 seconds
    setTimeout(() => {
      this.dismissNotification();
    }, 4000);
  }

  dismissNotification(): void {
    this.notificationMessage = '';
    this.notificationType = '';
  }

  getNotificationIcon(): string {
    const icons: { [key: string]: string } = {
      'success': 'fas fa-check-circle',
      'error': 'fas fa-exclamation-circle',
      'warning': 'fas fa-exclamation-triangle',
      'info': 'fas fa-info-circle'
    };
    return icons[this.notificationType] || 'fas fa-info-circle';
  }

  // Auto refresh
  private startAutoRefresh(): void {
    interval(30000) // 30 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateStats();
        console.log('📊 تحديث تلقائي للإحصائيات...');
      });

    // Simulate new orders occasionally
    interval(120000) // 2 minutes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (Math.random() > 0.7) { // 30% chance
          this.simulateNewOrder();
        }
      });
  }

  private simulateNewOrder(): void {
    const newOrderNumber = `ORD-2025-${String(this.allOrders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: newOrderNumber,
      orderNumber: newOrderNumber,
      customerName: 'عميل جديد',
      customerPhone: '01999888777',
      customerEmail: 'new@example.com',
      customerAddress: 'عنوان جديد، القاهرة',
      orderDate: new Date(),
      status: 'pending',
      paymentMethod: 'cash',
      deliveryFee: 50,
      discount: 0,
      priority: 'medium',
      customerType: 'new',
      trackingNumber: `TRK-${Date.now()}`,
      notes: 'طلب جديد تم إنشاؤه تلقائياً',
      merchantNotes: '',
      items: [
        {
          id: `item-${Date.now()}`,
          productName: 'منتج تجريبي جديد',
          quantity: 1,
          price: 200,
          image: 'https://via.placeholder.com/50x50/6c757d/ffffff?text=جديد',
          category: 'أخرى',
          brand: 'عام',
          model: 'تجريبي',
          warranty: '3 شهور',
          availability: 'available'
        }
      ],
      totalAmount: 250,
      lastUpdated: new Date(),
      specialInstructions: 'طلب تجريبي',
      paymentStatus: 'pending',
      paidAmount: 0,
      remainingAmount: 250,
      timeline: [
        {
          status: 'pending',
          title: 'طلب جديد',
          timestamp: new Date(),
          date: new Date(),
          description: 'تم إنشاء الطلب تلقائياً',
          note: 'طلب تجريبي للاختبار'
        }
      ]
    };

    this.allOrders.unshift(newOrder);
    this.calculateStats();
    this.applyFilters();
    this.saveOrdersToStorage();

    this.showNotification('تم استلام طلب جديد! 🎉', 'success');
  }

  // Storage management
  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem('merchant_orders', JSON.stringify(this.allOrders));
    } catch (error) {
      console.warn('Failed to save orders to localStorage:', error);
    }
  }

  private loadOrdersFromStorage(): void {
    try {
      const saved = localStorage.getItem('merchant_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        // Convert date strings back to Date objects
        orders.forEach((order: any) => {
          order.orderDate = new Date(order.orderDate);
          if (order.estimatedDelivery) {
            order.estimatedDelivery = new Date(order.estimatedDelivery);
          }
          if (order.lastUpdated) {
            order.lastUpdated = new Date(order.lastUpdated);
          }
        });
        this.allOrders = orders;
      }
    } catch (error) {
      console.warn('Failed to load orders from localStorage:', error);
      this.loadOrders(); // Fallback to mock data
    }
  }

  // Error handling
  private handleError(error: any, action: string): void {
    console.error(`Error in ${action}:`, error);
    this.error = error.message || `حدث خطأ أثناء ${action}`;
    this.showNotification(this.error ?? 'حدث خطأ غير معروف', 'error');
  }

  // Navigation methods
  goToAddProduct(): void {
    this.router.navigate(['/merchant/products/add']);
  }

  goToSettings(): void {
    this.router.navigate(['/merchant/settings']);
  }

  goToCustomers(): void {
    this.router.navigate(['/merchant/customers']);
  }

  goToReports(): void {
    this.router.navigate(['/merchant/reports']);
  }


   // Helper method to determine if order is urgent
   private isUrgentOrder(order: Order): boolean {
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const hoursOld = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return (
      order.priority === 'high' ||
      (order.status === 'pending' && hoursOld > 4) || // Pending for more than 4 hours
      (order.status === 'delivering' && hoursOld > 8) || // In delivery for more than 8 hours
      order.customerType === 'vip'
    );
  }
}

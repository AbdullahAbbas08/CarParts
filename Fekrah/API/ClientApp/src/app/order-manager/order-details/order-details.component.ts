import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

// Enhanced Interfaces
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
}

export interface TimelineEvent {
  title: string;
  description: string;
  icon: string;
  time?: Date;
  active: boolean;
  completed: boolean;
}

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({
          transform: 'translateY(100%)',
          opacity: 0,
          scale: 0.8
        }),
        animate('400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({
            transform: 'translateY(0)',
            opacity: 1,
            scale: 1
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.55, 0.055, 0.675, 0.19)',
          style({
            transform: 'translateY(100%)',
            opacity: 0,
            scale: 0.8
          })
        )
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden'
        }),
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            height: '*',
            opacity: 1
          })
        )
      ]),
      transition(':leave', [
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden'
        }),
        animate('250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            height: '0px',
            opacity: 0
          })
        )
      ])
    ]),
    trigger('buttonClick', [
      transition('* => clicked', [
        animate('200ms', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(0.95)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  @Input() selectedOrder: Order | null = null;
  @Input() showOrderDetails: boolean = false;
  @Output() closeDetails = new EventEmitter<void>();
  @Output() statusUpdate = new EventEmitter<{ orderId: string, newStatus: string }>();
  @Output() orderPrint = new EventEmitter<Order>();

  private destroy$ = new Subject<void>();

  // Component state
  showContactModal = false;
  isLoading = false;
  buttonStates: { [key: string]: string } = {};

  // Section visibility states
  sectionStates = {
    customer: false,      // بيانات العميل مفتوحة بشكل افتراضي
    items: false,         // عناصر الطلب مفتوحة بشكل افتراضي
    payment: false,      // الدفع والتوصيل
    summary: false,       // ملخص الطلب مفتوح بشكل افتراضي
    notes: false,        // الملاحظات
    timeline: false,     // التاريخ الزمني
    quickActions: false, // الإجراءات السريعة
    insights: false      // الإحصائيات
  };

  // Order status configurations
  private statusConfig = {
    pending: {
      label: 'في الانتظار',
      color: '#ffc107',
      icon: 'fas fa-clock',
      nextActions: ['confirmed', 'cancelled']
    },
    confirmed: {
      label: 'مؤكد',
      color: '#17a2b8',
      icon: 'fas fa-check',
      nextActions: ['preparing', 'cancelled']
    },
    preparing: {
      label: 'قيد التحضير',
      color: '#007bff',
      icon: 'fas fa-cog',
      nextActions: ['ready', 'cancelled']
    },
    ready: {
      label: 'جاهز للتسليم',
      color: '#28a745',
      icon: 'fas fa-box',
      nextActions: ['delivering']
    },
    delivering: {
      label: 'في الطريق',
      color: '#fd7e14',
      icon: 'fas fa-truck',
      nextActions: ['delivered']
    },
    delivered: {
      label: 'تم التسليم',
      color: '#198754',
      icon: 'fas fa-check-circle',
      nextActions: []
    },
    cancelled: {
      label: 'ملغي',
      color: '#dc3545',
      icon: 'fas fa-times-circle',
      nextActions: []
    }
  };

  // Payment method configurations
  private paymentMethodConfig = {
    cash: {
      label: 'الدفع عند الاستلام',
      icon: 'fas fa-money-bill-wave',
      class: 'cash'
    },
    card: {
      label: 'بطاقة ائتمان',
      icon: 'fas fa-credit-card',
      class: 'card'
    },
    online: {
      label: 'دفع إلكتروني',
      icon: 'fas fa-laptop',
      class: 'online'
    }
  };

  // Quick actions
  quickActions = [
    {
      label: 'اتصال سريع',
      icon: 'fas fa-phone',
      action: () => this.callCustomer(),
      color: '#007bff'
    },
    {
      label: 'إرسال رسالة',
      icon: 'fas fa-envelope',
      action: () => this.sendSMS(),
      color: '#28a745'
    },
    {
      label: 'فتح واتساب',
      icon: 'fab fa-whatsapp',
      action: () => this.openWhatsApp(),
      color: '#25d366'
    },
    {
      label: 'إضافة ملاحظة',
      icon: 'fas fa-sticky-note',
      action: () => this.addMerchantNote(),
      color: '#ffc107'
    },
    {
      label: 'تحديث التسليم',
      icon: 'fas fa-calendar-alt',
      action: () => this.updateEstimatedDelivery(),
      color: '#6f42c1'
    },
    {
      label: 'نسخ رقم الطلب',
      icon: 'fas fa-copy',
      action: () => this.copyOrderNumber(),
      color: '#6c757d'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadOrderDetails();
    this.initKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Section toggle functionality
  // تعديل دالة toggleSection لتغلق باقي الـ tabs
  toggleSection(sectionName: keyof typeof this.sectionStates): void {
    // إذا كان الـ section مفتوح، أغلقه
    if (this.sectionStates[sectionName]) {
      this.sectionStates[sectionName] = false;
    } else {
      // أغلق جميع الـ sections أولاً
      this.collapseAllSections();

      // ثم افتح الـ section المطلوب
      this.sectionStates[sectionName] = true;
    }

    // Save user preferences
    this.saveSectionPreferences();

    // Add visual feedback
    this.animateToggle(sectionName);
  }

  private animateToggle(sectionName: string): void {
    const element = document.querySelector(`[data-section="${sectionName}"]`);
    if (element) {
      element.classList.add('section-toggle-animation');
      setTimeout(() => {
        element.classList.remove('section-toggle-animation');
      }, 300);
    }
  }

  private saveSectionPreferences(): void {
    localStorage.setItem('orderDetailsSectionStates', JSON.stringify(this.sectionStates));
  }

  private loadSectionPreferences(): void {
    const saved = localStorage.getItem('orderDetailsSectionStates');
    if (saved) {
      try {
        this.sectionStates = { ...this.sectionStates, ...JSON.parse(saved) };
      } catch (error) {
        console.warn('Failed to load section preferences:', error);
      }
    }
  }

  // تعديل دالة expandAllSections لتفتح section واحد في كل مرة
  expandAllSections(): void {
    // بدلاً من فتح الكل، افتح أول section فقط
    this.collapseAllSections();
    this.sectionStates.customer = true;
    this.saveSectionPreferences();

    // إظهار رسالة توضيحية
    this.showSuccessMessage('تم فتح القسم الأول. يمكنك فتح قسم واحد فقط في كل مرة');
  }

  collapseAllSections(): void {
    Object.keys(this.sectionStates).forEach(key => {
      this.sectionStates[key as keyof typeof this.sectionStates] = false;
    });
  }
 // إضافة دالة جديدة لفتح section محدد وإغلاق الباقي
 openSingleSection(sectionName: keyof typeof this.sectionStates): void {
  // أغلق جميع الـ sections
  this.collapseAllSections();

  // افتح الـ section المطلوب فقط
  this.sectionStates[sectionName] = true;

  this.saveSectionPreferences();
  this.animateToggle(sectionName);
}


  // دالة للتحقق من وجود sections مفتوحة
  hasOpenSections(): boolean {
    return Object.values(this.sectionStates).some(state => state === true);
  }

  // دالة للحصول على الـ section المفتوح حالياً
  getOpenSection(): keyof typeof this.sectionStates | null {
    const openSection = Object.entries(this.sectionStates)
      .find(([key, value]) => value === true);

    return openSection ? openSection[0] as keyof typeof this.sectionStates : null;
  }
  // Load order details
  private loadOrderDetails(): void {
    if (this.selectedOrder) {
      console.log('Loading details for order:', this.selectedOrder.orderNumber);
      this.loadSectionPreferences();
      this.trackOrderView();
    }
  }

  // Close order details modal
  closeOrderDetails(): void {
    this.showContactModal = false;
    this.closeDetails.emit();
  }

  // Contact customer methods
  contactCustomer(): void {
    this.showContactModal = true;
  }

  closeContactModal(): void {
    this.showContactModal = false;
  }

  // Order calculations
  getTotalQuantity(): number {
    if (!this.selectedOrder?.items) return 0;
    return this.selectedOrder.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    if (!this.selectedOrder?.items) return 0;
    return this.selectedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDiscount(): number {
    return this.selectedOrder?.discount || 0;
  }

  // Status management
  getStatusColor(status?: string): string {
    if (!status) return '#6c757d';
    return this.statusConfig[status as keyof typeof this.statusConfig]?.color || '#6c757d';
  }

  getStatusIcon(status?: string): string {
    if (!status) return 'fas fa-question';
    return this.statusConfig[status as keyof typeof this.statusConfig]?.icon || 'fas fa-question';
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'غير محدد';
    return this.statusConfig[status as keyof typeof this.statusConfig]?.label || status;
  }

  // Payment method helpers
  getPaymentMethodLabel(method?: string): string {
    if (!method) return 'غير محدد';
    return this.paymentMethodConfig[method as keyof typeof this.paymentMethodConfig]?.label || method;
  }

  getPaymentMethodIcon(method?: string): string {
    if (!method) return 'fas fa-question';
    return this.paymentMethodConfig[method as keyof typeof this.paymentMethodConfig]?.icon || 'fas fa-question';
  }

  getPaymentMethodClass(method?: string): string {
    if (!method) return '';
    return this.paymentMethodConfig[method as keyof typeof this.paymentMethodConfig]?.class || '';
  }

  // Order timeline
  getOrderTimeline(): TimelineEvent[] {
    if (!this.selectedOrder) return [];

    const timeline: TimelineEvent[] = [
      {
        title: 'تم استلام الطلب',
        description: 'تم إنشاء الطلب بنجاح وإرساله إلى التاجر',
        icon: 'fas fa-plus-circle',
        time: this.selectedOrder.orderDate,
        completed: true,
        active: false
      },
      {
        title: 'تأكيد الطلب',
        description: 'تم مراجعة الطلب من قبل التاجر وتأكيده',
        icon: 'fas fa-check-circle',
        time: this.selectedOrder.status !== 'pending' ? this.selectedOrder.lastUpdated : undefined,
        completed: this.selectedOrder.status !== 'pending',
        active: this.selectedOrder.status === 'confirmed'
      },
      {
        title: 'تحضير الطلب',
        description: 'جاري تحضير وتجهيز قطع الغيار المطلوبة',
        icon: 'fas fa-cog',
        time: this.selectedOrder.status === 'preparing' ? this.selectedOrder.lastUpdated : undefined,
        completed: ['ready', 'delivering', 'delivered'].includes(this.selectedOrder.status),
        active: this.selectedOrder.status === 'preparing'
      },
      {
        title: 'جاهز للتسليم',
        description: 'الطلب جاهز ومتاح للاستلام أو التوصيل',
        icon: 'fas fa-box',
        time: this.selectedOrder.status === 'ready' ? this.selectedOrder.lastUpdated : undefined,
        completed: ['delivering', 'delivered'].includes(this.selectedOrder.status),
        active: this.selectedOrder.status === 'ready'
      },
      {
        title: 'جاري التوصيل',
        description: 'الطلب في الطريق إلى عنوان العميل',
        icon: 'fas fa-truck',
        time: this.selectedOrder.status === 'delivering' ? this.selectedOrder.lastUpdated : undefined,
        completed: this.selectedOrder.status === 'delivered',
        active: this.selectedOrder.status === 'delivering'
      },
      {
        title: 'تم التسليم',
        description: 'تم تسليم الطلب بنجاح للعميل',
        icon: 'fas fa-check-double',
        time: this.selectedOrder.status === 'delivered' ? this.selectedOrder.lastUpdated : undefined,
        completed: this.selectedOrder.status === 'delivered',
        active: false
      }
    ];

    // Handle cancelled orders
    if (this.selectedOrder.status === 'cancelled') {
      timeline.push({
        title: 'تم إلغاء الطلب',
        description: 'تم إلغاء الطلب بناءً على طلب العميل أو التاجر',
        icon: 'fas fa-times-circle',
        time: this.selectedOrder.lastUpdated,
        completed: true,
        active: false
      });
    }

    return timeline;
  }

  // Status action helpers
  canConfirm(): boolean {
    return this.selectedOrder?.status === 'pending';
  }

  canPrepare(): boolean {
    return this.selectedOrder?.status === 'confirmed';
  }

  canMarkReady(): boolean {
    return this.selectedOrder?.status === 'preparing';
  }

  canStartDelivery(): boolean {
    return this.selectedOrder?.status === 'ready';
  }

  canComplete(): boolean {
    return this.selectedOrder?.status === 'delivering';
  }

  canCancel(): boolean {
    return this.selectedOrder ? !['delivered', 'cancelled'].includes(this.selectedOrder.status) : false;
  }

  // Status update methods
  confirmOrder(): void {
    this.updateOrderStatus('confirmed');
  }

  updateStatus(newStatus: string): void {
    this.updateOrderStatus(newStatus);
  }

  private updateOrderStatus(newStatus: string): void {
    if (!this.selectedOrder) return;

    // Add button animation
    this.animateButton(newStatus);

    // Emit status update
    this.statusUpdate.emit({
      orderId: this.selectedOrder.id,
      newStatus: newStatus
    });

    // Update local order status
    this.selectedOrder.status = newStatus as any;
    this.selectedOrder.lastUpdated = new Date();

    // Show success message
    this.showSuccessMessage(`تم تحديث حالة الطلب إلى: ${this.getStatusLabel(newStatus)}`);

    // Announce to screen reader
    this.announceStatusChange(newStatus);
  }

  cancelOrder(): void {
    if (!this.selectedOrder) return;

    const confirmMessage = `هل أنت متأكد من إلغاء الطلب ${this.selectedOrder.orderNumber}؟`;

    if (confirm(confirmMessage)) {
      this.updateOrderStatus('cancelled');
    }
  }

  // Utility methods
  trackByItemId(index: number, item: OrderItem): string {
    return item.id;
  }

  onImageError(event: any): void {
    // event.target.src = 'assets/images/placeholder-product.png';
  }

  viewProductDetails(item: OrderItem): void {
    console.log('View product details:', item);
    // Navigate to product details or show product modal
  }

  // Print and export methods
  printOrder(): void {
    if (this.selectedOrder) {
      this.orderPrint.emit(this.selectedOrder);
      window.print();
    }
  }

  exportOrderPDF(): void {
    if (!this.selectedOrder) return;

    // Simulate PDF generation
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessMessage('تم تصدير الطلب كملف PDF بنجاح');
      // In real app, implement PDF generation library like jsPDF
    }, 2000);
  }

  // Advanced order management
  addMerchantNote(): void {
    const note = prompt('أضف ملاحظة للطلب:');

    if (note && this.selectedOrder) {
      this.selectedOrder.merchantNotes = note;
      this.showSuccessMessage('تم إضافة الملاحظة بنجاح');
      this.saveOrderChanges();
    }
  }

  updateEstimatedDelivery(): void {
    const dateString = prompt('أدخل التاريخ المتوقع للتوصيل (YYYY-MM-DD):');

    if (dateString && this.selectedOrder) {
      const newDate = new Date(dateString);

      if (!isNaN(newDate.getTime())) {
        this.selectedOrder.estimatedDelivery = newDate;
        this.showSuccessMessage('تم تحديث موعد التوصيل المتوقع');
        this.saveOrderChanges();
      } else {
        alert('تاريخ غير صحيح. يرجى استخدام الصيغة: YYYY-MM-DD');
      }
    }
  }

  copyOrderNumber(): void {
    if (this.selectedOrder?.orderNumber) {
      navigator.clipboard.writeText(this.selectedOrder.orderNumber).then(() => {
        this.showSuccessMessage('تم نسخ رقم الطلب');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.selectedOrder!.orderNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showSuccessMessage('تم نسخ رقم الطلب');
      });
    }
  }

  private saveOrderChanges(): void {
    // In real implementation, this would save to backend
    if (this.selectedOrder) {
      localStorage.setItem(`order_${this.selectedOrder.id}`, JSON.stringify(this.selectedOrder));
    }
  }

  // Order insights
  getOrderInsights(): {
    processingTime: number;
    itemsCount: number;
    averageItemPrice: number;
    customerType: string;
  } {
    if (!this.selectedOrder) {
      return {
        processingTime: 0,
        itemsCount: 0,
        averageItemPrice: 0,
        customerType: 'جديد'
      };
    }

    const processingTime = this.selectedOrder.lastUpdated
      ? Math.round((this.selectedOrder.lastUpdated.getTime() - this.selectedOrder.orderDate.getTime()) / (1000 * 60 * 60))
      : 0;

    const itemsCount = this.selectedOrder.items.length;
    const totalValue = this.getSubtotal();
    const averageItemPrice = itemsCount > 0 ? totalValue / itemsCount : 0;

    return {
      processingTime,
      itemsCount,
      averageItemPrice,
      customerType: 'عميل دائم'
    };
  }

  getOrderInsightsArray(): Array<{ icon: string, value: string, label: string }> {
    const insights = this.getOrderInsights();

    return [
      {
        icon: 'fas fa-clock',
        value: `${insights.processingTime} ساعة`,
        label: 'وقت المعالجة'
      },
      {
        icon: 'fas fa-box',
        value: insights.itemsCount.toString(),
        label: 'عدد العناصر'
      },
      {
        icon: 'fas fa-calculator',
        value: `${Math.round(insights.averageItemPrice)} ج.م`,
        label: 'متوسط سعر العنصر'
      },
      {
        icon: 'fas fa-user-tag',
        value: insights.customerType,
        label: 'نوع العميل'
      },
      {
        icon: 'fas fa-star',
        value: this.getPriorityLabel(),
        label: 'الأولوية'
      },
      {
        icon: 'fas fa-truck',
        value: `${this.selectedOrder?.deliveryFee} ج.م`,
        label: 'رسوم التوصيل'
      }
    ];
  }

  // Order priorities
  getOrderPriority(): 'high' | 'medium' | 'low' {
    if (!this.selectedOrder) return 'low';

    const orderValue = this.selectedOrder.totalAmount;
    const orderAge = Date.now() - this.selectedOrder.orderDate.getTime();
    const ageInHours = orderAge / (1000 * 60 * 60);

    if (orderValue > 1000 && ageInHours > 24) return 'high';
    if (orderValue > 500 || ageInHours > 12) return 'medium';
    return 'low';
  }

  getPriorityColor(): string {
    const priority = this.getOrderPriority();
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  getPriorityLabel(): string {
    const priority = this.getOrderPriority();
    switch (priority) {
      case 'high': return 'أولوية عالية';
      case 'medium': return 'أولوية متوسطة';
      case 'low': return 'أولوية منخفضة';
      default: return 'غير محدد';
    }
  }

  // Customer communication templates
  getMessageTemplates(): Array<{ title: string, content: string }> {
    if (!this.selectedOrder) return [];

    return [
      {
        title: 'تأكيد الطلب',
        content: `مرحباً ${this.selectedOrder.customerName}، تم تأكيد طلبك رقم ${this.selectedOrder.orderNumber} وسيتم تحضيره قريباً.`
      },
      {
        title: 'جاهز للتسليم',
        content: `طلبك رقم ${this.selectedOrder.orderNumber} جاهز للتسليم. يرجى التواصل معنا لتحديد موعد الاستلام.`
      },
      {
        title: 'في الطريق',
        content: `طلبك رقم ${this.selectedOrder.orderNumber} في الطريق إليك. الوصول المتوقع خلال 30 دقيقة.`
      },
      {
        title: 'تم التسليم',
        content: `شكراً لك! تم تسليم طلبك رقم ${this.selectedOrder.orderNumber} بنجاح. نتطلع لخدمتك مرة أخرى.`
      }
    ];
  }

  sendTemplate(template: { title: string, content: string }): void {
    if (this.selectedOrder?.customerPhone) {
      const message = encodeURIComponent(template.content);
      window.open(`sms:${this.selectedOrder.customerPhone}?body=${message}`);
    }
  }

  // Quick actions execution
  executeQuickAction(action: () => void): void {
    try {
      action();
    } catch (error) {
      this.handleError(error, 'تنفيذ الإجراء السريع');
    }
  }

  // Contact methods
  callCustomer(): void {
    if (this.selectedOrder?.customerPhone) {
      window.open(`tel:${this.selectedOrder.customerPhone}`);
    }
  }

  sendSMS(): void {
    if (this.selectedOrder?.customerPhone) {
      const message = encodeURIComponent(`مرحباً ${this.selectedOrder.customerName}، بخصوص طلبك رقم ${this.selectedOrder.orderNumber}`);
      window.open(`sms:${this.selectedOrder.customerPhone}?body=${message}`);
    }
  }

  openWhatsApp(): void {
    if (this.selectedOrder?.customerPhone) {
      const message = encodeURIComponent(`مرحباً ${this.selectedOrder.customerName}، بخصوص طلبك رقم ${this.selectedOrder.orderNumber}`);
      window.open(`https://wa.me/${this.selectedOrder.customerPhone}?text=${message}`, '_blank');
    }
  }

  // Export and reporting
  generateOrderReport(): void {
    if (!this.selectedOrder) return;

    const reportData = {
      order: this.selectedOrder,
      timeline: this.getOrderTimeline(),
      insights: this.getOrderInsights(),
      sections: this.sectionStates
    };

    console.log('Order Report Generated:', reportData);
    this.showSuccessMessage('تم إنشاء تقرير الطلب بنجاح');
  }

  // Analytics and tracking
  trackOrderView(): void {
    if (this.selectedOrder) {
      console.log(`Order ${this.selectedOrder.orderNumber} viewed`);
      // Send analytics event
    }
  }

  // Notification methods
  private showSuccessMessage(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      z-index: 2000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  private animateButton(action: string): void {
    this.buttonStates[action] = 'clicked';

    setTimeout(() => {
      delete this.buttonStates[action];
    }, 200);
  }

  // Accessibility improvements
  announceStatusChange(newStatus: string): void {
    const announcement = `تم تحديث حالة الطلب إلى ${this.getStatusLabel(newStatus)}`;

    const srElement = document.createElement('div');
    srElement.setAttribute('aria-live', 'polite');
    srElement.setAttribute('aria-atomic', 'true');
    srElement.className = 'sr-only';
    srElement.textContent = announcement;

    document.body.appendChild(srElement);

    setTimeout(() => {
      document.body.removeChild(srElement);
    }, 1000);
  }

  // Keyboard shortcuts
  private initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.showOrderDetails) return;

      if (document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case '1':
          if (this.canConfirm()) this.confirmOrder();
          break;
        case '2':
          if (this.canPrepare()) this.updateStatus('preparing');
          break;
        case '3':
          if (this.canMarkReady()) this.updateStatus('ready');
          break;
        case '4':
          if (this.canStartDelivery()) this.updateStatus('delivering');
          break;
        case '5':
          if (this.canComplete()) this.updateStatus('delivered');
          break;
        case 'c':
        case 'C':
          this.contactCustomer();
          break;
        case 'p':
        case 'P':
          if (event.ctrlKey) {
            event.preventDefault();
            this.printOrder();
          }
          break;
        case 'e':
        case 'E':
          if (event.ctrlKey) {
            event.preventDefault();
            this.expandAllSections();
          }
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey) {
            event.preventDefault();
            this.collapseAllSections();
          }
          break;
        case 'Escape':
          this.closeOrderDetails();
          break;
      }
    });
  }

  // Error handling
  private handleError(error: any, action: string): void {
    console.error(`Error in ${action}:`, error);

    const errorMessage = error.message || `حدث خطأ أثناء ${action}`;
    this.showErrorMessage(errorMessage);
  }

  private showErrorMessage(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
      z-index: 2000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 4000);
  }

  // Order validation
  validateOrderUpdate(newStatus: string): boolean {
    if (!this.selectedOrder) return false;

    const currentStatus = this.selectedOrder.status;
    const allowedTransitions = this.statusConfig[currentStatus as keyof typeof this.statusConfig]?.nextActions || [];

    return allowedTransitions.includes(newStatus as never);
  }

  // Advanced search and filtering within order
  searchOrderItems(searchTerm: string): OrderItem[] {
    if (!this.selectedOrder?.items || !searchTerm) {
      return this.selectedOrder?.items || [];
    }

    return this.selectedOrder.items.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Order history and audit trail
  getOrderHistory(): Array<{ action: string, timestamp: Date, user: string }> {
    // In real implementation, this would fetch from backend
    return [
      {
        action: 'تم إنشاء الطلب',
        timestamp: this.selectedOrder?.orderDate || new Date(),
        user: 'النظام'
      },
      {
        action: 'تم تأكيد الطلب',
        timestamp: new Date(),
        user: 'التاجر'
      }
    ];
  }

  // Order metrics and insights
  getOrderMetrics(): {
    responseTime: string;
    completionRate: number;
    customerSatisfaction: number;
    averageOrderValue: number;
  } {
    return {
      responseTime: '15 دقيقة',
      completionRate: 94.5,
      customerSatisfaction: 4.7,
      averageOrderValue: 850
    };
  }

  // Inventory management integration
  checkItemAvailability(item: OrderItem): boolean {
    // In real implementation, check against inventory
    return Math.random() > 0.1; // 90% availability simulation
  }

  getAvailabilityStatus(item: OrderItem): { status: string, color: string, label: string } {
    const available = this.checkItemAvailability(item);

    if (available) {
      return {
        status: 'available',
        color: '#28a745',
        label: 'متوفر'
      };
    } else {
      return {
        status: 'out_of_stock',
        color: '#dc3545',
        label: 'غير متوفر'
      };
    }
  }

  // Bulk operations
  selectAllItems(): void {
    // Implementation for bulk operations
    console.log('Select all items');
  }

  bulkUpdateItems(updates: Partial<OrderItem>): void {
    // Implementation for bulk updates
    console.log('Bulk update items:', updates);
  }

  // Real-time updates simulation
  private startRealTimeUpdates(): void {
    // In real implementation, use WebSocket or SSE
    setInterval(() => {
      if (this.selectedOrder && Math.random() > 0.95) {
        // Simulate random status update
        console.log('Real-time update received');
      }
    }, 30000); // Check every 30 seconds
  }

  // Performance optimization
  private optimizePerformance(): void {
    // Implement virtual scrolling for large item lists
    // Lazy load images
    // Debounce search operations
    // Cache frequently accessed data
  }

  // Data validation
  private validateOrderData(): boolean {
    if (!this.selectedOrder) return false;

    const requiredFields = ['id', 'orderNumber', 'customerName', 'customerPhone', 'items'];
    return requiredFields.every(field => this.selectedOrder![field as keyof Order]);
  }

  // Helper method for currency formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Helper method for date formatting
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Order priority management
  updateOrderPriority(priority: 'high' | 'medium' | 'low'): void {
    if (this.selectedOrder) {
      // In real implementation, save to backend
      console.log(`Order priority updated to: ${priority}`);
      this.showSuccessMessage(`تم تحديث أولوية الطلب إلى: ${this.getPriorityLabel()}`);
    }
  }

  // Customer management integration
  getCustomerOrderHistory(): Array<{ orderNumber: string, date: Date, total: number }> {
    // In real implementation, fetch from backend
    return [
      {
        orderNumber: 'ORD-2024-001',
        date: new Date('2024-01-15'),
        total: 1250
      },
      {
        orderNumber: 'ORD-2024-015',
        date: new Date('2024-02-20'),
        total: 850
      }
    ];
  }

  // Notification preferences
  updateNotificationPreferences(preferences: { email: boolean, sms: boolean, push: boolean }): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    this.showSuccessMessage('تم تحديث تفضيلات الإشعارات');
  }

  // Theme management
  toggleTheme(): void {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // Export functionality
  exportToExcel(): void {
    if (!this.selectedOrder) return;

    // In real implementation, use a library like xlsx
    console.log('Exporting order to Excel');
    this.showSuccessMessage('تم تصدير الطلب إلى Excel بنجاح');
  }

  exportToCSV(): void {
    if (!this.selectedOrder) return;

    const csvData = this.generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${this.selectedOrder.orderNumber}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.showSuccessMessage('تم تصدير الطلب إلى CSV بنجاح');
  }

  private generateCSVData(): string {
    if (!this.selectedOrder) return '';

    const headers = ['رقم الطلب', 'اسم العميل', 'التليفون', 'العنوان', 'المنتج', 'الكمية', 'السعر', 'المجموع'];
    const rows = this.selectedOrder.items.map(item => [
      this.selectedOrder!.orderNumber,
      this.selectedOrder!.customerName,
      this.selectedOrder!.customerPhone,
      this.selectedOrder!.customerAddress,
      item.productName,
      item.quantity.toString(),
      item.price.toString(),
      (item.price * item.quantity).toString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Accessibility enhancements
  enableHighContrast(): void {
    document.body.classList.toggle('high-contrast');
    this.showSuccessMessage('تم تفعيل وضع التباين العالي');
  }

  increaseFontSize(): void {
    const currentSize = parseInt(getComputedStyle(document.body).fontSize);
    document.body.style.fontSize = `${currentSize + 2}px`;
    this.showSuccessMessage('تم زيادة حجم الخط');
  }

  decreaseFontSize(): void {
    const currentSize = parseInt(getComputedStyle(document.body).fontSize);
    if (currentSize > 12) {
      document.body.style.fontSize = `${currentSize - 2}px`;
      this.showSuccessMessage('تم تقليل حجم الخط');
    }
  }

  // Component cleanup
  private cleanupResources(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.initKeyboardShortcuts);

    // Clear timeouts and intervals
    // Cancel any pending HTTP requests

    // Clear temporary data
    this.buttonStates = {};
  }
}

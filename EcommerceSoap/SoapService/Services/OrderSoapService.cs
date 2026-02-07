using BusinessLayer.Services;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// تطبيق خدمة الطلبات SOAP - SOAP Order Service Implementation
    /// تنفيذ العمليات المتعلقة بالطلبات عبر SOAP
    /// Implementation of order operations via SOAP
    /// </summary>
    public class OrderSoapService : IOrderSoapService
    {
        // خدمة الطلبات من طبقة الأعمال - Order service from business layer
        private readonly OrderService _orderService;
        // خدمة سلة التسوق - Shopping cart service
        private readonly ShoppingCartService _cartService;

        /// <summary>
        /// المُنشئ - Constructor
        /// يقوم بإنشاء نسخة من خدمات الطلبات وسلة التسوق
        /// Creates instances of order and shopping cart services
        /// </summary>
        public OrderSoapService()
        {
            _orderService = new OrderService();
            _cartService = new ShoppingCartService();
        }

        /// <summary>
        /// إنشاء طلب جديد من سلة التسوق - Create new order from shopping cart
        /// </summary>
        public Order CreateOrderFromCart(int customerId, string shippingAddress)
        {
            // التحقق من صحة عنوان الشحن
            // Validate shipping address
            if (string.IsNullOrEmpty(shippingAddress))
                throw new Exception("عنوان الشحن مطلوب - Shipping address is required");

            // الحصول على سلة العميل
            // Get customer's cart
            var cart = _cartService.GetCartByCustomerId(customerId);
            if (cart == null || !cart.CartItems.Any())
                throw new Exception("السلة فارغة - Cart is empty");

            // إنشاء الطلب
            // Create order
            var order = _orderService.CreateOrder(customerId, cart, shippingAddress);

            // إفراغ السلة بعد إنشاء الطلب
            // Clear cart after creating order
            _cartService.ClearCart(customerId);

            return order;
        }

        /// <summary>
        /// الحصول على طلب بواسطة المعرف - Get order by ID
        /// </summary>
        public Order GetOrderById(int orderId)
        {
            // البحث عن الطلب
            // Search for order
            var order = _orderService.GetOrderById(orderId);
            
            // إرجاع الطلب أو رمي استثناء إذا لم يتم العثور عليه
            // Return order or throw exception if not found
            return order ?? throw new Exception($"الطلب غير موجود - Order {orderId} not found");
        }

        /// <summary>
        /// الحصول على طلبات العميل - Get customer orders
        /// </summary>
        public List<Order> GetOrdersByCustomerId(int customerId)
        {
            // إرجاع جميع طلبات العميل
            // Return all customer orders
            return _orderService.GetOrdersByCustomerId(customerId);
        }

        /// <summary>
        /// تحديث حالة الطلب - Update order status
        /// </summary>
        public bool UpdateOrderStatus(int orderId, string newStatus)
        {
            // التحقق من صحة الحالة الجديدة
            // Validate new status
            if (string.IsNullOrEmpty(newStatus))
                throw new Exception("الحالة الجديدة مطلوبة - New status is required");

            // تحديث الحالة
            // Update status
            var result = _orderService.UpdateOrderStatus(orderId, newStatus);
            
            if (!result)
                throw new Exception($"فشل تحديث حالة الطلب - Failed to update status for order {orderId}");

            return result;
        }

        /// <summary>
        /// إلغاء الطلب - Cancel order
        /// </summary>
        public bool CancelOrder(int orderId)
        {
            // إلغاء الطلب
            // Cancel order
            var result = _orderService.CancelOrder(orderId);
            
            if (!result)
                throw new Exception($"فشل إلغاء الطلب - Failed to cancel order {orderId}");

            return result;
        }

        /// <summary>
        /// الحصول على جميع الطلبات - Get all orders
        /// </summary>
        public List<Order> GetAllOrders()
        {
            // إرجاع جميع الطلبات
            // Return all orders
            return _orderService.GetAllOrders();
        }
    }
}

using DataLayer.Models;

namespace BusinessLayer.Services
{
    /// <summary>
    /// خدمة الطلبات - Order Service
    /// تحتوي على العمليات المتعلقة بإدارة الطلبات
    /// Contains operations related to order management
    /// </summary>
    public class OrderService
    {
        // قائمة الطلبات (في الواقع نستخدم قاعدة بيانات)
        // List of orders (in reality we would use a database)
        private static List<Order> _orders = new List<Order>();
        private static int _nextOrderId = 1;
        private static int _nextOrderItemId = 1;

        /// <summary>
        /// إنشاء طلب جديد من سلة التسوق - Create new order from shopping cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="cart">سلة التسوق - Shopping cart</param>
        /// <param name="shippingAddress">عنوان الشحن - Shipping address</param>
        /// <returns>الطلب الجديد - New order</returns>
        public Order CreateOrder(int customerId, ShoppingCart cart, string shippingAddress)
        {
            // التحقق من أن السلة ليست فارغة
            // Check that cart is not empty
            if (cart == null || !cart.CartItems.Any())
                throw new InvalidOperationException("لا يمكن إنشاء طلب من سلة فارغة - Cannot create order from empty cart");

            // إنشاء طلب جديد
            // Create new order
            var order = new Order
            {
                OrderId = _nextOrderId++,
                CustomerId = customerId,
                OrderDate = DateTime.Now,
                Status = "قيد المعالجة", // Processing
                ShippingAddress = shippingAddress,
                OrderItems = new List<OrderItem>()
            };

            // نسخ المنتجات من السلة إلى الطلب
            // Copy items from cart to order
            foreach (var cartItem in cart.CartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderItemId = _nextOrderItemId++,
                    OrderId = order.OrderId,
                    ProductId = cartItem.ProductId,
                    ProductName = cartItem.ProductName,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.UnitPrice
                };
                order.OrderItems.Add(orderItem);
            }

            // حساب المجموع الكلي
            // Calculate total amount
            order.TotalAmount = order.OrderItems.Sum(item => item.Subtotal);

            // حفظ الطلب
            // Save order
            _orders.Add(order);

            return order;
        }

        /// <summary>
        /// الحصول على طلب بواسطة المعرف - Get order by ID
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <returns>الطلب أو null - Order or null</returns>
        public Order? GetOrderById(int orderId)
        {
            // البحث عن الطلب
            // Search for order
            return _orders.FirstOrDefault(o => o.OrderId == orderId);
        }

        /// <summary>
        /// الحصول على جميع طلبات العميل - Get all customer orders
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>قائمة طلبات العميل - List of customer orders</returns>
        public List<Order> GetOrdersByCustomerId(int customerId)
        {
            // تصفية الطلبات حسب معرف العميل
            // Filter orders by customer ID
            return _orders.Where(o => o.CustomerId == customerId)
                         .OrderByDescending(o => o.OrderDate)
                         .ToList();
        }

        /// <summary>
        /// تحديث حالة الطلب - Update order status
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <param name="newStatus">الحالة الجديدة - New status</param>
        /// <returns>true إذا تم التحديث بنجاح - true if update successful</returns>
        public bool UpdateOrderStatus(int orderId, string newStatus)
        {
            // البحث عن الطلب
            // Find order
            var order = _orders.FirstOrDefault(o => o.OrderId == orderId);
            if (order == null)
                return false;

            // تحديث الحالة
            // Update status
            order.Status = newStatus;

            return true;
        }

        /// <summary>
        /// إلغاء الطلب - Cancel order
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <returns>true إذا تم الإلغاء بنجاح - true if cancellation successful</returns>
        public bool CancelOrder(int orderId)
        {
            // البحث عن الطلب
            // Find order
            var order = _orders.FirstOrDefault(o => o.OrderId == orderId);
            if (order == null)
                return false;

            // التحقق من إمكانية إلغاء الطلب (فقط إذا كان قيد المعالجة)
            // Check if order can be cancelled (only if it's processing)
            if (order.Status != "قيد المعالجة" && order.Status != "Processing")
                return false;

            // تحديث الحالة إلى ملغى
            // Update status to cancelled
            order.Status = "ملغى"; // Cancelled

            return true;
        }

        /// <summary>
        /// الحصول على جميع الطلبات - Get all orders
        /// </summary>
        /// <returns>قائمة بجميع الطلبات - List of all orders</returns>
        public List<Order> GetAllOrders()
        {
            // إرجاع جميع الطلبات مرتبة حسب التاريخ
            // Return all orders sorted by date
            return _orders.OrderByDescending(o => o.OrderDate).ToList();
        }

        /// <summary>
        /// الحصول على الطلبات حسب الحالة - Get orders by status
        /// </summary>
        /// <param name="status">الحالة المطلوبة - Desired status</param>
        /// <returns>قائمة الطلبات - List of orders</returns>
        public List<Order> GetOrdersByStatus(string status)
        {
            // تصفية الطلبات حسب الحالة
            // Filter orders by status
            return _orders.Where(o => o.Status == status)
                         .OrderByDescending(o => o.OrderDate)
                         .ToList();
        }
    }
}

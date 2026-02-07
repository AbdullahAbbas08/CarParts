namespace DataLayer.Models
{
    /// <summary>
    /// نموذج الطلب - Order Model
    /// يمثل طلب الشراء الذي يقوم به العميل
    /// Represents a purchase order made by a customer
    /// </summary>
    public class Order
    {
        /// <summary>
        /// معرف الطلب الفريد - Unique Order ID
        /// </summary>
        public int OrderId { get; set; }

        /// <summary>
        /// معرف العميل الذي قام بالطلب - Customer ID who made the order
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// تاريخ إنشاء الطلب - Order Creation Date
        /// </summary>
        public DateTime OrderDate { get; set; }

        /// <summary>
        /// إجمالي قيمة الطلب - Total Order Amount
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// حالة الطلب: قيد المعالجة، تم الشحن، تم التوصيل - Order Status: Processing, Shipped, Delivered
        /// </summary>
        public string Status { get; set; } = "Processing";

        /// <summary>
        /// عنوان الشحن - Shipping Address
        /// </summary>
        public string ShippingAddress { get; set; } = string.Empty;

        /// <summary>
        /// قائمة المنتجات المطلوبة - List of ordered items
        /// </summary>
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    /// <summary>
    /// نموذج عنصر الطلب - Order Item Model
    /// يمثل منتج واحد ضمن الطلب
    /// Represents a single product within an order
    /// </summary>
    public class OrderItem
    {
        /// <summary>
        /// معرف عنصر الطلب - Order Item ID
        /// </summary>
        public int OrderItemId { get; set; }

        /// <summary>
        /// معرف الطلب - Order ID
        /// </summary>
        public int OrderId { get; set; }

        /// <summary>
        /// معرف المنتج - Product ID
        /// </summary>
        public int ProductId { get; set; }

        /// <summary>
        /// اسم المنتج - Product Name
        /// </summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// الكمية المطلوبة - Quantity Ordered
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// السعر لكل وحدة - Unit Price
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// المجموع الفرعي (الكمية × السعر) - Subtotal (Quantity × Price)
        /// </summary>
        public decimal Subtotal => Quantity * UnitPrice;
    }
}

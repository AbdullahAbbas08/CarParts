namespace DataLayer.Models
{
    /// <summary>
    /// نموذج سلة التسوق - Shopping Cart Model
    /// يمثل سلة التسوق الخاصة بالعميل
    /// Represents a customer's shopping cart
    /// </summary>
    public class ShoppingCart
    {
        /// <summary>
        /// معرف سلة التسوق - Shopping Cart ID
        /// </summary>
        public int CartId { get; set; }

        /// <summary>
        /// معرف العميل - Customer ID
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// قائمة المنتجات في السلة - List of cart items
        /// </summary>
        public List<CartItem> CartItems { get; set; } = new List<CartItem>();

        /// <summary>
        /// إجمالي قيمة السلة - Total Cart Value
        /// </summary>
        public decimal TotalAmount => CartItems.Sum(item => item.Subtotal);

        /// <summary>
        /// تاريخ آخر تحديث للسلة - Last Updated Date
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// نموذج عنصر السلة - Cart Item Model
    /// يمثل منتج واحد في سلة التسوق
    /// Represents a single product in the shopping cart
    /// </summary>
    public class CartItem
    {
        /// <summary>
        /// معرف عنصر السلة - Cart Item ID
        /// </summary>
        public int CartItemId { get; set; }

        /// <summary>
        /// معرف السلة - Cart ID
        /// </summary>
        public int CartId { get; set; }

        /// <summary>
        /// معرف المنتج - Product ID
        /// </summary>
        public int ProductId { get; set; }

        /// <summary>
        /// اسم المنتج - Product Name
        /// </summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// الكمية - Quantity
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// السعر لكل وحدة - Unit Price
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// المجموع الفرعي - Subtotal
        /// </summary>
        public decimal Subtotal => Quantity * UnitPrice;
    }
}

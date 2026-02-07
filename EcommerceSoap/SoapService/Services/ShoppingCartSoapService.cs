using BusinessLayer.Services;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// تطبيق خدمة سلة التسوق SOAP - SOAP Shopping Cart Service Implementation
    /// تنفيذ العمليات المتعلقة بسلة التسوق عبر SOAP
    /// Implementation of shopping cart operations via SOAP
    /// </summary>
    public class ShoppingCartSoapService : IShoppingCartSoapService
    {
        // خدمة سلة التسوق من طبقة الأعمال - Shopping cart service from business layer
        private readonly ShoppingCartService _cartService;

        /// <summary>
        /// المُنشئ - Constructor
        /// يقوم بإنشاء نسخة من خدمة سلة التسوق
        /// Creates an instance of shopping cart service
        /// </summary>
        public ShoppingCartSoapService()
        {
            _cartService = new ShoppingCartService();
        }

        /// <summary>
        /// إنشاء سلة تسوق جديدة - Create new shopping cart
        /// </summary>
        public ShoppingCart CreateCart(int customerId)
        {
            // إنشاء سلة جديدة للعميل
            // Create new cart for customer
            return _cartService.CreateCart(customerId);
        }

        /// <summary>
        /// الحصول على سلة العميل - Get customer's cart
        /// </summary>
        public ShoppingCart GetCartByCustomerId(int customerId)
        {
            // البحث عن سلة العميل
            // Search for customer's cart
            var cart = _cartService.GetCartByCustomerId(customerId);
            
            // إرجاع السلة أو رمي استثناء إذا لم توجد
            // Return cart or throw exception if not found
            return cart ?? throw new Exception($"السلة غير موجودة للعميل - Cart not found for customer {customerId}");
        }

        /// <summary>
        /// إضافة منتج إلى السلة - Add product to cart
        /// </summary>
        public ShoppingCart AddItemToCart(int customerId, int productId, string productName, decimal unitPrice, int quantity)
        {
            // التحقق من صحة البيانات
            // Validate data
            if (quantity <= 0)
                throw new Exception("الكمية يجب أن تكون أكبر من صفر - Quantity must be greater than zero");

            if (unitPrice <= 0)
                throw new Exception("السعر يجب أن يكون أكبر من صفر - Price must be greater than zero");

            // إضافة المنتج إلى السلة
            // Add product to cart
            return _cartService.AddItemToCart(customerId, productId, productName, unitPrice, quantity);
        }

        /// <summary>
        /// إزالة منتج من السلة - Remove product from cart
        /// </summary>
        public bool RemoveItemFromCart(int customerId, int productId)
        {
            // إزالة المنتج من السلة
            // Remove product from cart
            var result = _cartService.RemoveItemFromCart(customerId, productId);
            
            if (!result)
                throw new Exception($"فشل إزالة المنتج من السلة - Failed to remove product {productId} from cart");

            return result;
        }

        /// <summary>
        /// تحديث كمية منتج - Update product quantity
        /// </summary>
        public bool UpdateItemQuantity(int customerId, int productId, int newQuantity)
        {
            // التحقق من صحة الكمية
            // Validate quantity
            if (newQuantity < 0)
                throw new Exception("الكمية لا يمكن أن تكون سالبة - Quantity cannot be negative");

            // تحديث الكمية
            // Update quantity
            var result = _cartService.UpdateItemQuantity(customerId, productId, newQuantity);
            
            if (!result)
                throw new Exception($"فشل تحديث كمية المنتج - Failed to update quantity for product {productId}");

            return result;
        }

        /// <summary>
        /// إفراغ السلة - Clear cart
        /// </summary>
        public bool ClearCart(int customerId)
        {
            // إفراغ جميع المنتجات من السلة
            // Clear all products from cart
            var result = _cartService.ClearCart(customerId);
            
            if (!result)
                throw new Exception($"فشل إفراغ السلة - Failed to clear cart for customer {customerId}");

            return result;
        }
    }
}

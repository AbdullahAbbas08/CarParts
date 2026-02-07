using DataLayer.Models;

namespace BusinessLayer.Services
{
    /// <summary>
    /// خدمة سلة التسوق - Shopping Cart Service
    /// تحتوي على العمليات المتعلقة بإدارة سلة التسوق
    /// Contains operations related to shopping cart management
    /// </summary>
    public class ShoppingCartService
    {
        // قائمة سلات التسوق (في الواقع نستخدم قاعدة بيانات)
        // List of shopping carts (in reality we would use a database)
        private static List<ShoppingCart> _carts = new List<ShoppingCart>();
        private static int _nextCartId = 1;
        private static int _nextCartItemId = 1;

        /// <summary>
        /// إنشاء سلة تسوق جديدة للعميل - Create new shopping cart for customer
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>السلة الجديدة - New cart</returns>
        public ShoppingCart CreateCart(int customerId)
        {
            // التحقق من وجود سلة للعميل
            // Check if customer already has a cart
            var existingCart = _carts.FirstOrDefault(c => c.CustomerId == customerId);
            if (existingCart != null)
                return existingCart;

            // إنشاء سلة جديدة
            // Create new cart
            var cart = new ShoppingCart
            {
                CartId = _nextCartId++,
                CustomerId = customerId,
                LastUpdated = DateTime.Now
            };

            _carts.Add(cart);
            return cart;
        }

        /// <summary>
        /// الحصول على سلة العميل - Get customer's cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>السلة أو null - Cart or null</returns>
        public ShoppingCart? GetCartByCustomerId(int customerId)
        {
            // البحث عن سلة العميل
            // Search for customer's cart
            return _carts.FirstOrDefault(c => c.CustomerId == customerId);
        }

        /// <summary>
        /// إضافة منتج إلى السلة - Add product to cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <param name="productName">اسم المنتج - Product name</param>
        /// <param name="unitPrice">سعر الوحدة - Unit price</param>
        /// <param name="quantity">الكمية - Quantity</param>
        /// <returns>السلة المحدثة - Updated cart</returns>
        public ShoppingCart AddItemToCart(int customerId, int productId, string productName, decimal unitPrice, int quantity)
        {
            // الحصول على السلة أو إنشاء واحدة جديدة
            // Get cart or create a new one
            var cart = GetCartByCustomerId(customerId) ?? CreateCart(customerId);

            // التحقق من وجود المنتج في السلة
            // Check if product already exists in cart
            var existingItem = cart.CartItems.FirstOrDefault(i => i.ProductId == productId);

            if (existingItem != null)
            {
                // تحديث الكمية إذا كان المنتج موجود
                // Update quantity if product exists
                existingItem.Quantity += quantity;
            }
            else
            {
                // إضافة منتج جديد للسلة
                // Add new product to cart
                var newItem = new CartItem
                {
                    CartItemId = _nextCartItemId++,
                    CartId = cart.CartId,
                    ProductId = productId,
                    ProductName = productName,
                    UnitPrice = unitPrice,
                    Quantity = quantity
                };
                cart.CartItems.Add(newItem);
            }

            // تحديث تاريخ آخر تعديل
            // Update last modified date
            cart.LastUpdated = DateTime.Now;

            return cart;
        }

        /// <summary>
        /// إزالة منتج من السلة - Remove product from cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>true إذا تمت الإزالة بنجاح - true if removal successful</returns>
        public bool RemoveItemFromCart(int customerId, int productId)
        {
            // الحصول على السلة
            // Get cart
            var cart = GetCartByCustomerId(customerId);
            if (cart == null)
                return false;

            // البحث عن المنتج وإزالته
            // Find and remove product
            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return false;

            cart.CartItems.Remove(item);
            cart.LastUpdated = DateTime.Now;

            return true;
        }

        /// <summary>
        /// تحديث كمية منتج في السلة - Update product quantity in cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <param name="newQuantity">الكمية الجديدة - New quantity</param>
        /// <returns>true إذا تم التحديث بنجاح - true if update successful</returns>
        public bool UpdateItemQuantity(int customerId, int productId, int newQuantity)
        {
            // الحصول على السلة
            // Get cart
            var cart = GetCartByCustomerId(customerId);
            if (cart == null)
                return false;

            // البحث عن المنتج وتحديث الكمية
            // Find product and update quantity
            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return false;

            if (newQuantity <= 0)
            {
                // إزالة المنتج إذا كانت الكمية صفر أو سالبة
                // Remove product if quantity is zero or negative
                cart.CartItems.Remove(item);
            }
            else
            {
                item.Quantity = newQuantity;
            }

            cart.LastUpdated = DateTime.Now;
            return true;
        }

        /// <summary>
        /// إفراغ السلة - Clear cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>true إذا تم الإفراغ بنجاح - true if clearing successful</returns>
        public bool ClearCart(int customerId)
        {
            // الحصول على السلة
            // Get cart
            var cart = GetCartByCustomerId(customerId);
            if (cart == null)
                return false;

            // إفراغ جميع المنتجات
            // Clear all items
            cart.CartItems.Clear();
            cart.LastUpdated = DateTime.Now;

            return true;
        }
    }
}

using System.ServiceModel;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// واجهة خدمة سلة التسوق SOAP - SOAP Shopping Cart Service Interface
    /// تعريف العمليات المتاحة لسلة التسوق عبر بروتوكول SOAP
    /// Defines available operations for shopping cart via SOAP protocol
    /// </summary>
    [ServiceContract]
    public interface IShoppingCartSoapService
    {
        /// <summary>
        /// إنشاء سلة تسوق جديدة - Create new shopping cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>السلة الجديدة - New cart</returns>
        [OperationContract]
        ShoppingCart CreateCart(int customerId);

        /// <summary>
        /// الحصول على سلة العميل - Get customer's cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>السلة - Cart</returns>
        [OperationContract]
        ShoppingCart GetCartByCustomerId(int customerId);

        /// <summary>
        /// إضافة منتج إلى السلة - Add product to cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <param name="productName">اسم المنتج - Product name</param>
        /// <param name="unitPrice">سعر الوحدة - Unit price</param>
        /// <param name="quantity">الكمية - Quantity</param>
        /// <returns>السلة المحدثة - Updated cart</returns>
        [OperationContract]
        ShoppingCart AddItemToCart(int customerId, int productId, string productName, decimal unitPrice, int quantity);

        /// <summary>
        /// إزالة منتج من السلة - Remove product from cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool RemoveItemFromCart(int customerId, int productId);

        /// <summary>
        /// تحديث كمية منتج - Update product quantity
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <param name="newQuantity">الكمية الجديدة - New quantity</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool UpdateItemQuantity(int customerId, int productId, int newQuantity);

        /// <summary>
        /// إفراغ السلة - Clear cart
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool ClearCart(int customerId);
    }
}

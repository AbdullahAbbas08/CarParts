using System.ServiceModel;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// واجهة خدمة المنتجات SOAP - SOAP Product Service Interface
    /// تعريف العمليات المتاحة للمنتجات عبر بروتوكول SOAP
    /// Defines available operations for products via SOAP protocol
    /// </summary>
    [ServiceContract]
    public interface IProductSoapService
    {
        /// <summary>
        /// الحصول على جميع المنتجات - Get all products
        /// </summary>
        /// <returns>قائمة المنتجات - List of products</returns>
        [OperationContract]
        List<Product> GetAllProducts();

        /// <summary>
        /// الحصول على منتج بواسطة المعرف - Get product by ID
        /// </summary>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>المنتج - Product</returns>
        [OperationContract]
        Product GetProductById(int productId);

        /// <summary>
        /// البحث عن منتجات بواسطة الفئة - Search products by category
        /// </summary>
        /// <param name="category">اسم الفئة - Category name</param>
        /// <returns>قائمة المنتجات - List of products</returns>
        [OperationContract]
        List<Product> GetProductsByCategory(string category);

        /// <summary>
        /// إضافة منتج جديد - Add new product
        /// </summary>
        /// <param name="product">المنتج الجديد - New product</param>
        /// <returns>المنتج المضاف - Added product</returns>
        [OperationContract]
        Product AddProduct(Product product);

        /// <summary>
        /// تحديث منتج - Update product
        /// </summary>
        /// <param name="product">المنتج المحدث - Updated product</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool UpdateProduct(Product product);

        /// <summary>
        /// حذف منتج - Delete product
        /// </summary>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool DeleteProduct(int productId);
    }
}

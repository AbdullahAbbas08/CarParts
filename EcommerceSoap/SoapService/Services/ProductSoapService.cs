using BusinessLayer.Services;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// تطبيق خدمة المنتجات SOAP - SOAP Product Service Implementation
    /// تنفيذ العمليات المتعلقة بالمنتجات عبر SOAP
    /// Implementation of product operations via SOAP
    /// </summary>
    public class ProductSoapService : IProductSoapService
    {
        // خدمة المنتجات من طبقة الأعمال - Product service from business layer
        private readonly ProductService _productService;

        /// <summary>
        /// المُنشئ - Constructor
        /// يقوم بإنشاء نسخة من خدمة المنتجات
        /// Creates an instance of product service
        /// </summary>
        public ProductSoapService()
        {
            _productService = new ProductService();
        }

        /// <summary>
        /// الحصول على جميع المنتجات - Get all products
        /// </summary>
        public List<Product> GetAllProducts()
        {
            // استدعاء طبقة الأعمال للحصول على المنتجات
            // Call business layer to get products
            return _productService.GetAllProducts();
        }

        /// <summary>
        /// الحصول على منتج بواسطة المعرف - Get product by ID
        /// </summary>
        public Product GetProductById(int productId)
        {
            // البحث عن المنتج
            // Search for product
            var product = _productService.GetProductById(productId);
            
            // إرجاع المنتج أو رمي استثناء إذا لم يتم العثور عليه
            // Return product or throw exception if not found
            return product ?? throw new Exception($"المنتج غير موجود - Product {productId} not found");
        }

        /// <summary>
        /// البحث عن منتجات بواسطة الفئة - Search products by category
        /// </summary>
        public List<Product> GetProductsByCategory(string category)
        {
            // تصفية المنتجات حسب الفئة
            // Filter products by category
            return _productService.GetProductsByCategory(category);
        }

        /// <summary>
        /// إضافة منتج جديد - Add new product
        /// </summary>
        public Product AddProduct(Product product)
        {
            // التحقق من صحة البيانات
            // Validate data
            if (string.IsNullOrEmpty(product.Name))
                throw new Exception("اسم المنتج مطلوب - Product name is required");

            if (product.Price <= 0)
                throw new Exception("سعر المنتج يجب أن يكون أكبر من صفر - Product price must be greater than zero");

            // إضافة المنتج عبر طبقة الأعمال
            // Add product via business layer
            return _productService.AddProduct(product);
        }

        /// <summary>
        /// تحديث منتج - Update product
        /// </summary>
        public bool UpdateProduct(Product product)
        {
            // تحديث المنتج عبر طبقة الأعمال
            // Update product via business layer
            var result = _productService.UpdateProduct(product);
            
            if (!result)
                throw new Exception($"فشل تحديث المنتج - Failed to update product {product.ProductId}");

            return result;
        }

        /// <summary>
        /// حذف منتج - Delete product
        /// </summary>
        public bool DeleteProduct(int productId)
        {
            // حذف المنتج عبر طبقة الأعمال
            // Delete product via business layer
            var result = _productService.DeleteProduct(productId);
            
            if (!result)
                throw new Exception($"فشل حذف المنتج - Failed to delete product {productId}");

            return result;
        }
    }
}

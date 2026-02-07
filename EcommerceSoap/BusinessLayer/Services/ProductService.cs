using DataLayer.Models;

namespace BusinessLayer.Services
{
    /// <summary>
    /// خدمة المنتجات - Product Service
    /// تحتوي على جميع العمليات المتعلقة بإدارة المنتجات
    /// Contains all operations related to product management
    /// </summary>
    public class ProductService
    {
        // قائمة ثابتة للمنتجات (في الواقع نستخدم قاعدة بيانات)
        // Static list of products (in reality we would use a database)
        private static List<Product> _products = new List<Product>
        {
            new Product
            {
                ProductId = 1,
                Name = "لابتوب Dell",
                Description = "لابتوب عالي الأداء للألعاب والعمل",
                Price = 5000,
                StockQuantity = 10,
                Category = "إلكترونيات",
                CreatedDate = DateTime.Now,
                IsActive = true
            },
            new Product
            {
                ProductId = 2,
                Name = "هاتف iPhone 15",
                Description = "أحدث إصدار من آيفون",
                Price = 7000,
                StockQuantity = 15,
                Category = "إلكترونيات",
                CreatedDate = DateTime.Now,
                IsActive = true
            },
            new Product
            {
                ProductId = 3,
                Name = "سماعة رأس Sony",
                Description = "سماعة لاسلكية بجودة صوت عالية",
                Price = 500,
                StockQuantity = 25,
                Category = "ملحقات",
                CreatedDate = DateTime.Now,
                IsActive = true
            }
        };

        /// <summary>
        /// الحصول على جميع المنتجات - Get all products
        /// </summary>
        /// <returns>قائمة بجميع المنتجات - List of all products</returns>
        public List<Product> GetAllProducts()
        {
            // إرجاع المنتجات النشطة فقط
            // Return only active products
            return _products.Where(p => p.IsActive).ToList();
        }

        /// <summary>
        /// الحصول على منتج بواسطة المعرف - Get product by ID
        /// </summary>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>المنتج المطلوب أو null - Requested product or null</returns>
        public Product? GetProductById(int productId)
        {
            // البحث عن المنتج في القائمة
            // Search for product in the list
            return _products.FirstOrDefault(p => p.ProductId == productId);
        }

        /// <summary>
        /// البحث عن المنتجات بواسطة الفئة - Search products by category
        /// </summary>
        /// <param name="category">اسم الفئة - Category name</param>
        /// <returns>قائمة المنتجات في هذه الفئة - List of products in this category</returns>
        public List<Product> GetProductsByCategory(string category)
        {
            // تصفية المنتجات حسب الفئة
            // Filter products by category
            return _products.Where(p => p.Category == category && p.IsActive).ToList();
        }

        /// <summary>
        /// إضافة منتج جديد - Add new product
        /// </summary>
        /// <param name="product">المنتج الجديد - New product</param>
        /// <returns>المنتج بعد الإضافة - Product after adding</returns>
        public Product AddProduct(Product product)
        {
            // تعيين معرف جديد للمنتج
            // Assign new ID to product
            product.ProductId = _products.Max(p => p.ProductId) + 1;
            product.CreatedDate = DateTime.Now;
            product.IsActive = true;

            // إضافة المنتج للقائمة
            // Add product to list
            _products.Add(product);

            return product;
        }

        /// <summary>
        /// تحديث معلومات منتج - Update product information
        /// </summary>
        /// <param name="product">المنتج المحدث - Updated product</param>
        /// <returns>true إذا تم التحديث بنجاح - true if update successful</returns>
        public bool UpdateProduct(Product product)
        {
            // البحث عن المنتج الحالي
            // Find existing product
            var existingProduct = _products.FirstOrDefault(p => p.ProductId == product.ProductId);
            
            if (existingProduct == null)
                return false;

            // تحديث البيانات
            // Update data
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.StockQuantity = product.StockQuantity;
            existingProduct.Category = product.Category;

            return true;
        }

        /// <summary>
        /// حذف منتج (حذف منطقي) - Delete product (soft delete)
        /// </summary>
        /// <param name="productId">معرف المنتج - Product ID</param>
        /// <returns>true إذا تم الحذف بنجاح - true if deletion successful</returns>
        public bool DeleteProduct(int productId)
        {
            // البحث عن المنتج
            // Find product
            var product = _products.FirstOrDefault(p => p.ProductId == productId);
            
            if (product == null)
                return false;

            // حذف منطقي (تعيين IsActive إلى false)
            // Soft delete (set IsActive to false)
            product.IsActive = false;

            return true;
        }
    }
}

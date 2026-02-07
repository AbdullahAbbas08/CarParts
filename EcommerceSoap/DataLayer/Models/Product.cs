namespace DataLayer.Models
{
    /// <summary>
    /// نموذج المنتج - Product Model
    /// يحتوي على جميع المعلومات الخاصة بالمنتج في المتجر الإلكتروني
    /// Contains all information related to a product in the ecommerce store
    /// </summary>
    public class Product
    {
        /// <summary>
        /// معرف المنتج الفريد - Unique Product ID
        /// </summary>
        public int ProductId { get; set; }

        /// <summary>
        /// اسم المنتج - Product Name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// وصف المنتج - Product Description
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// سعر المنتج - Product Price
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// الكمية المتوفرة في المخزن - Available Stock Quantity
        /// </summary>
        public int StockQuantity { get; set; }

        /// <summary>
        /// الفئة التي ينتمي لها المنتج - Product Category
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// تاريخ إضافة المنتج - Date when product was added
        /// </summary>
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// حالة المنتج: متاح أو غير متاح - Product status: available or not
        /// </summary>
        public bool IsActive { get; set; }
    }
}

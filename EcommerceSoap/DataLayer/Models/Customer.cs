namespace DataLayer.Models
{
    /// <summary>
    /// نموذج العميل - Customer Model
    /// يحتوي على معلومات العميل الذي يتسوق في المتجر
    /// Contains customer information for shopping in the store
    /// </summary>
    public class Customer
    {
        /// <summary>
        /// معرف العميل الفريد - Unique Customer ID
        /// </summary>
        public int CustomerId { get; set; }

        /// <summary>
        /// اسم العميل الكامل - Customer Full Name
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// البريد الإلكتروني - Email Address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// رقم الهاتف - Phone Number
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// العنوان الكامل - Full Address
        /// </summary>
        public string Address { get; set; } = string.Empty;

        /// <summary>
        /// تاريخ التسجيل - Registration Date
        /// </summary>
        public DateTime RegistrationDate { get; set; }

        /// <summary>
        /// حالة الحساب: نشط أو معطل - Account status: active or disabled
        /// </summary>
        public bool IsActive { get; set; }
    }
}

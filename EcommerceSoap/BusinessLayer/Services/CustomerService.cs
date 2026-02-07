using DataLayer.Models;

namespace BusinessLayer.Services
{
    /// <summary>
    /// خدمة العملاء - Customer Service
    /// تحتوي على العمليات المتعلقة بإدارة العملاء
    /// Contains operations related to customer management
    /// </summary>
    public class CustomerService
    {
        // قائمة العملاء (في الواقع نستخدم قاعدة بيانات)
        // List of customers (in reality we would use a database)
        private static List<Customer> _customers = new List<Customer>
        {
            new Customer
            {
                CustomerId = 1,
                FullName = "أحمد محمد",
                Email = "ahmed@example.com",
                PhoneNumber = "0501234567",
                Address = "الرياض، حي النخيل، شارع الملك فهد",
                RegistrationDate = DateTime.Now.AddMonths(-6),
                IsActive = true
            },
            new Customer
            {
                CustomerId = 2,
                FullName = "فاطمة علي",
                Email = "fatima@example.com",
                PhoneNumber = "0507654321",
                Address = "جدة، حي الحمراء، شارع الأمير محمد",
                RegistrationDate = DateTime.Now.AddMonths(-3),
                IsActive = true
            }
        };

        private static int _nextCustomerId = 3;

        /// <summary>
        /// تسجيل عميل جديد - Register new customer
        /// </summary>
        /// <param name="customer">بيانات العميل - Customer data</param>
        /// <returns>العميل المسجل - Registered customer</returns>
        public Customer RegisterCustomer(Customer customer)
        {
            // التحقق من عدم وجود البريد الإلكتروني مسبقاً
            // Check that email doesn't already exist
            if (_customers.Any(c => c.Email == customer.Email))
                throw new InvalidOperationException("البريد الإلكتروني مستخدم مسبقاً - Email already exists");

            // تعيين معرف جديد وتاريخ التسجيل
            // Assign new ID and registration date
            customer.CustomerId = _nextCustomerId++;
            customer.RegistrationDate = DateTime.Now;
            customer.IsActive = true;

            // إضافة العميل للقائمة
            // Add customer to list
            _customers.Add(customer);

            return customer;
        }

        /// <summary>
        /// الحصول على عميل بواسطة المعرف - Get customer by ID
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>العميل أو null - Customer or null</returns>
        public Customer? GetCustomerById(int customerId)
        {
            // البحث عن العميل
            // Search for customer
            return _customers.FirstOrDefault(c => c.CustomerId == customerId);
        }

        /// <summary>
        /// الحصول على عميل بواسطة البريد الإلكتروني - Get customer by email
        /// </summary>
        /// <param name="email">البريد الإلكتروني - Email address</param>
        /// <returns>العميل أو null - Customer or null</returns>
        public Customer? GetCustomerByEmail(string email)
        {
            // البحث عن العميل بالبريد الإلكتروني
            // Search for customer by email
            return _customers.FirstOrDefault(c => c.Email == email);
        }

        /// <summary>
        /// الحصول على جميع العملاء النشطين - Get all active customers
        /// </summary>
        /// <returns>قائمة العملاء النشطين - List of active customers</returns>
        public List<Customer> GetAllActiveCustomers()
        {
            // إرجاع العملاء النشطين فقط
            // Return only active customers
            return _customers.Where(c => c.IsActive).ToList();
        }

        /// <summary>
        /// تحديث معلومات العميل - Update customer information
        /// </summary>
        /// <param name="customer">بيانات العميل المحدثة - Updated customer data</param>
        /// <returns>true إذا تم التحديث بنجاح - true if update successful</returns>
        public bool UpdateCustomer(Customer customer)
        {
            // البحث عن العميل الحالي
            // Find existing customer
            var existingCustomer = _customers.FirstOrDefault(c => c.CustomerId == customer.CustomerId);
            if (existingCustomer == null)
                return false;

            // تحديث البيانات
            // Update data
            existingCustomer.FullName = customer.FullName;
            existingCustomer.Email = customer.Email;
            existingCustomer.PhoneNumber = customer.PhoneNumber;
            existingCustomer.Address = customer.Address;

            return true;
        }

        /// <summary>
        /// تعطيل حساب العميل - Deactivate customer account
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>true إذا تم التعطيل بنجاح - true if deactivation successful</returns>
        public bool DeactivateCustomer(int customerId)
        {
            // البحث عن العميل
            // Find customer
            var customer = _customers.FirstOrDefault(c => c.CustomerId == customerId);
            if (customer == null)
                return false;

            // تعطيل الحساب
            // Deactivate account
            customer.IsActive = false;

            return true;
        }

        /// <summary>
        /// تفعيل حساب العميل - Activate customer account
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>true إذا تم التفعيل بنجاح - true if activation successful</returns>
        public bool ActivateCustomer(int customerId)
        {
            // البحث عن العميل
            // Find customer
            var customer = _customers.FirstOrDefault(c => c.CustomerId == customerId);
            if (customer == null)
                return false;

            // تفعيل الحساب
            // Activate account
            customer.IsActive = true;

            return true;
        }
    }
}

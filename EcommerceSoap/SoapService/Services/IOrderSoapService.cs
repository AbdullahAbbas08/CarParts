using System.ServiceModel;
using DataLayer.Models;

namespace SoapService.Services
{
    /// <summary>
    /// واجهة خدمة الطلبات SOAP - SOAP Order Service Interface
    /// تعريف العمليات المتاحة للطلبات عبر بروتوكول SOAP
    /// Defines available operations for orders via SOAP protocol
    /// </summary>
    [ServiceContract]
    public interface IOrderSoapService
    {
        /// <summary>
        /// إنشاء طلب جديد - Create new order
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <param name="shippingAddress">عنوان الشحن - Shipping address</param>
        /// <returns>الطلب الجديد - New order</returns>
        [OperationContract]
        Order CreateOrderFromCart(int customerId, string shippingAddress);

        /// <summary>
        /// الحصول على طلب بواسطة المعرف - Get order by ID
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <returns>الطلب - Order</returns>
        [OperationContract]
        Order GetOrderById(int orderId);

        /// <summary>
        /// الحصول على طلبات العميل - Get customer orders
        /// </summary>
        /// <param name="customerId">معرف العميل - Customer ID</param>
        /// <returns>قائمة الطلبات - List of orders</returns>
        [OperationContract]
        List<Order> GetOrdersByCustomerId(int customerId);

        /// <summary>
        /// تحديث حالة الطلب - Update order status
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <param name="newStatus">الحالة الجديدة - New status</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool UpdateOrderStatus(int orderId, string newStatus);

        /// <summary>
        /// إلغاء الطلب - Cancel order
        /// </summary>
        /// <param name="orderId">معرف الطلب - Order ID</param>
        /// <returns>نتيجة العملية - Operation result</returns>
        [OperationContract]
        bool CancelOrder(int orderId);

        /// <summary>
        /// الحصول على جميع الطلبات - Get all orders
        /// </summary>
        /// <returns>قائمة جميع الطلبات - List of all orders</returns>
        [OperationContract]
        List<Order> GetAllOrders();
    }
}

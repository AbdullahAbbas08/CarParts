# مشروع خدمات SOAP للتجارة الإلكترونية
# Ecommerce SOAP Services Project

## 🎯 الهدف من المشروع - Project Purpose

هذا مشروع تعليمي لتعلم بروتوكول SOAP في تطبيقات التجارة الإلكترونية. جميع التعليقات مكتوبة باللغة العربية والإنجليزية لتسهيل الفهم والتعلم.

This is an educational project to learn SOAP protocol in ecommerce applications. All comments are written in both Arabic and English for easy understanding and learning.

## 📋 محتويات المشروع - Project Contents

المشروع يتكون من ثلاث طبقات رئيسية:

### 1. طبقة البيانات (DataLayer)
تحتوي على نماذج البيانات (Models):
- **Product** - نموذج المنتج
- **Customer** - نموذج العميل  
- **Order & OrderItem** - نموذج الطلب وعناصره
- **ShoppingCart & CartItem** - نموذج سلة التسوق وعناصرها

### 2. طبقة الأعمال (BusinessLayer)
تحتوي على منطق العمل والخدمات:
- **ProductService** - خدمة إدارة المنتجات
- **CustomerService** - خدمة إدارة العملاء
- **ShoppingCartService** - خدمة إدارة سلة التسوق
- **OrderService** - خدمة إدارة الطلبات

### 3. طبقة الخدمات (SoapService)
تحتوي على واجهات وتطبيقات خدمات SOAP:
- **IProductSoapService & ProductSoapService** - خدمة SOAP للمنتجات
- **IShoppingCartSoapService & ShoppingCartSoapService** - خدمة SOAP لسلة التسوق
- **IOrderSoapService & OrderSoapService** - خدمة SOAP للطلبات

## 🚀 كيفية تشغيل المشروع - How to Run

### المتطلبات - Requirements
- .NET 8.0 SDK أو أحدث
- أي محرر أكواد (Visual Studio, VS Code, Rider)

### خطوات التشغيل - Steps to Run

```bash
# الانتقال إلى مجلد المشروع - Navigate to project folder
cd EcommerceSoap/SoapService

# تشغيل المشروع - Run the project
dotnet run
```

بعد التشغيل، افتح المتصفح على:
```
https://localhost:5001
```

## 📚 الخدمات المتاحة - Available Services

### 1. خدمة المنتجات - Product Service
**نقطة النهاية:** `/ProductService.asmx`  
**WSDL:** `/ProductService.asmx?wsdl`

**العمليات المتاحة - Available Operations:**
- `GetAllProducts()` - الحصول على جميع المنتجات
- `GetProductById(int productId)` - الحصول على منتج بالمعرف
- `GetProductsByCategory(string category)` - البحث حسب الفئة
- `AddProduct(Product product)` - إضافة منتج جديد
- `UpdateProduct(Product product)` - تحديث منتج
- `DeleteProduct(int productId)` - حذف منتج

### 2. خدمة سلة التسوق - Shopping Cart Service
**نقطة النهاية:** `/ShoppingCartService.asmx`  
**WSDL:** `/ShoppingCartService.asmx?wsdl`

**العمليات المتاحة - Available Operations:**
- `CreateCart(int customerId)` - إنشاء سلة جديدة
- `GetCartByCustomerId(int customerId)` - الحصول على سلة العميل
- `AddItemToCart(...)` - إضافة منتج للسلة
- `RemoveItemFromCart(...)` - إزالة منتج من السلة
- `UpdateItemQuantity(...)` - تحديث كمية المنتج
- `ClearCart(int customerId)` - إفراغ السلة

### 3. خدمة الطلبات - Order Service
**نقطة النهاية:** `/OrderService.asmx`  
**WSDL:** `/OrderService.asmx?wsdl`

**العمليات المتاحة - Available Operations:**
- `CreateOrderFromCart(int customerId, string shippingAddress)` - إنشاء طلب
- `GetOrderById(int orderId)` - الحصول على طلب
- `GetOrdersByCustomerId(int customerId)` - طلبات العميل
- `UpdateOrderStatus(int orderId, string newStatus)` - تحديث الحالة
- `CancelOrder(int orderId)` - إلغاء الطلب
- `GetAllOrders()` - جميع الطلبات

## 🧪 اختبار الخدمات - Testing Services

يمكنك اختبار الخدمات باستخدام أحد هذه الأدوات:

### 1. استخدام SoapUI
1. قم بتنزيل [SoapUI](https://www.soapui.org/)
2. أنشئ مشروع SOAP جديد
3. أدخل رابط WSDL (مثال: `https://localhost:5001/ProductService.asmx?wsdl`)
4. سيتم توليد جميع العمليات تلقائياً
5. قم بتعبئة البيانات المطلوبة وإرسال الطلب

### 2. استخدام Postman
1. افتح Postman
2. اختر New > SOAP Request
3. أدخل رابط WSDL
4. اختر العملية المطلوبة
5. قم بتعديل XML Request وإرسال الطلب

### 3. مثال على طلب SOAP

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllProducts xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>
```

## 📖 شرح مفاهيم SOAP - SOAP Concepts Explanation

### ما هو SOAP؟
SOAP (Simple Object Access Protocol) هو بروتوكول لتبادل الرسائل المنظمة في تطبيقات الويب.

### الفرق بين SOAP و REST

| الميزة | SOAP | REST |
|--------|------|------|
| البروتوكول | يستخدم XML فقط | يدعم JSON, XML, وغيرها |
| المعايير | معايير صارمة (WS-*) | معايير مرنة |
| الأمان | أمان مدمج (WS-Security) | يعتمد على HTTPS |
| الأداء | أبطأ قليلاً | أسرع |
| الاستخدام | الأنظمة المصرفية والحكومية | تطبيقات الويب والموبايل |

### مكونات SOAP

1. **WSDL (Web Services Description Language)**
   - ملف وصف الخدمة
   - يحدد العمليات المتاحة وأنواع البيانات

2. **SOAP Envelope**
   - الغلاف الخارجي للرسالة
   - يحتوي على Header و Body

3. **SOAP Body**
   - جسم الرسالة
   - يحتوي على البيانات الفعلية

## 💡 أمثلة عملية - Practical Examples

### مثال 1: الحصول على جميع المنتجات

```csharp
// استدعاء الخدمة - Calling the service
var products = productService.GetAllProducts();

// النتيجة - Result
// قائمة بجميع المنتجات النشطة
// List of all active products
```

### مثال 2: إضافة منتج للسلة

```csharp
// إضافة منتج للسلة - Add product to cart
var cart = cartService.AddItemToCart(
    customerId: 1,
    productId: 1,
    productName: "لابتوب Dell",
    unitPrice: 5000,
    quantity: 2
);

// النتيجة - Result
// سلة محدثة تحتوي على المنتج
// Updated cart containing the product
```

### مثال 3: إنشاء طلب

```csharp
// إنشاء طلب من السلة - Create order from cart
var order = orderService.CreateOrderFromCart(
    customerId: 1,
    shippingAddress: "الرياض، حي النخيل"
);

// النتيجة - Result
// طلب جديد مع جميع المنتجات من السلة
// New order with all products from cart
```

## 🎓 نصائح للتعلم - Learning Tips

### للمبتدئين في SOAP:
1. ابدأ بفهم بنية رسائل SOAP (Envelope, Header, Body)
2. تعلم كيفية قراءة ملفات WSDL
3. جرب كل عملية على حدة قبل دمجها
4. استخدم أدوات مثل SoapUI لفهم كيفية عمل الطلبات

### لمن لديه خبرة في REST:
1. لاحظ الاختلافات في بنية الطلبات (XML vs JSON)
2. SOAP يتطلب تعريف واضح للعقود (Contracts) عبر WSDL
3. معالجة الأخطاء في SOAP تكون عبر SOAP Faults
4. SOAP أكثر صرامة في التحقق من صحة البيانات

## 🔧 التطوير المستقبلي - Future Development

يمكن تطوير المشروع بإضافة:
- قاعدة بيانات حقيقية (SQL Server, PostgreSQL)
- نظام مصادقة وتفويض
- خدمة للدفع الإلكتروني
- خدمة للإشعارات
- لوحة تحكم إدارية

## 📞 الدعم والمساعدة - Support

إذا واجهت أي مشاكل أو لديك أسئلة:
1. راجع التعليقات في الكود
2. تأكد من تثبيت .NET 8.0
3. تحقق من أن جميع المكتبات مثبتة بشكل صحيح

## 📝 الترخيص - License

هذا مشروع تعليمي مفتوح المصدر للاستخدام الحر.

---

**بالتوفيق في تعلم SOAP! 🎉**  
**Good luck learning SOAP! 🎉**

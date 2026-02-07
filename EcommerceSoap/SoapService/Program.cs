using SoapCore;
using SoapService.Services;

/// <summary>
/// ملف بدء تشغيل تطبيق SOAP للتجارة الإلكترونية
/// SOAP Ecommerce Application Startup File
/// هذا الملف يقوم بإعداد وتشغيل خدمات SOAP للتجارة الإلكترونية
/// This file sets up and runs SOAP services for ecommerce
/// </summary>

var builder = WebApplication.CreateBuilder(args);

// إضافة الخدمات للحاوية - Add services to the container
// تسجيل خدمات SOAP - Register SOAP services
builder.Services.AddSingleton<IProductSoapService, ProductSoapService>();
builder.Services.AddSingleton<IShoppingCartSoapService, ShoppingCartSoapService>();
builder.Services.AddSingleton<IOrderSoapService, OrderSoapService>();

// إضافة SoapCore لتمكين SOAP - Add SoapCore to enable SOAP
builder.Services.AddSoapCore();

// إضافة Controllers للواجهة البرمجية - Add Controllers for API
builder.Services.AddControllers();

// إضافة Swagger للتوثيق - Add Swagger for documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// إعداد مسار معالجة الطلبات HTTP - Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// تفعيل HTTPS Redirection
app.UseHttpsRedirection();

// تفعيل Authorization
app.UseAuthorization();

// ربط Controllers
app.MapControllers();

// إعداد نقاط النهاية لخدمات SOAP - Configure SOAP service endpoints
// خدمة المنتجات - Product Service
app.UseSoapEndpoint<IProductSoapService>("/ProductService.asmx", new SoapEncoderOptions());

// خدمة سلة التسوق - Shopping Cart Service
app.UseSoapEndpoint<IShoppingCartSoapService>("/ShoppingCartService.asmx", new SoapEncoderOptions());

// خدمة الطلبات - Order Service
app.UseSoapEndpoint<IOrderSoapService>("/OrderService.asmx", new SoapEncoderOptions());

// صفحة ترحيب بسيطة - Simple welcome page
app.MapGet("/", () => Results.Content(@"
<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>خدمات SOAP للتجارة الإلكترونية - Ecommerce SOAP Services</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; margin-top: 30px; }
        .service { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .description { color: #7f8c8d; margin: 10px 0; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🛒 مرحباً بك في خدمات SOAP للتجارة الإلكترونية</h1>
        <h1>Welcome to Ecommerce SOAP Services</h1>
        
        <div class='description'>
            <p>هذا المشروع يوفر خدمات SOAP كاملة لنظام تجارة إلكترونية تعليمي</p>
            <p>This project provides complete SOAP services for an educational ecommerce system</p>
        </div>

        <h2>📋 الخدمات المتاحة - Available Services:</h2>
        
        <div class='service'>
            <h3>1. خدمة المنتجات - Product Service</h3>
            <p>الوصول إلى WSDL: <a href='/ProductService.asmx?wsdl'>/ProductService.asmx?wsdl</a></p>
            <p>العمليات: الحصول على المنتجات، إضافة منتج، تحديث منتج، حذف منتج</p>
            <p>Operations: Get products, Add product, Update product, Delete product</p>
        </div>

        <div class='service'>
            <h3>2. خدمة سلة التسوق - Shopping Cart Service</h3>
            <p>الوصول إلى WSDL: <a href='/ShoppingCartService.asmx?wsdl'>/ShoppingCartService.asmx?wsdl</a></p>
            <p>العمليات: إضافة للسلة، إزالة من السلة، تحديث الكمية، إفراغ السلة</p>
            <p>Operations: Add to cart, Remove from cart, Update quantity, Clear cart</p>
        </div>

        <div class='service'>
            <h3>3. خدمة الطلبات - Order Service</h3>
            <p>الوصول إلى WSDL: <a href='/OrderService.asmx?wsdl'>/OrderService.asmx?wsdl</a></p>
            <p>العمليات: إنشاء طلب، الحصول على الطلبات، تحديث الحالة، إلغاء الطلب</p>
            <p>Operations: Create order, Get orders, Update status, Cancel order</p>
        </div>

        <h2>📚 كيفية الاستخدام - How to Use:</h2>
        <ol>
            <li>استخدم أي أداة لاختبار SOAP مثل SoapUI أو Postman</li>
            <li>Use any SOAP testing tool like SoapUI or Postman</li>
            <li>قم بتحميل ملف WSDL من الروابط أعلاه</li>
            <li>Load the WSDL file from the links above</li>
            <li>ابدأ بإرسال الطلبات إلى الخدمات</li>
            <li>Start sending requests to the services</li>
        </ol>

        <h2>🎓 للتعلم - For Learning:</h2>
        <p>جميع الأكواد تحتوي على تعليقات باللغة العربية والإنجليزية لتسهيل الفهم</p>
        <p>All code contains comments in both Arabic and English for easy understanding</p>
    </div>
</body>
</html>
", "text/html"));

Console.WriteLine("🚀 تم تشغيل خدمات SOAP للتجارة الإلكترونية - Ecommerce SOAP Services Started");
Console.WriteLine("📍 الخدمات متاحة على - Services available at:");
Console.WriteLine("   - خدمة المنتجات: /ProductService.asmx");
Console.WriteLine("   - خدمة سلة التسوق: /ShoppingCartService.asmx");
Console.WriteLine("   - خدمة الطلبات: /OrderService.asmx");

app.Run();

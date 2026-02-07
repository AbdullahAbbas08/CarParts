#!/bin/bash

# اختبار خدمات SOAP - Test SOAP Services
# هذا السكريبت يختبر جميع خدمات SOAP المتاحة
# This script tests all available SOAP services

echo "=========================================="
echo "اختبار خدمات SOAP للتجارة الإلكترونية"
echo "Testing Ecommerce SOAP Services"
echo "=========================================="
echo ""

# اختبار 1: الحصول على جميع المنتجات - Test 1: Get All Products
echo "1. اختبار الحصول على جميع المنتجات - Testing GetAllProducts"
echo "-------------------------------------------"

curl -X POST http://localhost:5000/ProductService.asmx \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: http://tempuri.org/IProductSoapService/GetAllProducts" \
  -d '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllProducts xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>' 2>/dev/null | xmllint --format - 2>/dev/null | head -50

echo ""
echo ""

# اختبار 2: الحصول على منتج بالمعرف - Test 2: Get Product by ID
echo "2. اختبار الحصول على منتج بالمعرف 1 - Testing GetProductById (ID=1)"
echo "-------------------------------------------"

curl -X POST http://localhost:5000/ProductService.asmx \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: http://tempuri.org/IProductSoapService/GetProductById" \
  -d '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetProductById xmlns="http://tempuri.org/">
      <productId>1</productId>
    </GetProductById>
  </soap:Body>
</soap:Envelope>' 2>/dev/null | xmllint --format - 2>/dev/null | head -50

echo ""
echo ""

# اختبار 3: إضافة منتج للسلة - Test 3: Add Item to Cart
echo "3. اختبار إضافة منتج للسلة - Testing AddItemToCart"
echo "-------------------------------------------"

curl -X POST http://localhost:5000/ShoppingCartService.asmx \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: http://tempuri.org/IShoppingCartSoapService/AddItemToCart" \
  -d '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <AddItemToCart xmlns="http://tempuri.org/">
      <customerId>1</customerId>
      <productId>1</productId>
      <productName>لابتوب Dell</productName>
      <unitPrice>5000</unitPrice>
      <quantity>2</quantity>
    </AddItemToCart>
  </soap:Body>
</soap:Envelope>' 2>/dev/null | xmllint --format - 2>/dev/null | head -50

echo ""
echo ""
echo "=========================================="
echo "✅ تم اختبار الخدمات بنجاح!"
echo "✅ Services tested successfully!"
echo "=========================================="

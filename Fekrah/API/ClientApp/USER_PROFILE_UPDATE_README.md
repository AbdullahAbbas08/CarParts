# User Data Update System - نظام تحديث بيانات المستخدم

## Overview - نظرة عامة

This system provides comprehensive user profile management with the ability to update various types of user data including personal information, business details, preferences, and media files.

هذا النظام يوفر إدارة شاملة لملف المستخدم الشخصي مع إمكانية تحديث أنواع مختلفة من بيانات المستخدم بما في ذلك المعلومات الشخصية وتفاصيل الأعمال والتفضيلات وملفات الوسائط.

## Features - المميزات

### ✅ Personal Information Updates - تحديث المعلومات الشخصية
- Name / الاسم
- Email / البريد الإلكتروني  
- Phone / رقم الهاتف
- WhatsApp / الواتساب
- Location / الموقع
- Website / الموقع الإلكتروني
- Description / الوصف

### ✅ Business Information - معلومات الأعمال
- Business Hours / ساعات العمل
- Specialties / التخصصات
- Social Media Links / روابط وسائل التواصل الاجتماعي
- Achievements / الإنجازات
- Rating and Statistics / التقييم والإحصائيات

### ✅ Media Management - إدارة الوسائط
- Profile Picture Upload / رفع صورة الملف الشخصي
- Cover Image Upload / رفع صورة الغلاف
- Image Preview / معاينة الصور
- Image Removal / إزالة الصور

### ✅ Privacy & Contact Preferences - تفضيلات الخصوصية والتواصل
- Profile Visibility Settings / إعدادات ظهور الملف الشخصي
- Contact Method Preferences / تفضيلات طرق التواصل
- Information Display Controls / التحكم في عرض المعلومات

### ✅ Data Validation - التحقق من البيانات
- Real-time Form Validation / التحقق من النموذج في الوقت الفعلي
- Email Format Validation / التحقق من صيغة البريد الإلكتروني
- Phone Number Validation / التحقق من رقم الهاتف
- Required Field Validation / التحقق من الحقول المطلوبة

## Architecture - الهيكل المعماري

### Services - الخدمات

#### UserProfileService
Located in: `src/app/Shared/Services/user-profile.service.ts`

**Methods:**
- `getCurrentProfile()` - Get current user profile
- `loadProfile()` - Load profile from server
- `updateProfile(request)` - Update user profile
- `uploadProfileImage(file)` - Upload profile image
- `clearProfile()` - Clear profile data
- `resetProfile()` - Reset to default values

#### UserService (existing)
Located in: `src/app/Shared/Services/user-data.service.ts`

Handles basic user authentication and session data.

### Models - النماذج

#### UserProfile Interface
Located in: `src/app/Shared/Models/user-profile.model.ts`

```typescript
interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  userType: 'customer' | 'merchant' | 'driver' | 'admin';
  // ... additional properties
}
```

### Components - المكونات

#### MerchantProfileComponent
- Displays user profile information
- Integrates with UserProfileService
- Shows real-time updates

#### EditProfileComponent
- Comprehensive profile editing form
- Image upload functionality
- Real-time validation
- Error handling

#### UserProfileDemoComponent
- Demonstration component
- Shows how to use the service
- Example implementation

## Usage Examples - أمثلة الاستخدام

### 1. Loading User Profile - تحميل الملف الشخصي

```typescript
constructor(private userProfileService: UserProfileService) {}

ngOnInit() {
  // Subscribe to profile changes
  this.userProfileService.currentProfile$.subscribe(profile => {
    this.userProfile = profile;
  });

  // Load profile
  this.userProfileService.loadProfile().subscribe({
    next: (profile) => console.log('Profile loaded:', profile),
    error: (error) => console.error('Error:', error)
  });
}
```

### 2. Updating Profile Data - تحديث بيانات الملف الشخصي

```typescript
updateUserProfile() {
  const updateRequest = {
    profile: {
      name: 'New Name',
      email: 'new@email.com',
      location: 'New Location'
    }
  };

  this.userProfileService.updateProfile(updateRequest).subscribe({
    next: (response) => {
      if (response.success) {
        console.log('Profile updated successfully');
      }
    },
    error: (error) => console.error('Update failed:', error)
  });
}
```

### 3. Uploading Profile Image - رفع صورة الملف الشخصي

```typescript
onImageSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.userProfileService.uploadProfileImage(file).subscribe({
      next: (imageUrl) => {
        // Update profile with new image URL
        this.updateProfile({ avatar: imageUrl });
      },
      error: (error) => console.error('Upload failed:', error)
    });
  }
}
```

## Form Integration - تكامل النماذج

### Reactive Forms Setup - إعداد النماذج التفاعلية

```typescript
this.editForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required]],
  // ... other fields
});
```

### Real-time Validation - التحقق في الوقت الفعلي

```typescript
isFieldInvalid(fieldName: string): boolean {
  const field = this.editForm.get(fieldName);
  return !!(field && field.invalid && field.touched);
}

getFieldError(fieldName: string): string {
  const field = this.editForm.get(fieldName);
  if (field?.errors) {
    if (field.errors['required']) return 'هذا الحقل مطلوب';
    if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
    // ... other validations
  }
  return '';
}
```

## Installation & Setup - التثبيت والإعداد

### 1. Dependencies - التبعيات

Ensure these are installed in your Angular project:

```bash
npm install @angular/forms @angular/common @angular/common/http rxjs
```

### 2. Module Imports - استيرادات الوحدات

Add to your module:

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    // ... other imports
  ]
})
```

### 3. Service Registration - تسجيل الخدمات

Services are provided in root scope by default.

## File Structure - هيكل الملفات

```
src/app/
├── Shared/
│   ├── Models/
│   │   └── user-profile.model.ts
│   └── Services/
│       ├── user-profile.service.ts
│       └── user-data.service.ts
├── merchant-profile/
│   ├── merchant-profile.component.ts/html/scss
│   └── edit-profile/
│       └── edit-profile.component.ts/html/css
└── user-profile-demo/
    └── user-profile-demo.component.ts
```

## API Integration - تكامل واجهة برمجة التطبيقات

### Expected API Endpoints - نقاط النهاية المتوقعة لواجهة برمجة التطبيقات

```
GET /api/user-profile - Get user profile
PUT /api/user-profile - Update user profile
POST /api/user-profile/upload-image - Upload profile image
```

### Sample API Response - نموذج استجابة واجهة برمجة التطبيقات

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "updatedProfile": {
    "id": "1",
    "name": "Updated Name",
    "email": "updated@email.com",
    "lastUpdated": "2024-01-01T10:00:00Z"
  }
}
```

## Error Handling - معالجة الأخطاء

### Validation Errors - أخطاء التحقق

```typescript
interface ValidationError {
  field: string;
  message: string;
}
```

### Error Display - عرض الأخطاء

```html
<div class="error-alert" *ngIf="updateErrors.length > 0">
  <h4>يرجى تصحيح الأخطاء التالية:</h4>
  <ul>
    <li *ngFor="let error of updateErrors">{{ error }}</li>
  </ul>
</div>
```

## Security Considerations - اعتبارات الأمان

1. **Input Validation** - التحقق من المدخلات
2. **File Upload Security** - أمان رفع الملفات
3. **Authentication** - المصادقة
4. **Authorization** - التخويل
5. **Data Sanitization** - تعقيم البيانات

## Testing - الاختبار

### Demo Component - مكون التوضيح

Use the `UserProfileDemoComponent` to test the functionality:

1. Navigate to the demo component
2. Click "تحميل البيانات" to load profile
3. Click "تحديث بيانات تجريبية" to test updates
4. Click "إعادة تعيين" to reset data

### Manual Testing - الاختبار اليدوي

1. Go to `/merchant-profile`
2. Click the edit button (floating action button)
3. Update various fields
4. Upload images
5. Save changes
6. Verify updates in the profile view

## Future Enhancements - التحسينات المستقبلية

- [ ] Batch updates for multiple fields
- [ ] Profile change history
- [ ] Advanced image editing
- [ ] Social media integration
- [ ] Backup and restore functionality
- [ ] Multi-language support for profile data
- [ ] Real-time synchronization across devices

## Support - الدعم

For questions or issues, please refer to the development team or create an issue in the project repository.

للأسئلة أو المشاكل، يرجى الرجوع إلى فريق التطوير أو إنشاء مشكلة في مستودع المشروع.

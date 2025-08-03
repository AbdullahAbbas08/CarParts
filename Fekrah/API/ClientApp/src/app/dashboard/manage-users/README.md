# User Management Module

This module provides comprehensive user management functionality for the admin dashboard.

## Features

### ✨ Core Functionality
- **Create Users**: Add new users with full validation
- **Edit Users**: Update existing user information
- **Delete Users**: Remove users with confirmation dialog
- **View Users**: Display all users in a beautiful table format

### 🔍 Search & Filter
- **Real-time Search**: Search by username, full name, or email
- **Filter by User Type**: Admin, Client, Merchant, Shipping Company
- **Filter by Status**: Active or Inactive users
- **Pagination**: Efficient pagination with customizable page size

### 📊 Statistics
- **User Count**: Total number of users
- **Active Users**: Count of active users
- **User Types**: Count by user type (Admin, Client, Merchant, etc.)
- **Real-time Updates**: Statistics update automatically

### 🎨 UI/UX Features
- **Modern Arabic Design**: RTL support with beautiful gradients
- **Responsive Design**: Works on all device sizes
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: Success/error messages
- **Form Validation**: Client-side validation with Arabic messages

### 📁 Export Functionality
- **CSV Export**: Export filtered user data to CSV
- **Printable View**: Print-friendly table view

## API Integration

The module uses the following SwaggerClient API endpoints:

- `apiAccountGetAllGet()` - Get all users with pagination and search
- `apiAccountInsertPost()` - Create new user
- `apiAccountUpdatePost()` - Update existing user
- `apiAccountDeletePost()` - Delete user
- `apiAccountGetDetailsGet()` - Get user details by ID

## Components

### ManageUsersComponent
Main component that handles all user management operations.

### UserManagementService
Service that provides API integration and data management.

## Routing

The module is accessible via `/admin/users` route and integrates with the main admin dashboard.

## Usage

1. Navigate to the admin dashboard
2. Click on "إدارة المستخدمين" (User Management) card
3. Use the interface to manage users:
   - Search and filter users
   - Create new users with the "إضافة مستخدم جديد" button
   - Edit users by clicking the edit icon
   - Delete users by clicking the delete icon
   - Export data using the "تصدير البيانات" button

## Form Fields

### User Creation/Edit Form
- **Username** (required): Unique username (min 3 characters)
- **Full Name** (required): User's full name (min 2 characters)
- **Email** (required): Valid email address
- **Phone Number** (required): Contact phone number
- **Password** (required for new users): Secure password (min 6 characters)
- **National ID** (optional): National identification number
- **User Type** (required): Admin, Client, Merchant, or Shipping Company
- **Active Status**: Whether the user is active or not
- **Address** (optional): User's address

## Validation

All forms include comprehensive validation with Arabic error messages:
- Required field validation
- Email format validation
- Minimum length validation
- Real-time validation feedback

## Responsive Design

The module is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (767px and below)

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## Performance

- Lazy loading for optimal performance
- Debounced search (300ms delay)
- Efficient pagination
- Optimized API calls
- Memory leak prevention with proper subscription management

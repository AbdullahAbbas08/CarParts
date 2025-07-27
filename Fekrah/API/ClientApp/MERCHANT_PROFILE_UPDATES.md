# Merchant Profile Component Updates

This document outlines the changes made to align the `MerchantProfileComponent` with the backend `Merchant.cs` class.

## Changes Made

### 1. New Merchant Model (`merchant.model.ts`)
- Created a TypeScript interface that matches the C# `Merchant` class
- Includes all properties from the backend model:
  - `id`, `shopName`, `logo`, `slug`
  - `description`, `shortDescription`
  - `address`, `latitude`, `longitude`
  - `rating`, `ratingCount`
  - `governorateId`, `cityId`, `isFavoriteMerchant`
  - `commercialRegistrationNumber`, `commercialRegistrationImage`
  - `nationalIdNumber`, `nationalIdImage`
  - Navigation properties: `city`, `governorate`, `sellerCategories`, `parts`, `members`

### 2. Merchant Service (`merchant.service.ts`)
- Created a service to handle API calls for merchant operations
- Includes methods for:
  - `getMerchant(id)` - Get specific merchant by ID
  - `getCurrentMerchant()` - Get current logged-in merchant
  - `updateMerchant()` - Update merchant data
  - `uploadLogo()`, `uploadCommercialRegistration()`, `uploadNationalId()` - File uploads
  - `addToFavorites()`, `removeFromFavorites()` - Favorite operations

### 3. Updated MerchantProfileComponent
- Changed from using `UserProfileService` to `MerchantService`
- Updated component to load merchant data from API
- Added route parameter handling to load specific merchant by ID
- Updated data mapping to align with backend model structure
- Enhanced `updateMerchantData()` method to properly map all backend properties
- Improved error handling and loading states

### 4. Key Features Added
- Support for loading merchant by ID from route parameters
- Proper handling of all backend model properties
- Type-safe implementation with proper TypeScript interfaces
- Error handling for API calls
- Loading states for better UX

## Backend Model Alignment

The component now properly reflects the backend `Merchant` class structure:

### Core Properties
- ✅ `ShopName` → `shopName`
- ✅ `Logo` → `logo`
- ✅ `Slug` → `slug`
- ✅ `Description` → `description`
- ✅ `ShortDescription` → `shortDescription`
- ✅ `Address` → `address`
- ✅ `Latitude` → `latitude`
- ✅ `Longitude` → `longitude`
- ✅ `Rating` → `rating`
- ✅ `RatingCount` → `ratingCount`
- ✅ `IsFavoriteMerchant` → `isFavoriteMerchant`

### Location Properties
- ✅ `GovernorateId` → `governorateId`
- ✅ `CityId` → `cityId`
- ✅ `City` navigation → `city`
- ✅ `Governorate` navigation → `governorate`

### Document Properties
- ✅ `CommercialRegistrationNumber` → `commercialRegistrationNumber`
- ✅ `CommercialRegistrationImage` → `commercialRegistrationImage`
- ✅ `NationalIdNumber` → `nationalIdNumber`
- ✅ `NationalIdImage` → `nationalIdImage`

### Collection Properties
- ✅ `Parts` → `parts`
- ✅ `SellerCategories` → `sellerCategories`
- ✅ `Members` → `members`

## Usage

The component can now be used in two ways:

1. **View Current Merchant Profile**: Navigate to `/merchant-profile`
2. **View Specific Merchant Profile**: Navigate to `/merchant-profile/:id`

The component will automatically detect if an ID is provided in the route and load the appropriate merchant data.

## Future Enhancements

Consider adding these backend properties to enhance the model:
- `isVerified` - Merchant verification status
- `isPremium` - Premium membership status
- Contact information (email, phone, whatsapp)
- Social media links
- Business hours
- Website URL

These properties can be added to the backend model and will be automatically reflected in the frontend component.

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  description?: string;
  userType: 'customer' | 'merchant' | 'driver' | 'admin';
  isVerified?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  joinDate?: string;
  lastUpdated?: string;
  
  // Merchant specific fields
  businessName?: string;
  businessHours?: BusinessHours[];
  specialties?: string[];
  rating?: number;
  totalSales?: number;
  totalOrders?: number;
  productsCount?: number;
  responseTime?: string;
  socialMedia?: SocialMedia;
  achievements?: Achievement[];
  
  // Contact preferences
  preferredContactMethod?: 'phone' | 'whatsapp' | 'email';
  availableForContact?: boolean;
  
  // Privacy settings
  profileVisibility?: 'public' | 'private' | 'contacts-only';
  showPhone?: boolean;
  showEmail?: boolean;
  showLocation?: boolean;
}

export interface BusinessHours {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface Achievement {
  title: string;
  year: string;
  icon: string;
  description?: string;
}

export interface UpdateProfileRequest {
  profile: Partial<UserProfile>;
  avatar?: File;
  coverImage?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  updatedProfile?: UserProfile;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

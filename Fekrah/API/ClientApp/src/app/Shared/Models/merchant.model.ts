export interface Merchant {
  id: number;
  shopName: string;
  logo?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  ratingCount: number;
  governorateId?: number;
  cityId?: number;
  isFavoriteMerchant: boolean;
  commercialRegistrationNumber?: string;
  commercialRegistrationImage?: string;
  nationalIdNumber?: string;
  nationalIdImage?: string;
  
  // Navigation properties
  city?: City;
  governorate?: Governorate;
  members?: User[];
  parts?: Part[];
  sellerCategories?: SellerCategory[];
  
  // Audit properties
  createdByUserId?: number;
  createdOn?: Date;
  updatedBy?: number;
  updatedOn?: Date;
  deletedBy?: number;
  deletedOn?: Date;
}

export interface City {
  id: number;
  name: string;
  governorateId: number;
}

export interface Governorate {
  id: number;
  name: string;
  cities?: City[];
}

export interface SellerCategory {
  id: number;
  name: string;
  sellerId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Part {
  id: number;
  name: string;
  description?: string;
  price: number;
  merchantId: number;
}

// stores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { DataSourceResultOfSellerDto, SwaggerClient } from './Swagger/SwaggerClient.service';

export interface Store {
  id: number;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  logo: string;
  rating: number;
  reviewsCount: number;
  location: string;
  arabicLocation: string;
  phone: string;
  email: string;
  website: string;
  isVerified: boolean;
  isFeatured: boolean;
  specialties: string[];
  arabicSpecialties: string[];
  openingHours: string;
  arabicOpeningHours: string;
  productsCount: number;
  establishedYear: number;
  tags: string[];
  arabicTags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  shopName?:string
  phoneNumber?: string;
}

export interface StoreSearchParams {
  search?: string;
  category?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
  verified?: boolean;
    pageSize?:number;
  searchTerm?:string;
}

export interface StoreSearchResponse {
  stores: any[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private readonly apiUrl = '/api/stores'; // استبدل بـ URL الفعلي للـ API
  private storesSubject = new BehaviorSubject<Store[]>([]);
  public stores$ = this.storesSubject.asObservable();

  constructor(private http: HttpClient, private sellersSwagger: SwaggerClient) {
    this.loadInitialStores();
  }

  /**
   * تحميل جميع المتاجر
   */
getAllStores(params?: StoreSearchParams): Observable<StoreSearchResponse> {
  // if (this.isUsingMockData()) {
  //   return this.getMockStores(params);
  // }

  return this.sellersSwagger.apiSellersGetAllGet(
    params?.pageSize || 10,
    params?.page || 1,
    params?.searchTerm || ''
  ).pipe(
    map((response: DataSourceResultOfSellerDto): StoreSearchResponse => {
      const total = response.count || 0;
      const pageSize = params?.pageSize || 10;
      const currentPage = params?.page || 1;
      return {
        stores: response.data || [],
        total,
        page: currentPage,
        totalPages: Math.ceil(total / pageSize),
        hasNext: currentPage * pageSize < total,
        hasPrevious: currentPage > 1
      };
    }),

    catchError(error => {
      console.error('Error from Swagger API:', error);
      return this.getMockStores(params);
    })
  );
}

  /**
   * البحث عن المتاجر
   */
  searchStores(searchTerm: string, filters?: Partial<StoreSearchParams>): Observable<StoreSearchResponse> {
    const params: StoreSearchParams = {
      search: searchTerm,
      ...filters
    };

    return this.getAllStores(params);
  }

  /**
   * الحصول على متجر بواسطة المعرف
   */
  getStoreById(id: number): Observable<Store | null> {
    if (this.isUsingMockData()) {
      return this.getMockStores().pipe(
        map(response => response.stores.find(store => store.id === id) || null)
      );
    }

    return this.http.get<Store>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching store:', error);
          return of(null);
        })
      );
  }

  /**
   * الحصول على المتاجر المميزة
   */
  getFeaturedStores(limit: number = 6): Observable<Store[]> {
    const params: StoreSearchParams = {
      featured: true,
      limit: limit,
      sortBy: 'rating',
      sortOrder: 'desc',
      page:1,
      pageSize:limit
    };
    return this.getAllStores(params).pipe(
      map(response => response.stores)
    );
  }
  /**
   * الحصول على المتاجر الأحدث
   */
  getNewestStores(limit: number = 6): Observable<Store[]> {
    const params: StoreSearchParams = {
      limit: limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    return this.getAllStores(params).pipe(
      map(response => response.stores)
    );
  }

  /**
   * الحصول على المتاجر حسب الفئة
   */
  getStoresByCategory(category: string): Observable<Store[]> {
    const params: StoreSearchParams = {
      category: category,
      sortBy: 'rating',
      sortOrder: 'desc'
    };

    return this.getAllStores(params).pipe(
      map(response => response.stores)
    );
  }

  /**
   * الحصول على إحصائيات المتاجر
   */
  getStoresStats(): Observable<any> {
    if (this.isUsingMockData()) {
      return this.getMockStores().pipe(
        map(response => ({
          totalStores: response.total,
          verifiedStores: response.stores.filter(s => s.isVerified).length,
          featuredStores: response.stores.filter(s => s.isFeatured).length,
          averageRating: response.stores.reduce((sum, s) => sum + s.rating, 0) / response.stores.length
        }))
      );
    }

    return this.http.get<any>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(error => {
          console.error('Error fetching stats:', error);
          return of({
            totalStores: 0,
            verifiedStores: 0,
            featuredStores: 0,
            averageRating: 0
          });
        })
      );
  }

  /**
   * تحديث تقييم المتجر
   */
  rateStore(storeId: number, rating: number, review?: string): Observable<boolean> {
    if (this.isUsingMockData()) {
      // محاكاة تحديث التقييم
      return of(true).pipe(delay(1000));
    }

    const ratingData = { rating, review };
    return this.http.post<any>(`${this.apiUrl}/${storeId}/rate`, ratingData)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error rating store:', error);
          return of(false);
        })
      );
  }

  /**
   * إضافة متجر إلى المفضلة
   */
  addToFavorites(storeId: number): Observable<boolean> {
    if (this.isUsingMockData()) {
      // حفظ في التخزين المحلي
      const favorites = this.getFavoriteStoreIds();
      if (!favorites.includes(storeId)) {
        favorites.push(storeId);
        localStorage.setItem('favoriteStores', JSON.stringify(favorites));
      }
      return of(true);
    }

    return this.http.post<any>(`${this.apiUrl}/${storeId}/favorite`, {})
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error adding to favorites:', error);
          return of(false);
        })
      );
  }

  /**
   * إزالة متجر من المفضلة
   */
  removeFromFavorites(storeId: number): Observable<boolean> {
    if (this.isUsingMockData()) {
      const favorites = this.getFavoriteStoreIds();
      const index = favorites.indexOf(storeId);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favoriteStores', JSON.stringify(favorites));
      }
      return of(true);
    }

    return this.http.delete<any>(`${this.apiUrl}/${storeId}/favorite`)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error removing from favorites:', error);
          return of(false);
        })
      );
  }

  /**
   * الحصول على المتاجر المفضلة
   */
  getFavoriteStores(): Observable<Store[]> {
    const favoriteIds = this.getFavoriteStoreIds();
    
    if (favoriteIds.length === 0) {
      return of([]);
    }

    return this.getAllStores().pipe(
      map(response => response.stores.filter(store => favoriteIds.includes(store.id)))
    );
  }

  /**
   * فحص ما إذا كان المتجر في المفضلة
   */
  isStoreFavorite(storeId: number): boolean {
    const favorites = this.getFavoriteStoreIds();
    return favorites.includes(storeId);
  }

  /**
   * الإبلاغ عن متجر
   */
  reportStore(storeId: number, reason: string, description?: string): Observable<boolean> {
    const reportData = { reason, description };
    
    if (this.isUsingMockData()) {
      console.log('Store reported:', storeId, reportData);
      return of(true).pipe(delay(1000));
    }

    return this.http.post<any>(`${this.apiUrl}/${storeId}/report`, reportData)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error reporting store:', error);
          return of(false);
        })
      );
  }

  // الطرق الخاصة

  private loadInitialStores(): void {
    this.getAllStores({ limit: 50 }).subscribe(response => {
      this.storesSubject.next(response.stores);
    });
  }

  private getFavoriteStoreIds(): number[] {
    try {
      const stored = localStorage.getItem('favoriteStores');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private isUsingMockData(): boolean {
    // يمكنك تغيير هذا للتحكم في استخدام البيانات الوهمية أو الحقيقية
    return true; // قم بتغيير هذا إلى false عند توفر API حقيقي
  }

  private getMockStores(params?: StoreSearchParams): Observable<StoreSearchResponse> {
    const mockStores: Store[] = [
      {
        id: 1,
        name: 'AutoZone Egypt',
        arabicName: 'أوتوزون مصر',
        description: 'Leading auto parts retailer with comprehensive inventory',
        arabicDescription: 'أكبر متجر لقطع غيار السيارات مع مخزون شامل',
        logo: 'assets/images/image_100_100.png',
        rating: 4.5,
        reviewsCount: 250,
        location: 'Cairo, Egypt',
        arabicLocation: 'القاهرة، مصر',
        phone: '+20123456789',
        email: 'info@autozone-egypt.com',
        website: 'www.autozone-egypt.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Engine Parts', 'Brakes', 'Electrical', 'Oil & Filters'],
        arabicSpecialties: ['قطع المحرك', 'الفرامل', 'الكهرباء', 'الزيوت والفلاتر'],
        openingHours: '9:00 AM - 10:00 PM',
        arabicOpeningHours: '9:00 ص - 10:00 م',
        productsCount: 1500,
        establishedYear: 2010,
        tags: ['engine', 'brakes', 'electrical', 'filters'],
        arabicTags: ['محرك', 'فرامل', 'كهرباء', 'فلاتر'],
        createdAt: new Date('2010-01-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 2,
        name: 'Spare Parts Pro',
        arabicName: 'برو قطع الغيار',
        description: 'Quality spare parts specialist for all car brands',
        arabicDescription: 'متخصص في قطع الغيار عالية الجودة لجميع ماركات السيارات',
        logo: 'assets/images/image_100_100.png',
        rating: 4.2,
        reviewsCount: 180,
        location: 'Alexandria, Egypt',
        arabicLocation: 'الإسكندرية، مصر',
        phone: '+20123456790',
        email: 'contact@sparepartspr.com',
        website: 'www.sparepartspr.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Tires', 'Suspension', 'Body Parts', 'Accessories'],
        arabicSpecialties: ['الإطارات', 'نظام التعليق', 'قطع الهيكل', 'الإكسسوارات'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 800,
        establishedYear: 2015,
        tags: ['tires', 'body', 'accessories'],
        arabicTags: ['إطارات', 'هيكل', 'إكسسوارات'],
        createdAt: new Date('2015-03-20'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: 3,
        name: 'Motor World',
        arabicName: 'عالم الموتور',
        description: 'Complete automotive solutions and import services',
        arabicDescription: 'حلول شاملة للسيارات وخدمات الاستيراد',
        logo: 'assets/images/image_100_100.png',
        rating: 4.7,
        reviewsCount: 320,
        location: 'Giza, Egypt',
        arabicLocation: 'الجيزة، مصر',
        phone: '+20123456791',
        email: 'info@motorworld.com',
        website: 'www.motorworld.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['All Categories', 'Import Service', 'Original Parts'],
        arabicSpecialties: ['جميع الفئات', 'خدمة الاستيراد', 'قطع أصلية'],
        openingHours: '7:00 AM - 11:00 PM',
        arabicOpeningHours: '7:00 ص - 11:00 م',
        productsCount: 2500,
        establishedYear: 2008,
        tags: ['all', 'import', 'original'],
        arabicTags: ['جميع', 'استيراد', 'أصلي'],
        createdAt: new Date('2008-06-10'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: 4,
        name: 'Brake Masters',
        arabicName: 'خبراء الفرامل',
        description: 'Brake system specialists with expert installation',
        arabicDescription: 'متخصصون في أنظمة الفرامل مع التركيب الاحترافي',
        logo: 'assets/images/image_100_100.png',
        rating: 4.3,
        reviewsCount: 95,
        location: 'Mansoura, Egypt',
        arabicLocation: 'المنصورة، مصر',
        phone: '+20123456792',
        email: 'sales@brakemasters.com',
        website: 'www.brakemasters.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Installation'],
        arabicSpecialties: ['تيل الفرامل', 'أقراص الفرامل', 'زيت الفرامل', 'التركيب'],
        openingHours: '9:00 AM - 8:00 PM',
        arabicOpeningHours: '9:00 ص - 8:00 م',
        productsCount: 150,
        establishedYear: 2018,
        tags: ['brakes'],
        arabicTags: ['فرامل'],
        createdAt: new Date('2018-09-12'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: 5,
        name: 'ElectroAuto',
        arabicName: 'الكترو أوتو',
        description: 'Automotive electrical specialist and repair services',
        arabicDescription: 'متخصص في كهرباء السيارات وخدمات الإصلاح',
        logo: 'assets/images/image_100_100.png',
        rating: 4.1,
        reviewsCount: 140,
        location: 'Aswan, Egypt',
        arabicLocation: 'أسوان، مصر',
        phone: '+20123456793',
        email: 'info@electroauto.com',
        website: 'www.electroauto.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Batteries', 'Alternators', 'Starters', 'Wiring'],
        arabicSpecialties: ['البطاريات', 'الدينامو', 'المارش', 'الأسلاك'],
        openingHours: '8:30 AM - 9:30 PM',
        arabicOpeningHours: '8:30 ص - 9:30 م',
        productsCount: 450,
        establishedYear: 2012,
        tags: ['electrical'],
        arabicTags: ['كهرباء'],
        createdAt: new Date('2012-11-08'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: 6,
        name: 'Tire Kingdom',
        arabicName: 'مملكة الإطارات',
        description: 'Premium tire retailer with professional services',
        arabicDescription: 'متجر الإطارات المميز مع الخدمات الاحترافية',
        logo: 'assets/images/image_100_100.png',
        rating: 4.6,
        reviewsCount: 220,
        location: 'Luxor, Egypt',
        arabicLocation: 'الأقصر، مصر',
        phone: '+20123456794',
        email: 'sales@tirekingdom.com',
        website: 'www.tirekingdom.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Car Tires', 'Truck Tires', 'Tire Service', 'Balancing'],
        arabicSpecialties: ['إطارات السيارات', 'إطارات الشاحنات', 'خدمة الإطارات', 'الترصيص'],
        openingHours: '7:00 AM - 10:00 PM',
        arabicOpeningHours: '7:00 ص - 10:00 م',
        productsCount: 600,
        establishedYear: 2014,
        tags: ['tires'],
        arabicTags: ['إطارات'],
        createdAt: new Date('2014-04-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 7,
        name: 'Engine Expert',
        arabicName: 'خبير المحرك',
        description: 'Engine parts and performance specialists',
        arabicDescription: 'متخصص في قطع المحرك وتحسين الأداء',
        logo: 'assets/images/image_100_100.png',
        rating: 4.4,
        reviewsCount: 165,
        location: 'Port Said, Egypt',
        arabicLocation: 'بورسعيد، مصر',
        phone: '+20123456795',
        email: 'info@engineexpert.com',
        website: 'www.engineexpert.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Engine Rebuild', 'Performance Parts', 'Turbo', 'Exhaust'],
        arabicSpecialties: ['إعادة بناء المحرك', 'قطع الأداء', 'التيربو', 'العادم'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 750,
        establishedYear: 2016,
        tags: ['engine', 'performance'],
        arabicTags: ['محرك', 'أداء'],
        createdAt: new Date('2016-02-20'),
        updatedAt: new Date('2024-11-27')
      },
      {
        id: 8,
        name: 'Body Shop Pro',
        arabicName: 'محترف الهيكل',
        description: 'Body parts and paint services specialist',
        arabicDescription: 'متخصص في قطع الهيكل وخدمات الدهان',
        logo: 'assets/images/image_100_100.png',
        rating: 4.0,
        reviewsCount: 88,
        location: 'Suez, Egypt',
        arabicLocation: 'السويس، مصر',
        phone: '+20123456796',
        email: 'contact@bodyshoppro.com',
        website: 'www.bodyshoppro.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Body Panels', 'Lights', 'Mirrors', 'Paint Services'],
        arabicSpecialties: ['ألواح الهيكل', 'الأضواء', 'المرايا', 'خدمات الدهان'],
        openingHours: '9:00 AM - 7:00 PM',
        arabicOpeningHours: '9:00 ص - 7:00 م',
        productsCount: 320,
        establishedYear: 2019,
        tags: ['body', 'lights'],
        arabicTags: ['هيكل', 'إضاءة'],
        createdAt: new Date('2019-07-12'),
        updatedAt: new Date('2024-11-26')
      },
      {
        id: 1,
        name: 'AutoZone Egypt',
        arabicName: 'أوتوزون مصر',
        description: 'Leading auto parts retailer with comprehensive inventory',
        arabicDescription: 'أكبر متجر لقطع غيار السيارات مع مخزون شامل',
        logo: 'assets/images/image_100_100.png',
        rating: 4.5,
        reviewsCount: 250,
        location: 'Cairo, Egypt',
        arabicLocation: 'القاهرة، مصر',
        phone: '+20123456789',
        email: 'info@autozone-egypt.com',
        website: 'www.autozone-egypt.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Engine Parts', 'Brakes', 'Electrical', 'Oil & Filters'],
        arabicSpecialties: ['قطع المحرك', 'الفرامل', 'الكهرباء', 'الزيوت والفلاتر'],
        openingHours: '9:00 AM - 10:00 PM',
        arabicOpeningHours: '9:00 ص - 10:00 م',
        productsCount: 1500,
        establishedYear: 2010,
        tags: ['engine', 'brakes', 'electrical', 'filters'],
        arabicTags: ['محرك', 'فرامل', 'كهرباء', 'فلاتر'],
        createdAt: new Date('2010-01-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 2,
        name: 'Spare Parts Pro',
        arabicName: 'برو قطع الغيار',
        description: 'Quality spare parts specialist for all car brands',
        arabicDescription: 'متخصص في قطع الغيار عالية الجودة لجميع ماركات السيارات',
        logo: 'assets/images/image_100_100.png',
        rating: 4.2,
        reviewsCount: 180,
        location: 'Alexandria, Egypt',
        arabicLocation: 'الإسكندرية، مصر',
        phone: '+20123456790',
        email: 'contact@sparepartspr.com',
        website: 'www.sparepartspr.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Tires', 'Suspension', 'Body Parts', 'Accessories'],
        arabicSpecialties: ['الإطارات', 'نظام التعليق', 'قطع الهيكل', 'الإكسسوارات'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 800,
        establishedYear: 2015,
        tags: ['tires', 'body', 'accessories'],
        arabicTags: ['إطارات', 'هيكل', 'إكسسوارات'],
        createdAt: new Date('2015-03-20'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: 3,
        name: 'Motor World',
        arabicName: 'عالم الموتور',
        description: 'Complete automotive solutions and import services',
        arabicDescription: 'حلول شاملة للسيارات وخدمات الاستيراد',
        logo: 'assets/images/image_100_100.png',
        rating: 4.7,
        reviewsCount: 320,
        location: 'Giza, Egypt',
        arabicLocation: 'الجيزة، مصر',
        phone: '+20123456791',
        email: 'info@motorworld.com',
        website: 'www.motorworld.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['All Categories', 'Import Service', 'Original Parts'],
        arabicSpecialties: ['جميع الفئات', 'خدمة الاستيراد', 'قطع أصلية'],
        openingHours: '7:00 AM - 11:00 PM',
        arabicOpeningHours: '7:00 ص - 11:00 م',
        productsCount: 2500,
        establishedYear: 2008,
        tags: ['all', 'import', 'original'],
        arabicTags: ['جميع', 'استيراد', 'أصلي'],
        createdAt: new Date('2008-06-10'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: 4,
        name: 'Brake Masters',
        arabicName: 'خبراء الفرامل',
        description: 'Brake system specialists with expert installation',
        arabicDescription: 'متخصصون في أنظمة الفرامل مع التركيب الاحترافي',
        logo: 'assets/images/image_100_100.png',
        rating: 4.3,
        reviewsCount: 95,
        location: 'Mansoura, Egypt',
        arabicLocation: 'المنصورة، مصر',
        phone: '+20123456792',
        email: 'sales@brakemasters.com',
        website: 'www.brakemasters.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Installation'],
        arabicSpecialties: ['تيل الفرامل', 'أقراص الفرامل', 'زيت الفرامل', 'التركيب'],
        openingHours: '9:00 AM - 8:00 PM',
        arabicOpeningHours: '9:00 ص - 8:00 م',
        productsCount: 150,
        establishedYear: 2018,
        tags: ['brakes'],
        arabicTags: ['فرامل'],
        createdAt: new Date('2018-09-12'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: 5,
        name: 'ElectroAuto',
        arabicName: 'الكترو أوتو',
        description: 'Automotive electrical specialist and repair services',
        arabicDescription: 'متخصص في كهرباء السيارات وخدمات الإصلاح',
        logo: 'assets/images/image_100_100.png',
        rating: 4.1,
        reviewsCount: 140,
        location: 'Aswan, Egypt',
        arabicLocation: 'أسوان، مصر',
        phone: '+20123456793',
        email: 'info@electroauto.com',
        website: 'www.electroauto.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Batteries', 'Alternators', 'Starters', 'Wiring'],
        arabicSpecialties: ['البطاريات', 'الدينامو', 'المارش', 'الأسلاك'],
        openingHours: '8:30 AM - 9:30 PM',
        arabicOpeningHours: '8:30 ص - 9:30 م',
        productsCount: 450,
        establishedYear: 2012,
        tags: ['electrical'],
        arabicTags: ['كهرباء'],
        createdAt: new Date('2012-11-08'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: 6,
        name: 'Tire Kingdom',
        arabicName: 'مملكة الإطارات',
        description: 'Premium tire retailer with professional services',
        arabicDescription: 'متجر الإطارات المميز مع الخدمات الاحترافية',
        logo: 'assets/images/image_100_100.png',
        rating: 4.6,
        reviewsCount: 220,
        location: 'Luxor, Egypt',
        arabicLocation: 'الأقصر، مصر',
        phone: '+20123456794',
        email: 'sales@tirekingdom.com',
        website: 'www.tirekingdom.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Car Tires', 'Truck Tires', 'Tire Service', 'Balancing'],
        arabicSpecialties: ['إطارات السيارات', 'إطارات الشاحنات', 'خدمة الإطارات', 'الترصيص'],
        openingHours: '7:00 AM - 10:00 PM',
        arabicOpeningHours: '7:00 ص - 10:00 م',
        productsCount: 600,
        establishedYear: 2014,
        tags: ['tires'],
        arabicTags: ['إطارات'],
        createdAt: new Date('2014-04-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 7,
        name: 'Engine Expert',
        arabicName: 'خبير المحرك',
        description: 'Engine parts and performance specialists',
        arabicDescription: 'متخصص في قطع المحرك وتحسين الأداء',
        logo: 'assets/images/image_100_100.png',
        rating: 4.4,
        reviewsCount: 165,
        location: 'Port Said, Egypt',
        arabicLocation: 'بورسعيد، مصر',
        phone: '+20123456795',
        email: 'info@engineexpert.com',
        website: 'www.engineexpert.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Engine Rebuild', 'Performance Parts', 'Turbo', 'Exhaust'],
        arabicSpecialties: ['إعادة بناء المحرك', 'قطع الأداء', 'التيربو', 'العادم'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 750,
        establishedYear: 2016,
        tags: ['engine', 'performance'],
        arabicTags: ['محرك', 'أداء'],
        createdAt: new Date('2016-02-20'),
        updatedAt: new Date('2024-11-27')
      },
      {
        id: 8,
        name: 'Body Shop Pro',
        arabicName: 'محترف الهيكل',
        description: 'Body parts and paint services specialist',
        arabicDescription: 'متخصص في قطع الهيكل وخدمات الدهان',
        logo: 'assets/images/image_100_100.png',
        rating: 4.0,
        reviewsCount: 88,
        location: 'Suez, Egypt',
        arabicLocation: 'السويس، مصر',
        phone: '+20123456796',
        email: 'contact@bodyshoppro.com',
        website: 'www.bodyshoppro.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Body Panels', 'Lights', 'Mirrors', 'Paint Services'],
        arabicSpecialties: ['ألواح الهيكل', 'الأضواء', 'المرايا', 'خدمات الدهان'],
        openingHours: '9:00 AM - 7:00 PM',
        arabicOpeningHours: '9:00 ص - 7:00 م',
        productsCount: 320,
        establishedYear: 2019,
        tags: ['body', 'lights'],
        arabicTags: ['هيكل', 'إضاءة'],
        createdAt: new Date('2019-07-12'),
        updatedAt: new Date('2024-11-26')
      },
      {
        id: 1,
        name: 'AutoZone Egypt',
        arabicName: 'أوتوزون مصر',
        description: 'Leading auto parts retailer with comprehensive inventory',
        arabicDescription: 'أكبر متجر لقطع غيار السيارات مع مخزون شامل',
        logo: 'assets/images/image_100_100.png',
        rating: 4.5,
        reviewsCount: 250,
        location: 'Cairo, Egypt',
        arabicLocation: 'القاهرة، مصر',
        phone: '+20123456789',
        email: 'info@autozone-egypt.com',
        website: 'www.autozone-egypt.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Engine Parts', 'Brakes', 'Electrical', 'Oil & Filters'],
        arabicSpecialties: ['قطع المحرك', 'الفرامل', 'الكهرباء', 'الزيوت والفلاتر'],
        openingHours: '9:00 AM - 10:00 PM',
        arabicOpeningHours: '9:00 ص - 10:00 م',
        productsCount: 1500,
        establishedYear: 2010,
        tags: ['engine', 'brakes', 'electrical', 'filters'],
        arabicTags: ['محرك', 'فرامل', 'كهرباء', 'فلاتر'],
        createdAt: new Date('2010-01-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 2,
        name: 'Spare Parts Pro',
        arabicName: 'برو قطع الغيار',
        description: 'Quality spare parts specialist for all car brands',
        arabicDescription: 'متخصص في قطع الغيار عالية الجودة لجميع ماركات السيارات',
        logo: 'assets/images/image_100_100.png',
        rating: 4.2,
        reviewsCount: 180,
        location: 'Alexandria, Egypt',
        arabicLocation: 'الإسكندرية، مصر',
        phone: '+20123456790',
        email: 'contact@sparepartspr.com',
        website: 'www.sparepartspr.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Tires', 'Suspension', 'Body Parts', 'Accessories'],
        arabicSpecialties: ['الإطارات', 'نظام التعليق', 'قطع الهيكل', 'الإكسسوارات'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 800,
        establishedYear: 2015,
        tags: ['tires', 'body', 'accessories'],
        arabicTags: ['إطارات', 'هيكل', 'إكسسوارات'],
        createdAt: new Date('2015-03-20'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: 3,
        name: 'Motor World',
        arabicName: 'عالم الموتور',
        description: 'Complete automotive solutions and import services',
        arabicDescription: 'حلول شاملة للسيارات وخدمات الاستيراد',
        logo: 'assets/images/image_100_100.png',
        rating: 4.7,
        reviewsCount: 320,
        location: 'Giza, Egypt',
        arabicLocation: 'الجيزة، مصر',
        phone: '+20123456791',
        email: 'info@motorworld.com',
        website: 'www.motorworld.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['All Categories', 'Import Service', 'Original Parts'],
        arabicSpecialties: ['جميع الفئات', 'خدمة الاستيراد', 'قطع أصلية'],
        openingHours: '7:00 AM - 11:00 PM',
        arabicOpeningHours: '7:00 ص - 11:00 م',
        productsCount: 2500,
        establishedYear: 2008,
        tags: ['all', 'import', 'original'],
        arabicTags: ['جميع', 'استيراد', 'أصلي'],
        createdAt: new Date('2008-06-10'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: 4,
        name: 'Brake Masters',
        arabicName: 'خبراء الفرامل',
        description: 'Brake system specialists with expert installation',
        arabicDescription: 'متخصصون في أنظمة الفرامل مع التركيب الاحترافي',
        logo: 'assets/images/image_100_100.png',
        rating: 4.3,
        reviewsCount: 95,
        location: 'Mansoura, Egypt',
        arabicLocation: 'المنصورة، مصر',
        phone: '+20123456792',
        email: 'sales@brakemasters.com',
        website: 'www.brakemasters.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Installation'],
        arabicSpecialties: ['تيل الفرامل', 'أقراص الفرامل', 'زيت الفرامل', 'التركيب'],
        openingHours: '9:00 AM - 8:00 PM',
        arabicOpeningHours: '9:00 ص - 8:00 م',
        productsCount: 150,
        establishedYear: 2018,
        tags: ['brakes'],
        arabicTags: ['فرامل'],
        createdAt: new Date('2018-09-12'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: 5,
        name: 'ElectroAuto',
        arabicName: 'الكترو أوتو',
        description: 'Automotive electrical specialist and repair services',
        arabicDescription: 'متخصص في كهرباء السيارات وخدمات الإصلاح',
        logo: 'assets/images/image_100_100.png',
        rating: 4.1,
        reviewsCount: 140,
        location: 'Aswan, Egypt',
        arabicLocation: 'أسوان، مصر',
        phone: '+20123456793',
        email: 'info@electroauto.com',
        website: 'www.electroauto.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Batteries', 'Alternators', 'Starters', 'Wiring'],
        arabicSpecialties: ['البطاريات', 'الدينامو', 'المارش', 'الأسلاك'],
        openingHours: '8:30 AM - 9:30 PM',
        arabicOpeningHours: '8:30 ص - 9:30 م',
        productsCount: 450,
        establishedYear: 2012,
        tags: ['electrical'],
        arabicTags: ['كهرباء'],
        createdAt: new Date('2012-11-08'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: 6,
        name: 'Tire Kingdom',
        arabicName: 'مملكة الإطارات',
        description: 'Premium tire retailer with professional services',
        arabicDescription: 'متجر الإطارات المميز مع الخدمات الاحترافية',
        logo: 'assets/images/image_100_100.png',
        rating: 4.6,
        reviewsCount: 220,
        location: 'Luxor, Egypt',
        arabicLocation: 'الأقصر، مصر',
        phone: '+20123456794',
        email: 'sales@tirekingdom.com',
        website: 'www.tirekingdom.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Car Tires', 'Truck Tires', 'Tire Service', 'Balancing'],
        arabicSpecialties: ['إطارات السيارات', 'إطارات الشاحنات', 'خدمة الإطارات', 'الترصيص'],
        openingHours: '7:00 AM - 10:00 PM',
        arabicOpeningHours: '7:00 ص - 10:00 م',
        productsCount: 600,
        establishedYear: 2014,
        tags: ['tires'],
        arabicTags: ['إطارات'],
        createdAt: new Date('2014-04-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 7,
        name: 'Engine Expert',
        arabicName: 'خبير المحرك',
        description: 'Engine parts and performance specialists',
        arabicDescription: 'متخصص في قطع المحرك وتحسين الأداء',
        logo: 'assets/images/image_100_100.png',
        rating: 4.4,
        reviewsCount: 165,
        location: 'Port Said, Egypt',
        arabicLocation: 'بورسعيد، مصر',
        phone: '+20123456795',
        email: 'info@engineexpert.com',
        website: 'www.engineexpert.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Engine Rebuild', 'Performance Parts', 'Turbo', 'Exhaust'],
        arabicSpecialties: ['إعادة بناء المحرك', 'قطع الأداء', 'التيربو', 'العادم'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 750,
        establishedYear: 2016,
        tags: ['engine', 'performance'],
        arabicTags: ['محرك', 'أداء'],
        createdAt: new Date('2016-02-20'),
        updatedAt: new Date('2024-11-27')
      },
      {
        id: 8,
        name: 'Body Shop Pro',
        arabicName: 'محترف الهيكل',
        description: 'Body parts and paint services specialist',
        arabicDescription: 'متخصص في قطع الهيكل وخدمات الدهان',
        logo: 'assets/images/image_100_100.png',
        rating: 4.0,
        reviewsCount: 88,
        location: 'Suez, Egypt',
        arabicLocation: 'السويس، مصر',
        phone: '+20123456796',
        email: 'contact@bodyshoppro.com',
        website: 'www.bodyshoppro.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Body Panels', 'Lights', 'Mirrors', 'Paint Services'],
        arabicSpecialties: ['ألواح الهيكل', 'الأضواء', 'المرايا', 'خدمات الدهان'],
        openingHours: '9:00 AM - 7:00 PM',
        arabicOpeningHours: '9:00 ص - 7:00 م',
        productsCount: 320,
        establishedYear: 2019,
        tags: ['body', 'lights'],
        arabicTags: ['هيكل', 'إضاءة'],
        createdAt: new Date('2019-07-12'),
        updatedAt: new Date('2024-11-26')
      },
      {
        id: 1,
        name: 'AutoZone Egypt',
        arabicName: 'أوتوزون مصر',
        description: 'Leading auto parts retailer with comprehensive inventory',
        arabicDescription: 'أكبر متجر لقطع غيار السيارات مع مخزون شامل',
        logo: 'assets/images/image_100_100.png',
        rating: 4.5,
        reviewsCount: 250,
        location: 'Cairo, Egypt',
        arabicLocation: 'القاهرة، مصر',
        phone: '+20123456789',
        email: 'info@autozone-egypt.com',
        website: 'www.autozone-egypt.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Engine Parts', 'Brakes', 'Electrical', 'Oil & Filters'],
        arabicSpecialties: ['قطع المحرك', 'الفرامل', 'الكهرباء', 'الزيوت والفلاتر'],
        openingHours: '9:00 AM - 10:00 PM',
        arabicOpeningHours: '9:00 ص - 10:00 م',
        productsCount: 1500,
        establishedYear: 2010,
        tags: ['engine', 'brakes', 'electrical', 'filters'],
        arabicTags: ['محرك', 'فرامل', 'كهرباء', 'فلاتر'],
        createdAt: new Date('2010-01-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 2,
        name: 'Spare Parts Pro',
        arabicName: 'برو قطع الغيار',
        description: 'Quality spare parts specialist for all car brands',
        arabicDescription: 'متخصص في قطع الغيار عالية الجودة لجميع ماركات السيارات',
        logo: 'assets/images/image_100_100.png',
        rating: 4.2,
        reviewsCount: 180,
        location: 'Alexandria, Egypt',
        arabicLocation: 'الإسكندرية، مصر',
        phone: '+20123456790',
        email: 'contact@sparepartspr.com',
        website: 'www.sparepartspr.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Tires', 'Suspension', 'Body Parts', 'Accessories'],
        arabicSpecialties: ['الإطارات', 'نظام التعليق', 'قطع الهيكل', 'الإكسسوارات'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 800,
        establishedYear: 2015,
        tags: ['tires', 'body', 'accessories'],
        arabicTags: ['إطارات', 'هيكل', 'إكسسوارات'],
        createdAt: new Date('2015-03-20'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: 3,
        name: 'Motor World',
        arabicName: 'عالم الموتور',
        description: 'Complete automotive solutions and import services',
        arabicDescription: 'حلول شاملة للسيارات وخدمات الاستيراد',
        logo: 'assets/images/image_100_100.png',
        rating: 4.7,
        reviewsCount: 320,
        location: 'Giza, Egypt',
        arabicLocation: 'الجيزة، مصر',
        phone: '+20123456791',
        email: 'info@motorworld.com',
        website: 'www.motorworld.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['All Categories', 'Import Service', 'Original Parts'],
        arabicSpecialties: ['جميع الفئات', 'خدمة الاستيراد', 'قطع أصلية'],
        openingHours: '7:00 AM - 11:00 PM',
        arabicOpeningHours: '7:00 ص - 11:00 م',
        productsCount: 2500,
        establishedYear: 2008,
        tags: ['all', 'import', 'original'],
        arabicTags: ['جميع', 'استيراد', 'أصلي'],
        createdAt: new Date('2008-06-10'),
        updatedAt: new Date('2024-12-02')
      },
      {
        id: 4,
        name: 'Brake Masters',
        arabicName: 'خبراء الفرامل',
        description: 'Brake system specialists with expert installation',
        arabicDescription: 'متخصصون في أنظمة الفرامل مع التركيب الاحترافي',
        logo: 'assets/images/image_100_100.png',
        rating: 4.3,
        reviewsCount: 95,
        location: 'Mansoura, Egypt',
        arabicLocation: 'المنصورة، مصر',
        phone: '+20123456792',
        email: 'sales@brakemasters.com',
        website: 'www.brakemasters.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Installation'],
        arabicSpecialties: ['تيل الفرامل', 'أقراص الفرامل', 'زيت الفرامل', 'التركيب'],
        openingHours: '9:00 AM - 8:00 PM',
        arabicOpeningHours: '9:00 ص - 8:00 م',
        productsCount: 150,
        establishedYear: 2018,
        tags: ['brakes'],
        arabicTags: ['فرامل'],
        createdAt: new Date('2018-09-12'),
        updatedAt: new Date('2024-11-25')
      },
      {
        id: 5,
        name: 'ElectroAuto',
        arabicName: 'الكترو أوتو',
        description: 'Automotive electrical specialist and repair services',
        arabicDescription: 'متخصص في كهرباء السيارات وخدمات الإصلاح',
        logo: 'assets/images/image_100_100.png',
        rating: 4.1,
        reviewsCount: 140,
        location: 'Aswan, Egypt',
        arabicLocation: 'أسوان، مصر',
        phone: '+20123456793',
        email: 'info@electroauto.com',
        website: 'www.electroauto.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Batteries', 'Alternators', 'Starters', 'Wiring'],
        arabicSpecialties: ['البطاريات', 'الدينامو', 'المارش', 'الأسلاك'],
        openingHours: '8:30 AM - 9:30 PM',
        arabicOpeningHours: '8:30 ص - 9:30 م',
        productsCount: 450,
        establishedYear: 2012,
        tags: ['electrical'],
        arabicTags: ['كهرباء'],
        createdAt: new Date('2012-11-08'),
        updatedAt: new Date('2024-11-30')
      },
      {
        id: 6,
        name: 'Tire Kingdom',
        arabicName: 'مملكة الإطارات',
        description: 'Premium tire retailer with professional services',
        arabicDescription: 'متجر الإطارات المميز مع الخدمات الاحترافية',
        logo: 'assets/images/image_100_100.png',
        rating: 4.6,
        reviewsCount: 220,
        location: 'Luxor, Egypt',
        arabicLocation: 'الأقصر، مصر',
        phone: '+20123456794',
        email: 'sales@tirekingdom.com',
        website: 'www.tirekingdom.com',
        isVerified: true,
        isFeatured: true,
        specialties: ['Car Tires', 'Truck Tires', 'Tire Service', 'Balancing'],
        arabicSpecialties: ['إطارات السيارات', 'إطارات الشاحنات', 'خدمة الإطارات', 'الترصيص'],
        openingHours: '7:00 AM - 10:00 PM',
        arabicOpeningHours: '7:00 ص - 10:00 م',
        productsCount: 600,
        establishedYear: 2014,
        tags: ['tires'],
        arabicTags: ['إطارات'],
        createdAt: new Date('2014-04-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 7,
        name: 'Engine Expert',
        arabicName: 'خبير المحرك',
        description: 'Engine parts and performance specialists',
        arabicDescription: 'متخصص في قطع المحرك وتحسين الأداء',
        logo: 'assets/images/image_100_100.png',
        rating: 4.4,
        reviewsCount: 165,
        location: 'Port Said, Egypt',
        arabicLocation: 'بورسعيد، مصر',
        phone: '+20123456795',
        email: 'info@engineexpert.com',
        website: 'www.engineexpert.com',
        isVerified: true,
        isFeatured: false,
        specialties: ['Engine Rebuild', 'Performance Parts', 'Turbo', 'Exhaust'],
        arabicSpecialties: ['إعادة بناء المحرك', 'قطع الأداء', 'التيربو', 'العادم'],
        openingHours: '8:00 AM - 9:00 PM',
        arabicOpeningHours: '8:00 ص - 9:00 م',
        productsCount: 750,
        establishedYear: 2016,
        tags: ['engine', 'performance'],
        arabicTags: ['محرك', 'أداء'],
        createdAt: new Date('2016-02-20'),
        updatedAt: new Date('2024-11-27')
      },
      {
        id: 8,
        name: 'Body Shop Pro',
        arabicName: 'محترف الهيكل',
        description: 'Body parts and paint services specialist',
        arabicDescription: 'متخصص في قطع الهيكل وخدمات الدهان',
        logo: 'assets/images/image_100_100.png',
        rating: 4.0,
        reviewsCount: 88,
        location: 'Suez, Egypt',
        arabicLocation: 'السويس، مصر',
        phone: '+20123456796',
        email: 'contact@bodyshoppro.com',
        website: 'www.bodyshoppro.com',
        isVerified: false,
        isFeatured: false,
        specialties: ['Body Panels', 'Lights', 'Mirrors', 'Paint Services'],
        arabicSpecialties: ['ألواح الهيكل', 'الأضواء', 'المرايا', 'خدمات الدهان'],
        openingHours: '9:00 AM - 7:00 PM',
        arabicOpeningHours: '9:00 ص - 7:00 م',
        productsCount: 320,
        establishedYear: 2019,
        tags: ['body', 'lights'],
        arabicTags: ['هيكل', 'إضاءة'],
        createdAt: new Date('2019-07-12'),
        updatedAt: new Date('2024-11-26')
      },
    ];

    // تطبيق الفلاتر
    let filteredStores = [...mockStores];

    if (params) {
      // فلتر البحث
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredStores = filteredStores.filter(store =>
          store.name.toLowerCase().includes(searchTerm) ||
          store.arabicName.includes(searchTerm) ||
          store.description.toLowerCase().includes(searchTerm) ||
          store.arabicDescription.includes(searchTerm) ||
          store.specialties.some(s => s.toLowerCase().includes(searchTerm)) ||
          store.arabicSpecialties.some(s => s.includes(searchTerm))
        );
      }

      // فلتر الفئة
      if (params.category && params.category !== 'all') {
        filteredStores = filteredStores.filter(store =>
          store.tags.includes(params.category!)
        );
      }

      // فلتر التقييم
      if (params.rating && params.rating > 0) {
        filteredStores = filteredStores.filter(store =>
          store.rating >= params.rating!
        );
      }

      // فلتر المميز
      if (params.featured) {
        filteredStores = filteredStores.filter(store => store.isFeatured);
      }

      // فلتر المُعتمد
      if (params.verified) {
        filteredStores = filteredStores.filter(store => store.isVerified);
      }

      // الترتيب
      if (params.sortBy) {
        filteredStores.sort((a, b) => {
          let aValue = a[params.sortBy as keyof Store];
          let bValue = b[params.sortBy as keyof Store];

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = (bValue as string).toLowerCase();
          }

          if (params.sortOrder === 'desc') {
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }
    }

    // تطبيق التصفح
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStores = filteredStores.slice(startIndex, endIndex);

    const response: StoreSearchResponse = {
      stores: paginatedStores,
      total: filteredStores.length,
      page: page,
      totalPages: Math.ceil(filteredStores.length / limit),
      hasNext: endIndex < filteredStores.length,
      hasPrevious: page > 1
    };

    return of(response).pipe(delay(500)); // محاكاة زمن التحميل
  }
}
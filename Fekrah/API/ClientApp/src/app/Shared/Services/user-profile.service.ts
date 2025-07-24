import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { 
  UserProfile, 
  UpdateProfileRequest, 
  UpdateProfileResponse, 
  ValidationError 
} from '../Models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private currentProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentProfile$ = this.currentProfileSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private readonly apiUrl = '/api/user-profile'; // Replace with actual API endpoint

  constructor(private http: HttpClient) {
    this.loadProfileFromStorage();
  }

  /**
   * Get current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfileSubject.value;
  }

  /**
   * Load user profile from server
   */
  loadProfile(): Observable<UserProfile> {
    this.isLoadingSubject.next(true);
    
    // For now, return mock data - replace with actual API call
    return this.getMockProfile().pipe(
      delay(1000),
      map(profile => {
        this.currentProfileSubject.next(profile);
        this.saveProfileToStorage(profile);
        this.isLoadingSubject.next(false);
        return profile;
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(updateRequest: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    this.isLoadingSubject.next(true);
    
    // Validate the profile data
    const validationErrors = this.validateProfile(updateRequest.profile);
    if (validationErrors.length > 0) {
      this.isLoadingSubject.next(false);
      return of({
        success: false,
        message: 'البيانات المدخلة غير صحيحة',
        errors: validationErrors
      });
    }

    // Simulate API call
    return of(null).pipe(
      delay(2000),
      map(() => {
        const currentProfile = this.getCurrentProfile();
        if (currentProfile) {
          const updatedProfile: UserProfile = {
            ...currentProfile,
            ...updateRequest.profile,
            // Update timestamp
            lastUpdated: new Date().toISOString()
          };
          
          this.currentProfileSubject.next(updatedProfile);
          this.saveProfileToStorage(updatedProfile);
        }
        
        this.isLoadingSubject.next(false);
        return {
          success: true,
          message: 'تم تحديث الملف الشخصي بنجاح',
          updatedProfile: this.getCurrentProfile()
        } as UpdateProfileResponse;
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return of({
          success: false,
          message: 'حدث خطأ أثناء تحديث الملف الشخصي'
        });
      })
    );
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(imageFile: File): Observable<string> {
    this.isLoadingSubject.next(true);
    
    // Simulate image upload - replace with actual implementation
    return of(null).pipe(
      delay(1500),
      map(() => {
        // Return mock URL - in real implementation, upload to server and return URL
        const mockImageUrl = URL.createObjectURL(imageFile);
        this.isLoadingSubject.next(false);
        return mockImageUrl;
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Validate profile data
   */
  private validateProfile(profile: Partial<UserProfile>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (profile.name !== undefined) {
      if (!profile.name || profile.name.trim().length < 3) {
        errors.push({
          field: 'name',
          message: 'يجب أن يكون الاسم أكثر من 3 أحرف'
        });
      }
    }

    if (profile.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!profile.email || !emailRegex.test(profile.email)) {
        errors.push({
          field: 'email',
          message: 'البريد الإلكتروني غير صحيح'
        });
      }
    }

    if (profile.phone !== undefined) {
      const phoneRegex = /^(\+966|0)?[5][0-9]{8}$/;
      if (!profile.phone || !phoneRegex.test(profile.phone.replace(/\s/g, ''))) {
        errors.push({
          field: 'phone',
          message: 'رقم الهاتف غير صحيح'
        });
      }
    }

    if (profile.website !== undefined && profile.website) {
      try {
        new URL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`);
      } catch {
        errors.push({
          field: 'website',
          message: 'رابط الموقع الإلكتروني غير صحيح'
        });
      }
    }

    return errors;
  }

  /**
   * Get mock profile data
   */
  private getMockProfile(): Observable<UserProfile> {
    const mockProfile: UserProfile = {
      id: '1',
      name: 'محمد أحمد للسيارات',
      email: 'mohamed.ahmed@carparts.com',
      phone: '+966 55 123 4567',
      whatsapp: '+966 55 123 4567',
      location: 'الرياض، حي العليا، شارع الملك فهد',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68ba2a6cb3?w=1200&h=400&fit=crop',
      website: 'www.mohamed-carparts.com',
      description: 'متجر متخصص في قطع غيار السيارات الأصلية والبديلة عالية الجودة. نوفر خدمة العملاء على مدار الساعة مع ضمان الجودة والسعر المناسب.',
      userType: 'merchant',
      isVerified: true,
      isPremium: true,
      isFeatured: true,
      joinDate: '2018-03-15',
      businessName: 'محمد أحمد للسيارات',
      rating: 4.8,
      totalSales: 2847,
      totalOrders: 1523,
      productsCount: 350,
      responseTime: '< 2 ساعات',
      specialties: [
        'قطع غيار المحرك',
        'أنظمة الفرامل',
        'الكهرباء والإلكترونيات',
        'الزيوت والفلاتر',
        'الإطارات والجنوط',
        'قطع التكييف',
        'أنظمة العادم',
        'قطع التعليق'
      ],
      businessHours: [
        { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true }
      ],
      socialMedia: {
        facebook: 'mohamed.carparts',
        instagram: '@mohamed_carparts',
        twitter: '@mohamedcarparts'
      },
      achievements: [
        { title: 'أفضل تاجر', year: '2023', icon: 'fas fa-trophy' },
        { title: 'خدمة عملاء ممتازة', year: '2023', icon: 'fas fa-medal' },
        { title: 'أسرع توصيل', year: '2022', icon: 'fas fa-shipping-fast' }
      ],
      preferredContactMethod: 'whatsapp',
      availableForContact: true,
      profileVisibility: 'public',
      showPhone: true,
      showEmail: true,
      showLocation: true
    };

    return of(mockProfile);
  }

  /**
   * Save profile to local storage
   */
  private saveProfileToStorage(profile: UserProfile): void {
    try {
      localStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to storage:', error);
    }
  }

  /**
   * Load profile from local storage
   */
  private loadProfileFromStorage(): void {
    try {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        this.currentProfileSubject.next(profile);
      }
    } catch (error) {
      console.error('Error loading profile from storage:', error);
    }
  }

  /**
   * Clear profile data
   */
  clearProfile(): void {
    this.currentProfileSubject.next(null);
    localStorage.removeItem('user_profile');
  }

  /**
   * Reset profile to defaults
   */
  resetProfile(): Observable<UserProfile> {
    return this.loadProfile();
  }
}

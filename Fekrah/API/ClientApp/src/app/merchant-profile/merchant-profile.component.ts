import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserProfileService } from '../Shared/Services/user-profile.service';
import { UserProfile } from '../Shared/Models/user-profile.model';

@Component({
  selector: 'app-merchant-profile',
  templateUrl: './merchant-profile.component.html',
  styleUrls: ['./merchant-profile.component.scss']
})
export class MerchantProfileComponent implements OnInit, OnDestroy {
  activeTab: string = 'info';
  isLoading = false;
  userProfile: UserProfile | null = null;
  private subscriptions = new Subscription();
  
  merchantData = {
    id: 1,
    name: 'محمد أحمد للسيارات',
    email: 'mohamed.ahmed@carparts.com',
    phone: '+966 55 123 4567',
    whatsapp: '+966 55 123 4567',
    location: 'الرياض، حي العليا، شارع الملك فهد',
    joinDate: '2018-03-15',
    rating: 4.8,
    totalSales: 2847,
    totalOrders: 1523,
    totalCustomers: 892,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68ba2a6cb3?w=1200&h=400&fit=crop',
    website: 'www.mohamed-carparts.com',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    openingHours: '9:00 ص - 9:00 م',
    productsCount: 350,
    completedOrders: 1523,
    responseTime: '< 2 ساعات',
    description: 'متجر متخصص في قطع غيار السيارات الأصلية والبديلة عالية الجودة. نوفر خدمة العملاء على مدار الساعة مع ضمان الجودة والسعر المناسب.',
    arabicSpecialties: [
      'قطع غيار المحرك',
      'أنظمة الفرامل',
      'الكهرباء والإلكترونيات',
      'الزيوت والفلاتر',
      'الإطارات والجنوط',
      'قطع التكييف',
      'أنظمة العادم',
      'قطع التعليق'
    ],
    socialMedia: {
      facebook: 'mohamed.carparts',
      instagram: '@mohamed_carparts',
      twitter: '@mohamedcarparts'
    },
    businessHours: [
      { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true }
    ],
    achievements: [
      { title: 'أفضل تاجر', year: '2023', icon: 'fas fa-trophy' },
      { title: 'خدمة عملاء ممتازة', year: '2023', icon: 'fas fa-medal' },
      { title: 'أسرع توصيل', year: '2022', icon: 'fas fa-shipping-fast' }
    ],
    reviews: [
      {
        customerName: 'أحمد محمد',
        rating: 5,
        comment: 'خدمة ممتازة وقطع غيار أصلية. أنصح بالتعامل معهم.',
        date: '2023-12-01',
        verified: true
      },
      {
        customerName: 'سارة أحمد',
        rating: 5,
        comment: 'سرعة في التوصيل وجودة عالية في المنتجات.',
        date: '2023-11-28',
        verified: true
      },
      {
        customerName: 'خالد عبدالله',
        rating: 4,
        comment: 'تعامل راقي وأسعار مناسبة.',
        date: '2023-11-25',
        verified: false
      }
    ]
  };

  constructor(
    private router: Router, 
    private location: Location,
    private userProfileService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    // Subscribe to profile changes
    this.subscriptions.add(
      this.userProfileService.currentProfile$.subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          this.updateMerchantDataFromProfile(profile);
        }
      })
    );

    // Load profile from service
    this.subscriptions.add(
      this.userProfileService.loadProfile().subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.updateMerchantDataFromProfile(profile);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoading = false;
          this.showToast('حدث خطأ أثناء تحميل البيانات');
        }
      })
    );
  }

  updateMerchantDataFromProfile(profile: UserProfile): void {
    // Update merchantData from the loaded profile
    this.merchantData = {
      ...this.merchantData,
      id: profile.id ? parseInt(profile.id) : this.merchantData.id,
      name: profile.name || this.merchantData.name,
      email: profile.email || this.merchantData.email,
      phone: profile.phone || this.merchantData.phone,
      whatsapp: profile.whatsapp || this.merchantData.whatsapp,
      location: profile.location || this.merchantData.location,
      profileImage: profile.avatar || this.merchantData.profileImage,
      coverImage: profile.coverImage || this.merchantData.coverImage,
      website: profile.website || this.merchantData.website,
      isVerified: profile.isVerified ?? this.merchantData.isVerified,
      isPremium: profile.isPremium ?? this.merchantData.isPremium,
      isFeatured: profile.isFeatured ?? this.merchantData.isFeatured,
      joinDate: profile.joinDate || this.merchantData.joinDate,
      rating: profile.rating ?? this.merchantData.rating,
      totalSales: profile.totalSales ?? this.merchantData.totalSales,
      productsCount: profile.productsCount ?? this.merchantData.productsCount,
      responseTime: profile.responseTime || this.merchantData.responseTime,
      description: profile.description || this.merchantData.description,
      arabicSpecialties: profile.specialties || this.merchantData.arabicSpecialties,
      socialMedia: {
        facebook: profile.socialMedia?.facebook || this.merchantData.socialMedia.facebook,
        instagram: profile.socialMedia?.instagram || this.merchantData.socialMedia.instagram,
        twitter: profile.socialMedia?.twitter || this.merchantData.socialMedia.twitter
      },
      businessHours: profile.businessHours || this.merchantData.businessHours
    };
  }

  simulateLoading(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getYearsSinceJoined(): number {
    const joinDate = new Date(this.merchantData.joinDate);
    const currentDate = new Date();
    return currentDate.getFullYear() - joinDate.getFullYear();
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }
    
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }
    
    while (stars.length < 5) {
      stars.push('far fa-star');
    }
    
    return stars;
  }

  goBack(): void {
    this.location.back();
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/merchant-profile/edit']);
  }

  editProfile(): void {
    this.navigateToEditProfile();
  }

  viewSalesHistory(): void {
    console.log('View sales history clicked');
  }

  shareProfile(): void {
    if (navigator.share) {
      navigator.share({
        title: `ملف ${this.merchantData.name}`,
        text: 'شاهد ملف التاجر الشخصي',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('تم نسخ رابط الملف الشخصي');
    }
  }

  callPhone(): void {
    window.open(`tel:${this.merchantData.phone}`);
  }

  sendWhatsApp(): void {
    const message = encodeURIComponent(`مرحباً، أريد الاستفسار عن منتجاتكم`);
    window.open(`https://wa.me/${this.merchantData.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  }

  sendEmail(): void {
    window.open(`mailto:${this.merchantData.email}`);
  }

  visitWebsite(): void {
    window.open(`https://${this.merchantData.website}`, '_blank');
  }

  openSocialMedia(platform: string): void {
    const urls = {
      facebook: `https://facebook.com/${this.merchantData.socialMedia.facebook}`,
      instagram: `https://instagram.com/${this.merchantData.socialMedia.instagram.replace('@', '')}`,
      twitter: `https://twitter.com/${this.merchantData.socialMedia.twitter.replace('@', '')}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  }

  reportMerchant(): void {
    console.log('Report merchant clicked');
    this.showToast('تم إرسال البلاغ بنجاح');
  }

  addToFavorites(): void {
    console.log('Add to favorites clicked');
    this.showToast('تم إضافة التاجر إلى المفضلة');
  }

  private showToast(message: string): void {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
}

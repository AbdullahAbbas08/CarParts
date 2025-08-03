import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SwaggerClient, MerchantDTO } from '../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-merchant-profile',
  templateUrl: './merchant-profile.component.html',
  styleUrls: ['./merchant-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MerchantProfileComponent implements OnInit, OnDestroy {
  merchant: MerchantDTO | null = null;
  isLoading = true;
  errorMessage = '';
  subscriptions = new Subscription();
  
  // Modal properties - Enhanced
  showDocumentModal = false;
  currentDocumentImage = '';
  currentDocumentTitle = '';
  imageLoaded = false;
  imageError = false;
  isFullscreen = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private swaggerClient: SwaggerClient
  ) {}

  ngOnInit(): void {
    this.loadMerchantData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadMerchantData(): void {
    // Get merchant ID from route params or localStorage
    const routeMerchantId = this.route.snapshot.paramMap.get('id');
    const storedMerchantId = localStorage.getItem('currentMerchantId');
    
    const merchantId = routeMerchantId || storedMerchantId;
    
    if (merchantId) {
      this.loadMerchantById(parseInt(merchantId));
    } else {
      this.loadCurrentMerchant();
    }
  }

  loadCurrentMerchant(): void {
    // Get merchant ID from route params or localStorage
    const routeMerchantId = this.route.snapshot.paramMap.get('id');
    const storedMerchantId = localStorage.getItem('currentMerchantId');
    
    const merchantId = routeMerchantId || storedMerchantId;
    
    if (merchantId) {
      this.loadMerchantById(parseInt(merchantId));
    } else {
      this.isLoading = false;
      console.warn('No merchant ID found');
    }
  }

  loadMerchantById(id: number): void {
    console.log('Loading merchant data for ID:', id);
    this.isLoading = true;
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.swaggerClient.apiMerchantGetDataByIdGet(id).subscribe({
        next: (merchant) => {
          console.log('Merchant data loaded:', merchant);
          this.merchant = merchant;
          this.isLoading = false;
          
          // Store merchant ID for future use
          if (merchant.id) {
            localStorage.setItem('currentMerchantId', merchant.id.toString());
          }
        },
        error: (error:any) => {
          console.error('Error loading merchant:', error);
          this.errorMessage = 'حدث خطأ أثناء تحميل بيانات المتجر';
          this.isLoading = false;
        }
      })
    );
  }

  // Navigation methods
  navigateToEdit(): void {
    this.router.navigate(['/merchant-profile/edit']);
  }

  addProduct(): void {
    // Navigate to add product page
    console.log('Navigate to add product');
    this.showToast('هذه الميزة قيد التطوير', 'info');
  }

  navigateToProducts(): void {
    // Navigate to products list page
    this.router.navigate(['/dashboard/merchant']);
  }

  addAttachment(): void {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf,.doc,.docx';
    fileInput.multiple = true;
    
    fileInput.onchange = (event: any) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.handleFileUpload(files);
      }
    };
    
    fileInput.click();
  }

  handleFileUpload(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Uploading file:', file.name);
      // Here you would implement the actual file upload logic
    }
    this.showToast(`تم رفع ${files.length} ملف بنجاح`, 'success');
  }

  openSettings(): void {
    // Open settings modal or navigate to settings
    console.log('Open settings');
    this.showToast('هذه الميزة قيد التطوير', 'info');
  }

  // Document viewing with modal - Enhanced for documents and merchant logo
  viewDocument(imageData: string): void {
    if (imageData) {
      // Determine document title based on the content
      if (imageData.includes('commercialRegistration') || imageData.includes('التجاري')) {
        this.currentDocumentTitle = 'السجل التجاري';
      } else if (imageData.includes('nationalId') || imageData.includes('الهوية')) {
        this.currentDocumentTitle = 'بطاقة الهوية الوطنية';
      } else {
        this.currentDocumentTitle = 'المستند';
      }
      
      this.currentDocumentImage = imageData;
      this.showDocumentModal = true;
    }
  }

  // View commercial register in modal
  viewCommercialRegister(): void {
    if (!this.merchant?.commercialRegistrationImage) return;
    
    const imageUrl = this.getDocumentImageUrl(this.merchant.commercialRegistrationImage);
    this.currentDocumentTitle = 'السجل التجاري';
    this.currentDocumentImage = imageUrl;
    this.resetModalState();
    this.showDocumentModal = true;
    
    // Scroll to top to ensure modal is visible
    this.scrollToTop();
  }

  // View national ID in modal
  viewNationalId(): void {
    if (!this.merchant?.nationalIdImage) return;
    
    const imageUrl = this.getDocumentImageUrl(this.merchant.nationalIdImage);
    this.currentDocumentTitle = 'بطاقة الهوية الوطنية';
    this.currentDocumentImage = imageUrl;
    this.resetModalState();
    this.showDocumentModal = true;
    
    // Scroll to top to ensure modal is visible
    this.scrollToTop();
  }

  // View merchant logo in modal
  viewMerchantLogo(): void {
    const logoUrl = this.getMerchantLogoUrl();
    if (logoUrl && logoUrl !== 'assets/images/image_100_100.png') {
      this.currentDocumentTitle = `شعار ${this.merchant?.shopName || 'المتجر'}`;
      this.currentDocumentImage = logoUrl;
      this.resetModalState();
      this.showDocumentModal = true;
      
      // Scroll to top to ensure modal is visible
      this.scrollToTop();
    }
  }

  // Scroll to top of page and disable body scroll
  private scrollToTop(): void {
    // Disable body scroll to prevent background scrolling
    this.disableBodyScroll();
    
    // Use setTimeout to ensure the modal is rendered first
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Also try document.body and document.documentElement
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 50);
  }

  // Disable body scroll
  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = '100%';
  }

  // Enable body scroll
  private enableBodyScroll(): void {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    
    // Restore scroll position
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }

  // Reset modal state
  resetModalState(): void {
    this.imageLoaded = false;
    this.imageError = false;
    this.isFullscreen = false;
  }

  // Close document modal
  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.currentDocumentImage = '';
    this.currentDocumentTitle = '';
    this.resetModalState();
    
    // Re-enable body scroll
    this.enableBodyScroll();
  }

  // Download document
  downloadDocument(): void {
    if (!this.currentDocumentImage) return;

    try {
      const link = document.createElement('a');
      link.href = this.currentDocumentImage;
      link.download = `${this.currentDocumentTitle}_${this.merchant?.shopName || 'document'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('تم بدء التحميل', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      this.showToast('فشل في تحميل الملف', 'error');
    }
  }

  // Toggle fullscreen
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    const modalElement = document.querySelector('.document-modal .modal-content') as HTMLElement;
    
    if (modalElement) {
      if (this.isFullscreen) {
        modalElement.style.width = '100vw';
        modalElement.style.height = '100vh';
        modalElement.style.maxWidth = '100vw';
        modalElement.style.maxHeight = '100vh';
        modalElement.style.borderRadius = '0';
        modalElement.style.top = '0';
        modalElement.style.left = '0';
        modalElement.style.transform = 'none';
      } else {
        modalElement.style.width = '90vw';
        modalElement.style.height = '90vh';
        modalElement.style.maxWidth = '1200px';
        modalElement.style.maxHeight = '800px';
        modalElement.style.borderRadius = '1rem';
        modalElement.style.top = '50%';
        modalElement.style.left = '50%';
        modalElement.style.transform = 'translate(-50%, -50%)';
      }
    }
  }

  // Zoom image
  zoomImage(): void {
    const imgElement = document.querySelector('.document-modal img') as HTMLElement;
    if (imgElement) {
      const currentScale = imgElement.style.transform.includes('scale') ? 
        parseFloat(imgElement.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || '1') : 1;
      
      const newScale = currentScale === 1 ? 2 : 1;
      imgElement.style.transform = `scale(${newScale})`;
      imgElement.style.cursor = newScale === 1 ? 'zoom-in' : 'zoom-out';
      imgElement.style.transition = 'transform 0.3s ease';
    }
  }

  // Handle image error
  onImageError(event: Event): void {
    console.error('Failed to load image:', this.currentDocumentImage);
    this.imageError = true;
    this.imageLoaded = false;
  }

  // Get document image URL with support for assets/MerchantData
  getDocumentImageUrl(imageData: string): string {
    if (!imageData) return '';

    // If image is a filename (from API), construct path to assets/MerchantData
    if (!imageData.startsWith('data:') && !imageData.includes('/')) {
      return `assets/MerchantData/${imageData}`;
    }
    
    // If image is base64 data
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If image is base64 without data prefix
    if (imageData.length > 100) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    
    return imageData;
  }

  // Get merchant logo URL with support for assets/MerchantData
  getMerchantLogoUrl(): string {
    if (!this.merchant) {
      return 'assets/images/image_100_100.png';
    }

    // If logo is a filename (from API), construct path to assets/MerchantData
    if (this.merchant.logo && !this.merchant.logo.startsWith('data:') && !this.merchant.logo.includes('/')) {
      return `assets/MerchantData/${this.merchant.logo}`;
    }
    
    // If logo is base64 data
    if (this.merchant.logo && this.merchant.logo.startsWith('data:')) {
      return this.merchant.logo;
    }
    
    // If logo is base64 without data prefix
    if (this.merchant.logo && this.merchant.logo.length > 100) {
      return `data:image/jpeg;base64,${this.merchant.logo}`;
    }
    
    // Default logo
    return 'assets/images/image_100_100.png';
  }

  // Contact methods
  callPhone(): void {
    if (this.merchant?.mobileNo) {
      window.open(`tel:${this.merchant.mobileNo}`, '_self');
    }
  }

  openWhatsApp(): void {
    if (this.merchant?.whatsAppMobileNo) {
      const message = encodeURIComponent(`مرحباً، أود الاستفسار عن منتجات ${this.merchant.shopName}`);
      window.open(`https://wa.me/${this.merchant.whatsAppMobileNo}?text=${message}`, '_blank');
    }
  }

  sendEmail(): void {
    if (this.merchant?.email) {
      const subject = encodeURIComponent(`استفسار عن ${this.merchant.shopName}`);
      window.open(`mailto:${this.merchant.email}?subject=${subject}`, '_self');
    }
  }

  openLocation(): void {
    if (this.merchant?.locationOnMap) {
      window.open(this.merchant.locationOnMap, '_blank');
    }
  }

  // Helper methods for display
  getBusinessHours(): any[] {
    if (!this.merchant?.businessHours) {
      return [];
    }
    try {
      const hours = JSON.parse(this.merchant.businessHours);
      if (Array.isArray(hours)) {
        return hours;
      }
    } catch (e) {
      console.warn('Failed to parse business hours:', e);
    }
    return [];
  }

  getParsedBusinessHours(): string {
    const hours = this.getBusinessHours();
    if (hours.length === 0) {
      return 'غير محدد';
    }
    return hours.map(day => 
      `${day.day}: ${day.isOpen ? (day.hours || `${day.openTime} - ${day.closeTime}`) : 'مغلق'}`
    ).join('\n');
  }

  isOpenToday(): boolean {
    const hours = this.getBusinessHours();
    const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long' });
    const todayHours = hours.find(day => day.day === today);
    return todayHours ? todayHours.isOpen : false;
  }

  getDisplayRating(): number {
    return this.merchant?.rating || 0;
  }

  getRatingCount(): number {
    return this.merchant?.ratingCount || 0;
  }

  hasDocuments(): boolean {
    return !!(this.merchant?.commercialRegistrationImage || this.merchant?.nationalIdImage);
  }

  hasTeamMembers(): boolean {
    return !!(this.merchant?.members && this.merchant.members.length > 0);
  }

  getTeamMembersCount(): number {
    return this.merchant?.members?.length || 0;
  }

  // Profile sharing and linking methods
  copyProfileLink(): void {
    if (this.merchant?.id) {
      const profileUrl = `${window.location.origin}/merchant/${this.merchant.id}`;
      navigator.clipboard.writeText(profileUrl).then(() => {
        this.showToast('تم نسخ رابط الملف الشخصي', 'success');
      }).catch(() => {
        this.showToast('فشل في نسخ الرابط', 'error');
      });
    }
  }

  shareProfile(): void {
    if (this.merchant?.id) {
      const profileUrl = `${window.location.origin}/merchant/${this.merchant.id}`;
      const shareData = {
        title: this.merchant.shopName || 'ملف المتجر',
        text: `تعرف على ${this.merchant.shopName} - ${this.merchant.shortDescription || 'متجر قطع غيار السيارات'}`,
        url: profileUrl
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        this.copyProfileLink();
      }
    }
  }

  // Category color generator
  getCategoryColor(index: number): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', 
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    return colors[index % colors.length];
  }

  // Team member contact
  callMember(phoneNumber: string): void {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }

  // Utility methods
  formatDate(date: Date | null | undefined): string {
    if (!date) return 'غير محدد';
    return new Date(date).toLocaleDateString('ar-SA');
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    console.log(`Toast (${type}): ${message}`);
    // Implement your toast notification here
  }
}
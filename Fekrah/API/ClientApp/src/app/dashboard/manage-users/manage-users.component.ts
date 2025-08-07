import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, AfterViewInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserManagementService } from './user-management.service';
import { UserDTO, UserTypeEnum } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

declare var bootstrap: any;

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('userModalTemplate', { static: true }) userModalTemplate!: TemplateRef<any>;
  @ViewChild('confirmDeleteTemplate', { static: true }) confirmDeleteTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  private deleteSwiper: Swiper | null = null;
  
  // Data properties
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  totalCount = 0;
  loading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Search and filters
  searchTerm = '';
  selectedUserType: UserTypeEnum | 'all' = 'all';
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';
  
  // Forms
  userForm: FormGroup;
  searchForm: FormGroup;
  
  // Modal state
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: UserDTO | null = null;
  userToDelete: UserDTO | null = null;
  
  // Enums for template
  UserTypeEnum = UserTypeEnum;
  
  // Statistics
  statistics = {
    totalUsers: 0,
    adminUsers: 0,
    clientUsers: 0,
    merchantUsers: 0,
    shippingUsers: 0
  };

  constructor(
    private userService: UserManagementService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.userForm = this.createUserForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
    this.loadUsers();
    this.loadStatistics();

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up Swiper instance
    if (this.deleteSwiper) {
      this.deleteSwiper.destroy(true, true);
      this.deleteSwiper = null;
    }
    
    // Ensure body scrolling is restored if component is destroyed while modal is open
    if (this.isModalOpen) {
      this.renderer.removeClass(document.body, 'modal-open');
    }
    
    // Re-enable body interaction when component is destroyed
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    
  }

  ngAfterViewInit(): void {
    // Initialize Swiper modules
    Swiper.use([Navigation, Pagination]);
  }

  private initializeComponent(): void {
    this.calculateTotalPages();
  }

  private setupSubscriptions(): void {
    // Loading state subscription
    this.userService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Users data subscription
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.applyFilters();
      });

    // Total count subscription
    this.userService.totalCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.calculateTotalPages();
      });

    // Search form subscription
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.searchTerm = term || '';
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      id: [0],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      nationalId: [''],
      phoneNumber: ['', [Validators.required]],
      address: [''],
      userType: [UserTypeEnum.Client, [Validators.required]],
      isActive: [true],
      photo: ['']
    });
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      userType: ['all'],
      status: ['all']
    });
  }

  // Data loading methods
  loadUsers(): void {
    this.userService.loadUsers(this.pageSize, this.currentPage, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Users loaded successfully', result);
        },
        error: (error) => {
          this.showNotification('حدث خطأ في تحميل المستخدمين', 'error');
          console.error('Error loading users:', error);
        }
      });
  }

  loadStatistics(): void {
    this.userService.getUserStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  // Filter and search methods
  applyFilters(): void {
    let filtered = [...this.users];

    // Apply user type filter
    if (this.selectedUserType !== 'all') {
      filtered = filtered.filter(user => user.userType === this.selectedUserType);
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = filtered;
  }

  onFilterChange(): void {
    this.selectedUserType = this.searchForm.get('userType')?.value || 'all';
    this.selectedStatus = this.searchForm.get('status')?.value || 'all';
    this.applyFilters();
  }

  // Pagination methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = event?.target?.value || 10;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.loadUsers();
  }

  // Modal methods
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.patchValue({
      id: 0,
      userType: UserTypeEnum.Client,
      isActive: true
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  openEditModal(user: UserDTO): void {
    this.modalMode = 'edit';
    this.selectedUser = new UserDTO(user);
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
    
    // Prevent body scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
    
    // التمرير التلقائي إلى أعلى الصفحة لإظهار الـ modal
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }, 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.userForm.reset();
    
    // Restore body scrolling when modal is closed
    this.renderer.removeClass(document.body, 'modal-open');
  }

  // CRUD operations with enhanced UI feedback
  saveUser(): void {
    if (this.userForm.valid) {
      // Show loading state
      this.showSaveLoadingState(true);
      
      const formValue = this.userForm.value;
      const userData: UserDTO = new UserDTO(formValue);

      const operation = this.modalMode === 'create' 
        ? this.userService.createUser(userData)
        : this.userService.updateUser(userData);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          // Show success state
          this.showSaveSuccessState();
          
          const message = this.modalMode === 'create' 
            ? '✨ تم إنشاء المستخدم بنجاح'
            : '💾 تم تحديث المستخدم بنجاح';
          this.showNotification(message, 'success');
          
          // Close modal after a brief delay to show success state
          setTimeout(() => {
            this.closeModal();
            this.loadUsers();
            this.loadStatistics();
          }, 1000);
        },
        error: (error) => {
          // Reset button state on error
          this.showSaveLoadingState(false);
          this.showNotification('❌ حدث خطأ في حفظ البيانات', 'error');
          console.error('Error saving user:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.userForm);
      this.showNotification('⚠️ يرجى تصحيح الأخطاء في النموذج', 'info');
    }
  }

  private showSaveLoadingState(loading: boolean): void {
    const saveBtn = document.querySelector('.btn-save-enhanced') as HTMLElement;
    const spinner = document.querySelector('.save-spinner') as HTMLElement;
    const icon = document.querySelector('.save-icon') as HTMLElement;
    const text = document.querySelector('.save-text') as HTMLElement;
    
    if (saveBtn && spinner && icon && text) {
      if (loading) {
        saveBtn.style.cursor = 'not-allowed';
        spinner.style.display = 'block';
        icon.style.display = 'none';
        text.textContent = 'جارِ الحفظ...';
        saveBtn.setAttribute('disabled', 'true');
      } else {
        saveBtn.style.cursor = 'pointer';
        spinner.style.display = 'none';
        icon.style.display = 'block';
        text.textContent = this.modalMode === 'create' ? '✨ إضافة المستخدم' : '💾 حفظ التغييرات';
        saveBtn.removeAttribute('disabled');
      }
    }
  }

  private showSaveSuccessState(): void {
    const saveBtn = document.querySelector('.btn-save-enhanced') as HTMLElement;
    const spinner = document.querySelector('.save-spinner') as HTMLElement;
    const icon = document.querySelector('.save-icon') as HTMLElement;
    const successIcon = document.querySelector('.save-success') as HTMLElement;
    const text = document.querySelector('.save-text') as HTMLElement;
    
    if (saveBtn && spinner && icon && successIcon && text) {
      spinner.style.display = 'none';
      icon.style.display = 'none';
      successIcon.style.display = 'block';
      text.textContent = '✅ تم الحفظ بنجاح!';
      saveBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
    }
  }

confirmDelete(user: UserDTO): void {
  this.userToDelete = user;

  // ✨ امنع السكرول على body
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.log('Initializing delete swiper...');
    this.initializeDeleteSwiper();

    const overlay = document.querySelector('.delete-confirmation-overlay') as HTMLElement;
    if (overlay) {
      console.log('Overlay found and pointer events enabled');
      overlay.style.pointerEvents = 'auto';
    } else {
      console.log('Overlay NOT found!');
    }
  }, 100);
}


  private initializeDeleteSwiper(): void {
    console.log('initializeDeleteSwiper called');
    const swiperElement = document.querySelector('.delete-confirmation-swiper') as HTMLElement;
    console.log('Swiper element found:', swiperElement);
    
    if (swiperElement && !this.deleteSwiper) {
      console.log('Creating new Swiper instance...');
      this.deleteSwiper = new Swiper(swiperElement, {
        modules: [Navigation, Pagination],
        direction: 'horizontal',
        loop: false,
        autoHeight: true,
        speed: 600,
        effect: 'slide',
        
        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        
        // Pagination bullets
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        },
        
        // Resistance and threshold for better UX
        resistance: true,
        resistanceRatio: 0.85,
        threshold: 10,
        
        // Prevent interaction on last slide until user confirms
        allowSlideNext: true,
        allowSlidePrev: true,
        
        // Disable touch on final confirmation slide for safety
        on: {
          slideChange: (swiper) => {
            if (swiper.activeIndex === 2) {
              // On final confirmation slide, disable further swiping
              swiper.allowSlideNext = false;
            } else {
              swiper.allowSlideNext = true;
            }
          }
        }
      });
    }
  }

  deleteUser(): void {
    if (this.userToDelete && this.userToDelete.id) {
      this.userService.deleteUser(this.userToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('تم حذف المستخدم بنجاح', 'success');
            this.cancelDelete(); // This will clean up everything including body styles
            this.loadUsers();
            this.loadStatistics();
          },
          error: (error) => {
            this.showNotification('حدث خطأ في حذف المستخدم', 'error');
            console.error('Error deleting user:', error);
            // Re-enable body interaction even on error
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
          }
        });
    }
  }

cancelDelete(): void {
  if (this.deleteSwiper) {
    this.deleteSwiper.destroy(true, true);
    this.deleteSwiper = null;
  }

  // ✅ إعادة تفعيل السكرول
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';

  this.userToDelete = null;
}


  // User Status Management
  toggleUserStatus(user: UserDTO): void {
    if (!user.id) return;

    const newStatus = !user.isActive;
    const action = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    this.userService.setUserActiveStatus(user.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(`تم ${action} المستخدم بنجاح`, 'success');
          this.loadStatistics(); // Refresh statistics after status change
        },
        error: (error) => {
          this.showNotification(`حدث خطأ في ${action} المستخدم`, 'error');
          console.error('Error toggling user status:', error);
        }
      });
  }

  enableUser(user: UserDTO): void {
    if (!user.id || user.isActive) return;

    this.userService.setUserActiveStatus(user.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('تم تفعيل المستخدم بنجاح', 'success');
          this.loadStatistics();
        },
        error: (error) => {
          this.showNotification('حدث خطأ في تفعيل المستخدم', 'error');
          console.error('Error enabling user:', error);
        }
      });
  }

  disableUser(user: UserDTO): void {
    if (!user.id || !user.isActive) return;

    this.userService.setUserActiveStatus(user.id, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('تم إلغاء تفعيل المستخدم بنجاح', 'success');
          this.loadStatistics();
        },
        error: (error) => {
          this.showNotification('حدث خطأ في إلغاء تفعيل المستخدم', 'error');
          console.error('Error disabling user:', error);
        }
      });
  }

  // Utility methods
  getUserTypeDisplayName(userType: UserTypeEnum | undefined): string {
    return this.userService.getUserTypeDisplayName(userType);
  }

  getStatusBadgeClass(isActive: boolean | undefined): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'نشط' : 'غير نشط';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صالح';
      if (field.errors['minlength']) return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const toast = document.createElement('div');
    
    // Enhanced notification with beautiful styling
    const alertClass = type === 'success' ? 'success' : 
                      type === 'error' ? 'danger' : 
                      type === 'warning' ? 'warning' : 'info';
    
    const iconClass = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'times-circle' : 
                     type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    const gradient = type === 'success' ? 'linear-gradient(135deg, #10b981, #047857)' : 
                    type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                    type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    
    toast.innerHTML = `
      <div class="enhanced-notification" style="
        background: white;
        border: none;
        border-radius: 16px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        border-left: 4px solid transparent;
        background-image: ${gradient};
        background-clip: padding-box;
        color: #1f2937;
        animation: notificationSlideIn 0.4s ease-out;
        position: relative;
        overflow: hidden;
      ">
        <!-- Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          margin: 4px 0 0 4px;
          border-radius: 14px;
        "></div>
        
        <!-- Content -->
        <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 0.75rem;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: ${gradient};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <i class="fas fa-${iconClass}" style="color: white; font-size: 0.9rem;"></i>
          </div>
          
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.95rem; color: #1f2937;">
              ${message}
            </div>
          </div>
          
          <button type="button" onclick="this.closest('.enhanced-notification-container').remove()" style="
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 6px;
            transition: all 0.2s ease;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">
            <i class="fas fa-times" style="font-size: 0.75rem;"></i>
          </button>
        </div>
      </div>
    `;
    
    toast.className = 'enhanced-notification-container';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100000;
      min-width: 350px;
      max-width: 450px;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);
  }

  // Export functionality
  exportUsers(): void {
    // This would typically export to CSV or Excel
    const csvContent = this.convertToCSV(this.filteredUsers);
    this.downloadCSV(csvContent, 'users.csv');
  }

  private convertToCSV(users: UserDTO[]): string {
    const headers = ['الرقم المعرف', 'الاسم الكامل', 'اسم المستخدم', 'رقم الهاتف', 'نوع المستخدم', 'الحالة'];
    const rows = users.map(user => [
      user.id,
      user.fullName || '',
      user.userName || '',
      user.phoneNumber || '',
      this.getUserTypeDisplayName(user.userType),
      this.getStatusText(user.isActive)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Template helper methods
  trackByUserId(index: number, user: UserDTO): number {
    return user.id;
  }

  getUserTypeColor(userType: UserTypeEnum | undefined): string {
    switch (userType) {
      case UserTypeEnum.Admin:
        return 'linear-gradient(135deg, #f97316, #ea580c)';
      case UserTypeEnum.Client:
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case UserTypeEnum.Merchant:
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case UserTypeEnum.ShippingCompany:
        return 'linear-gradient(135deg, #10b981, #059669)';
      default:
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getUserTypeIcon(userType: UserTypeEnum | undefined): string {
    switch (userType) {
      case UserTypeEnum.Admin:
        return 'fas fa-user-shield';
      case UserTypeEnum.Client:
        return 'fas fa-user-friends';
      case UserTypeEnum.Merchant:
        return 'fas fa-store';
      case UserTypeEnum.ShippingCompany:
        return 'fas fa-truck';
      default:
        return 'fas fa-user';
    }
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      userType: 'all',
      status: 'all'
    });
    this.selectedUserType = 'all';
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.loadUsers();
  }

  refreshData(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  // Quick filter methods for status actions
  showActiveUsersOnly(): void {
    this.searchForm.patchValue({ status: 'active' });
    this.selectedStatus = 'active';
    this.applyFilters();
  }

  showInactiveUsersOnly(): void {
    this.searchForm.patchValue({ status: 'inactive' });
    this.selectedStatus = 'inactive';
    this.applyFilters();
  }

  showAllUsers(): void {
    this.searchForm.patchValue({ status: 'all' });
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  Math = Math; // Expose Math to template
}

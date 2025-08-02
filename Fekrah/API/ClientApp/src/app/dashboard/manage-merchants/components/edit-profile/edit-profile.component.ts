import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { SwaggerClient, MerchantDTO, GovernorateLookupDto, CityLookupDto, UserTypeEnum, UserDTO, CategoryDTO, MemberDTO } from '../../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  isLoading = false;
  selectedLogo: File | null = null;
  selectedCommercialReg: File | null = null;
  selectedNationalId: File | null = null;
  previewLogo: string | null = null;
  previewCommercialReg: string | null = null;
  previewNationalId: string | null = null;
  currentMerchant: MerchantDTO | null = null;
  merchantId: number | null = null;
  updateErrors: string[] = [];
  saveChangesinprogress = 'جاري الحفظ...';
  saveChanges = 'حفظ التغييرات';
  showPassword = false;
  
  // Admin mode check
  isAdminMode = false;
  
  // Progress bar properties
  progressPercentage = 0;
  completedSteps = 0;
  totalSteps = 8; // Logo, Basic info, Location, Documents, Team, Business Hours, Categories, Description
  
  // Step wizard properties
  currentStep: number = 1;
  steps = [
    { id: 1, title: 'شعار المتجر', icon: 'fas fa-images', completed: false },
    { id: 2, title: 'معلومات أساسية', icon: 'fas fa-info-circle', completed: false },
    { id: 3, title: 'الموقع', icon: 'fas fa-map-marker-alt', completed: false },
    { id: 4, title: 'الوثائق', icon: 'fas fa-file-alt', completed: false },
    { id: 5, title: 'فريق العمل', icon: 'fas fa-users', completed: false },
    { id: 6, title: 'ساعات العمل', icon: 'fas fa-clock', completed: false },
    { id: 7, title: 'التصنيفات', icon: 'fas fa-tags', completed: false },
    { id: 8, title: 'وصف المتجر', icon: 'fas fa-align-left', completed: false }
  ];
  
  // Lookup data
  governorates: GovernorateLookupDto[] = [];
  cities: CityLookupDto[] = [];
  categories: CategoryDTO[] = [];
  isLoadingGovernorates = false;
  isLoadingCities = false;
  isLoadingCategories = false;
  
  // Add category modal properties
  showAddCategoryForm = false;
  newCategoryForm!: FormGroup;
  isAddingCategory = false;
  
  // Roles list for dropdown
  roles = [
    { value: 'manager', label: 'مدير' },
    { value: 'sales_rep', label: 'مندوب مبيعات' },
    { value: 'cashier', label: 'كاشير' },
    { value: 'technician', label: 'فني' },
    { value: 'warehouse_keeper', label: 'أمين مخزن' },
    { value: 'customer_service', label: 'خدمة عملاء' },
    { value: 'accountant', label: 'محاسب' },
    { value: 'assistant', label: 'مساعد' }
  ];
  
  private subscriptions = new Subscription();

  // Custom Validators
  static optionalEmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value.trim() === '') {
      return null; // Valid if empty
    }
    // Use Angular's email validator if value exists
    return Validators.email(control);
  }

  static passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;

    if (!passwordValid) {
      return {
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial,
          isValidLength
        }
      };
    }
    return null;
  }

  static passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove passwordMismatch error if passwords match
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private swaggerClient: SwaggerClient,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Force reset loading state on component initialization
    console.log('🔄 Component initialized - resetting loading state from', this.isLoading, 'to false');
    this.isLoading = false;
    
    // Check if coming from admin route (admin adding new merchant)
    this.isAdminMode = this.router.url.includes('/admin/') || 
                      this.router.url.includes('add-merchant') ||
                      this.router.url.includes('/dashboard/');
    
    // Initialize form first
    this.initializeForm();
    this.initializeNewCategoryForm();
    
    // Load dropdown data
    this.loadGovernorates();
    this.loadCategories();
    
    // Load merchant data if editing existing merchant
    this.loadMerchantData();
    
    // Initialize progress calculation
    this.calculateProgress();
    
    // Subscribe to form changes to update progress
    this.editForm.valueChanges.subscribe(() => {
      this.updateProgress();
    });
    
    // Subscribe to form status changes for step validation
    this.editForm.statusChanges.subscribe(() => {
      // Trigger change detection for step navigation buttons
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadGovernorates(): void {
    this.isLoadingGovernorates = true;
    this.subscriptions.add(
      this.swaggerClient.apiLookupGovernoratesGet().subscribe({
        next: (governorates) => {
          this.governorates = governorates || [];
          this.isLoadingGovernorates = false;
        },
        error: (error) => {
          this.governorates = [];
          this.isLoadingGovernorates = false;
        }
      })
    );
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.subscriptions.add(
      this.swaggerClient.apiCategoryAllGet().subscribe({
        next: (categories) => {
          this.categories = categories || [];
          this.isLoadingCategories = false;
        },
        error: (error) => {
          this.categories = [];
          this.isLoadingCategories = false;
        }
      })
    );
  }

  loadCities(governorateId: number): Promise<void> {
    if (!governorateId) {
      this.cities = [];
      return Promise.resolve();
    }

    this.isLoadingCities = true;
    
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.swaggerClient.apiLookupCitiesGet(governorateId).subscribe({
          next: (cities) => {
            this.cities = cities || [];
            this.isLoadingCities = false;
            console.log('Cities loaded successfully:', this.cities);
            resolve();
          },
          error: (error) => {
            this.cities = [];
            this.isLoadingCities = false;
            console.error('Error loading cities:', error);
            reject(error);
          }
        })
      );
    });
  }

  onGovernorateChange(event: any): void {
    const governorateId = event?.target?.value || event; // Handle both event object and direct value
    if (governorateId) {
      this.loadCities(parseInt(governorateId)).then(() => {
        // Cities loaded successfully
        // Reset city selection when governorate changes (only if this is a user action, not data loading)
        if (event?.target) {
          this.editForm.get('cityId')?.setValue('');
        }
      }).catch(error => {
        console.error('Error loading cities:', error);
        this.cities = [];
        this.editForm.get('cityId')?.setValue('');
      });
    } else {
      this.cities = [];
      this.editForm.get('cityId')?.setValue('');
    }
  }

  loadMerchantData(): void {
    // Get merchant ID only from route params (no localStorage fallback)
    const routeMerchantId = this.route.snapshot.paramMap.get('id');
    
    if (routeMerchantId) {
      this.merchantId = parseInt(routeMerchantId);
      console.log('Loading merchant data for ID:', this.merchantId);
      
      // Note: We don't set isLoading = true here to avoid button disable issues
      // this.isLoading = true;
      this.subscriptions.add(
        this.swaggerClient.apiMerchantGetDataByIdGet(this.merchantId).subscribe({
          next: (merchant) => {
            console.log('Merchant data loaded successfully:', merchant);
            this.currentMerchant = merchant;
            this.populateFormWithMerchant(merchant);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading merchant data:', error);
            this.initializeForm(); // Initialize empty form on error
            this.isLoading = false;
          }
        })
      );
    } else {
      console.log('No merchant ID found in URL, initializing empty form for new merchant');
      this.initializeForm(); // Initialize empty form for new merchant
    }
  }

  loadCurrentProfile(): void {
    // This method is now redundant as loadMerchantData handles everything
    // Keep it for backward compatibility but make it call loadMerchantData
    if (!this.currentMerchant && this.merchantId) {
      this.loadMerchantData();
    }
  }

  populateFormWithMerchant(merchant: MerchantDTO): void {
    if (!this.editForm || !merchant) {
      console.warn('Form not initialized or merchant data not available');
      return;
    }

    console.log('Populating form with merchant data:', merchant);

    // Populate basic merchant information (excluding cityId for now)
    this.editForm.patchValue({
      shopName: merchant.shopName || '',
      shortDescription: merchant.shortDescription || '',
      email: merchant.email || '',
      phone: merchant.mobileNo || '',
      whatsapp: merchant.whatsAppMobileNo || '',
      governorateId: merchant.governorateId || '',
      address: merchant.address || '',
      locationOnMap: merchant.locationOnMap || '',
      slug: merchant.slug || '',
      description: merchant.description || '',
      commercialRegistrationNumber: merchant.commercialRegistrationNumber || '',
      nationalIdNumber: merchant.nationalIdNumber || '',
      categories: merchant.categoriesDTO || [],
      categoriesIds: merchant.categoriesDTO?.map(c => c.id) || []
    });

    // Load cities for selected governorate and then set cityId
    if (merchant.governorateId) {
      console.log('Loading cities for governorate:', merchant.governorateId);
      console.log('Merchant cityId from API:', merchant.cityId);
      this.loadCities(merchant.governorateId).then(() => {
        console.log('Cities loaded successfully, count:', this.cities.length);
        if (merchant.cityId) {
          console.log('Setting cityId after cities loaded:', merchant.cityId);
          
          // Check if the city exists in the loaded cities
          const cityExists = this.cities.find(city => city.id === merchant.cityId);
          console.log('City exists in loaded cities:', cityExists);
          
          this.editForm.patchValue({
            cityId: merchant.cityId.toString() // Ensure it's a string
          });
          
          // Log the form value after setting
          console.log('Form cityId value after setting:', this.editForm.get('cityId')?.value);
        }
      }).catch(error => {
        console.error('Error loading cities for merchant:', error);
      });
    }

    // Populate business hours if available
    if (merchant.businessHours) {
      try {
        const businessHours = JSON.parse(merchant.businessHours);
        this.populateBusinessHours(businessHours);
      } catch (error) {
        console.warn('Error parsing business hours:', error);
      }
    }

    // Populate team members if available
    if (merchant.members && merchant.members.length > 0) {
      this.populateTeamMembers(merchant.members);
    }

    // Set preview images with proper URL construction
    if (merchant.logo) {
      console.log('Setting preview logo:', merchant.logo);
      this.previewLogo = this.constructImageUrl(merchant.logo);
      console.log('Preview logo URL:', this.previewLogo);
    } else {
      console.log('No logo found for merchant');
      this.previewLogo = null;
    }
    
    if (merchant.commercialRegistrationImage) {
      this.previewCommercialReg = this.constructImageUrl(merchant.commercialRegistrationImage);
    }
    if (merchant.nationalIdImage) {
      this.previewNationalId = this.constructImageUrl(merchant.nationalIdImage);
    }

    // Update progress after populating form
    this.calculateProgress();
    this.updateProgress();

    // Force change detection to update error states
    setTimeout(() => {
      this.editForm.updateValueAndValidity();
    }, 100);

    // Additional check to ensure cityId is set correctly after a small delay
    setTimeout(() => {
      if (merchant.cityId && this.editForm.get('cityId')?.value !== merchant.cityId.toString()) {
        console.log('⚠️ CityId not set correctly, retrying...');
        console.log('Expected:', merchant.cityId, 'Actual:', this.editForm.get('cityId')?.value);
        this.editForm.patchValue({
          cityId: merchant.cityId.toString()
        });
        console.log('✅ CityId set after retry:', this.editForm.get('cityId')?.value);
      }
    }, 1000);

    console.log('Form populated successfully');
  }

  initializeForm(): void {
    // Initialize form with empty values - data will be populated later in populateFormWithMerchant
    this.editForm = this.fb.group({
      shopName: ['', [Validators.required, Validators.minLength(3)]],
      shortDescription: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      whatsapp: [''],
      governorateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      address: ['', [Validators.required]],
      locationOnMap: ['', [Validators.required]],
      slug: [''],
      description: [''],
      commercialRegistrationNumber: ['', [Validators.required]],
      nationalIdNumber: ['', [Validators.required]],
      categories: [[]],
      categoriesIds: [[]],
      businessHours: this.fb.array([]),
      members: this.fb.array([])
    });

    // Initialize default businessHours FormArray only if no existing merchant data
    if (!this.currentMerchant) {
      const defaultBusinessHours = [
        { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true },
        { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true }
      ];
      defaultBusinessHours.forEach((bh: any) => this.businessHoursArray.push(
        this.fb.group({
          day: [bh.day],
          hours: [bh.hours],
          isOpen: [bh.isOpen],
          openTime: ['09:00'],
          closeTime: ['21:00']
        })
      ));

      // Add one default member to the team for new merchants
      this.addMember();
    }
  }

  createBusinessHoursArray(businessHours?: any[]): FormGroup[] {
    const defaultHours = [
      { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true },
      { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true }
    ];
    
    const hours = businessHours || defaultHours;
    return hours.map(hour => this.fb.group({
      day: [hour.day],
      hours: [hour.hours],
      isOpen: [hour.isOpen]
    }));
  }

  get businessHoursArray(): FormArray {
    return this.editForm.get('businessHours') as FormArray;
  }

  get membersArray(): FormArray {
    return this.editForm.get('members') as FormArray;
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewLogo = e.target.result;
        this.updateProgress(); // Update progress when logo is selected
        // Trigger change detection to update button state
        this.editForm.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedLogo(): void {
    this.selectedLogo = null;
    
    // If we're in edit mode and merchant has an existing logo, show it
    // If we're in create mode or no existing logo, show null
    if (this.currentMerchant?.logo) {
      this.previewLogo = this.constructImageUrl(this.currentMerchant.logo);
    } else {
      this.previewLogo = null;
    }
    
    this.updateProgress(); // Update progress when logo is removed
    // Trigger change detection to update button state
    this.editForm.updateValueAndValidity();
  }

  // Categories management
  isCategorySelected(categoryId: number): boolean {
    const selectedIds = this.editForm.get('categoriesIds')?.value || [];
    return selectedIds.includes(categoryId);
  }

  toggleCategory(categoryId: number): void {
    const currentIds = this.editForm.get('categoriesIds')?.value || [];
    const currentCategories = this.editForm.get('categories')?.value || [];
    let newIds: number[];
    let newCategories: any[];
    
    if (currentIds.includes(categoryId)) {
      // Remove category
      newIds = currentIds.filter((id: number) => id !== categoryId);
      newCategories = currentCategories.filter((cat: any) => cat.id !== categoryId);
    } else {
      // Add category - find complete category object
      const categoryToAdd = this.categories.find(c => c.id === categoryId);
      if (categoryToAdd) {
        newIds = [...currentIds, categoryId];
        newCategories = [...currentCategories, categoryToAdd];
      } else {
        return;
      }
    }
    
    // Update both categoriesIds and categories form controls
    this.editForm.patchValue({ 
      categoriesIds: newIds,
      categories: newCategories 
    });
  }

  addCategoryFromSuggestion(categoryName: string): void {
    // Find category by name in the loaded categories
    const category = this.categories.find(c => c.name === categoryName);
    if (category && !this.isCategorySelected(category.id!)) {
      this.toggleCategory(category.id!);
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  // Add category modal functions
  initializeNewCategoryForm(): void {
    this.newCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  showAddCategoryModal(): void {
    this.showAddCategoryForm = true;
    this.newCategoryForm.reset();
    
    // Prevent body scroll and save current scroll position
    document.body.classList.add('modal-open');
    document.body.style.top = `-${window.scrollY}px`;
  }

  hideAddCategoryModal(): void {
    this.showAddCategoryForm = false;
    this.newCategoryForm.reset();
    
    // Restore body scroll and scroll position
    const scrollY = document.body.style.top;
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }

  onCategoryAdded(newCategory: CategoryDTO): void {
    // Add to local categories list
    this.categories.push(newCategory);
    
    // Auto select the new category
    if (newCategory.id) {
      this.toggleCategory(newCategory.id);
    }
    
    this.showToast('تم إضافة التصنيف بنجاح', 'success');
  }

  // Select/Deselect all categories functions
  selectAllCategories(): void {
    const allCategoryIds = this.categories.map(c => c.id!).filter(id => id);
    const allCategories = this.categories.slice(); // Copy all categories
    this.editForm.patchValue({ 
      categoriesIds: allCategoryIds,
      categories: allCategories 
    });
  }

  clearAllCategories(): void {
    this.editForm.patchValue({ 
      categoriesIds: [],
      categories: [] 
    });
  }

  // Document upload methods
  onCommercialRegSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCommercialReg = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewCommercialReg = e.target.result;
        this.updateProgress(); // Update progress when document is selected
      };
      reader.readAsDataURL(file);
    }
  }

  onNationalIdSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedNationalId = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewNationalId = e.target.result;
        this.updateProgress(); // Update progress when document is selected
      };
      reader.readAsDataURL(file);
    }
  }

  removeCommercialReg(): void {
    this.selectedCommercialReg = null;
    this.previewCommercialReg = null;
  }

  removeNationalId(): void {
    this.selectedNationalId = null;
    this.previewNationalId = null;
  }

  // Members management methods
  addMember(): void {
    // Password is required for new members in create mode, optional in update mode
    const passwordValidators = this.isUpdateMode() 
      ? [EditProfileComponent.passwordValidator] // Optional but validated if filled
      : [Validators.required, Validators.minLength(8), EditProfileComponent.passwordValidator]; // Required for new merchants
    
    const confirmPasswordValidators = this.isUpdateMode()
      ? [] // Optional in update mode
      : [Validators.required]; // Required for new merchants

    const memberGroup = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', EditProfileComponent.optionalEmailValidator], // Optional but validated if filled
      position: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', passwordValidators],
      confirmPassword: ['', confirmPasswordValidators]
    }, { validators: EditProfileComponent.passwordMatchValidator });

    this.membersArray.push(memberGroup);
    
    // Subscribe to member form changes to update progress
    memberGroup.valueChanges.subscribe(() => {
      this.updateProgress();
    });
  }

  removeMember(index: number): void {
    this.membersArray.removeAt(index);
    this.updateProgress(); // Update progress when member is removed
  }

  getMemberControl(index: number): FormGroup {
    return this.membersArray.at(index) as FormGroup;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Get password validation errors
  getPasswordErrors(memberIndex: number): string[] {
    const memberGroup = this.getMemberControl(memberIndex);
    const passwordControl = memberGroup.get('password');
    const errors: string[] = [];

    if (passwordControl?.errors && passwordControl.touched) {
      if (passwordControl.errors['required']) {
        errors.push('كلمة المرور مطلوبة');
      }
      if (passwordControl.errors['minlength']) {
        errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      }
      if (passwordControl.errors['passwordStrength']) {
        const strength = passwordControl.errors['passwordStrength'];
        if (!strength.isValidLength) {
          errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        }
        if (!strength.hasUpper) {
          errors.push('يجب أن تحتوي على حرف كبير (A-Z)');
        }
        if (!strength.hasLower) {
          errors.push('يجب أن تحتوي على حرف صغير (a-z)');
        }
        if (!strength.hasNumber) {
          errors.push('يجب أن تحتوي على رقم (0-9)');
        }
        if (!strength.hasSpecial) {
          errors.push('يجب أن تحتوي على رمز خاص (#?!@$%^&*-)');
        }
      }
    }
    return errors;
  }

  // Check if passwords match
  hasPasswordMismatch(memberIndex: number): boolean {
    const memberGroup = this.getMemberControl(memberIndex);
    const confirmPasswordControl = memberGroup.get('confirmPassword');
    return confirmPasswordControl?.errors?.['passwordMismatch'] && confirmPasswordControl.touched;
  }

  toggleBusinessDay(index: number): void {
    
    const dayFormGroup = this.businessHoursArray.at(index) as FormGroup;
    const isOpenControl = dayFormGroup.get('isOpen');
    
    if (isOpenControl) {
      const currentValue = isOpenControl.value;
      const newValue = !currentValue;
      
      
      isOpenControl.setValue(newValue);
      dayFormGroup.updateValueAndValidity();
      
      // Update progress when business hours change
      this.updateProgress();
      
      // Force change detection
      setTimeout(() => {
        
      }, 100);
    }
  }

  onSubmit(): void {
    console.log('=== Starting onSubmit ===');
    console.log('isLoading before submit:', this.isLoading);
    
    // Reset isLoading at the start to ensure clean state
    this.isLoading = false;
    
    console.log('Form valid:', this.editForm.valid);
    console.log('Form value:', this.editForm.value);
    // Check for required files and members
    const missingFiles: string[] = [];
    
    // Logo check: different logic for create vs edit mode
    if (!this.isUpdateMode()) {
      // Create mode: selectedLogo is required
      if (!this.selectedLogo) {
        missingFiles.push('صورة شعار المتجر مطلوبة');
      }
    } else {
      // Edit mode: either selectedLogo (new) OR existing logo from API
      if (!this.selectedLogo && (!this.currentMerchant?.logo || this.currentMerchant.logo.trim() === '')) {
        missingFiles.push('صورة شعار المتجر مطلوبة');
      }
    }
    
    // Documents check: different logic for create vs edit mode  
    if (!this.isUpdateMode()) {
      // Create mode: both documents required
      if (!this.selectedNationalId) {
        missingFiles.push('صورة بطاقة الهوية مطلوبة');
      }
      if (!this.selectedCommercialReg) {
        missingFiles.push('صورة السجل التجاري مطلوبة');
      }
    } else {
      // Edit mode: either new files OR existing files from API
      if (!this.selectedNationalId && (!this.currentMerchant?.nationalIdImage || this.currentMerchant.nationalIdImage.trim() === '')) {
        missingFiles.push('صورة بطاقة الهوية مطلوبة');
      }
      if (!this.selectedCommercialReg && (!this.currentMerchant?.commercialRegistrationImage || this.currentMerchant.commercialRegistrationImage.trim() === '')) {
        missingFiles.push('صورة السجل التجاري مطلوبة');
      }
    }
    
    // Check for team members
    const formMembers = this.editForm.value.members || [];
    if (formMembers.length === 0) {
      missingFiles.push('يجب إضافة عضو واحد على الأقل إلى فريق العمل');
    } else {
      // Check if at least one member is complete
      // In update mode, password is optional for existing members
      const hasValidMember = formMembers.some((member: any) => {
        const basicInfoComplete = member.name?.trim() && 
                                 member.phone?.trim() && 
                                 member.username?.trim() && 
                                 member.position?.trim();
        
        if (this.isUpdateMode()) {
          // In update mode, password is optional (empty password means keep existing)
          return basicInfoComplete;
        } else {
          // In create mode, password is required
          return basicInfoComplete && member.password?.trim();
        }
      });
      
      if (!hasValidMember) {
        const passwordRequirement = this.isUpdateMode() ? '' : ' وكلمة المرور';
        missingFiles.push(`يجب إكمال بيانات عضو واحد على الأقل في فريق العمل (الاسم، الهاتف، اسم المستخدم، المنصب${passwordRequirement})`);
      }
    }
    
    if (missingFiles.length > 0) {
      
      this.isLoading = false; // Reset isLoading if validation fails
      this.updateErrors = missingFiles;
      this.showToast('يرجى تحديد جميع الوثائق المطلوبة (شعار المتجر، بطاقة الهوية، السجل التجاري) وإكمال بيانات فريق العمل', 'error');
      return;
    }
    
    if (this.editForm.valid) {
      
      
      // this.isLoading = true;
      this.updateErrors = [];

      const formValue = this.editForm.value;
      // Prepare FormData for new MerchantDTO - using exact API parameter names (PascalCase)
      const formData = new FormData();
      
      // ملاحظة: API يتطلب Id حتى لو كان إنشاء جديد
      const merchantIdForSubmit = this.isUpdateMode() && this.merchantId ? this.merchantId.toString() : '0';
      formData.append('Id', merchantIdForSubmit);
      console.log('📤 Merchant ID for submit:', merchantIdForSubmit, '(Update mode:', this.isUpdateMode(), ')');
      
      // معلومات أساسية - بأسماء API الصحيحة
      formData.append('ShopName', formValue.shopName || '');
      formData.append('Description', formValue.description || '');
      formData.append('ShortDescription', formValue.shortDescription || '');
      formData.append('Address', formValue.address || '');
      formData.append('LocationOnMap', formValue.locationOnMap || '');  // ✅ API name
      formData.append('Slug', formValue.slug || this.generateSlug(formValue.shopName || 'merchant'));
      
      // معلومات الاتصال - مطلوبة ومهمة
      formData.append('MobileNo', formValue.phone || '');              // ✅ API name
      formData.append('WhatsAppMobileNo', formValue.whatsapp || '');   // ✅ API name
      formData.append('Email', formValue.email || '');                 // ✅ API name
      
      // الموقع الجغرافي
      formData.append('GovernorateId', formValue.governorateId ? formValue.governorateId.toString() : '');
      formData.append('CityId', formValue.cityId ? formValue.cityId.toString() : '');
      
      // الوثائق الرسمية
      formData.append('CommercialRegistrationNumber', formValue.commercialRegistrationNumber || '');
      formData.append('NationalIdNumber', formValue.nationalIdNumber || '');
      
      // التصنيفات المختارة - Complete Category Objects
      const selectedCategories = formValue.categories || [];
      const selectedCategoriesIds = formValue.categoriesIds || [];
      
      
      
      if (selectedCategories.length > 0) {
        // إرسال كل category object منفصلاً (indexed approach with PascalCase) 
        selectedCategories.forEach((category: any, index: number) => {
          formData.append(`Categories[${index}].Id`, category.id?.toString() || '');
          formData.append(`Categories[${index}].Name`, category.name || ''); // ✅ PascalCase Name
          formData.append(`Categories[${index}].Description`, category.description || '');
          formData.append(`Categories[${index}].Image`, category.image || '');
          
        });
        
        // إرسال التصنيفات الكاملة كـ JSON string واحد للـ server (complete objects with PascalCase)
        const categoriesForServer = selectedCategories.map((category: any) => ({
          Id: category.id || 0,
          Name: category.name || '', // ✅ Changed to PascalCase Name
          Description: category.description || '',
          Image: category.image || ''
        }));
        
        const categoriesJson = JSON.stringify(categoriesForServer);
        formData.append('CategoriesJson', categoriesJson);
        
        // الاحتفاظ بـ IDs approach للـ backward compatibility
        selectedCategoriesIds.forEach((categoryId: number, index: number) => {
          formData.append(`CategoriesIds[${index}]`, categoryId.toString());
        });
        
        
        
        
        
      } else {
        // إذا لم تكن هناك تصنيفات، أرسل array فارغ
        formData.append('Categories', '[]');
        formData.append('CategoriesIds', '[]');
        formData.append('CategoriesJson', '[]');
        
      }
      
      // ساعات العمل
      formData.append('BusinessHours', this.generateBusinessHoursString());
      
      // الحقول الافتراضية
      formData.append('Rating', '0');
      formData.append('RatingCount', '0');
      formData.append('IsFavoriteMerchant', 'false');
      
      // أعضاء الفريق - إرسال كـ JSON للـ server ليقوم بـ deserialize
      const members = formValue.members || [];
      
      
      if (members.length > 0) {
        // تحضير أعضاء الفريق بـ MemberDTO format
        const memberDTOArray: any[] = [];
        
        members.forEach((member: any, index: number) => {
          // Create UserDTO for the member
          const userDTO = new UserDTO();
          userDTO.id = member.userId || 0; // Use existing userId if available
          userDTO.nationalId = member.phone || ''; // نستخدم الهاتف كـ national ID مؤقتاً
          userDTO.userName = member.username || '';
          userDTO.fullName = member.name || '';
          userDTO.email = member.email || '';
          
          // Handle password: only send if provided (for new members or password changes)
          if (member.password && member.password.trim()) {
            userDTO.passwordHash = member.password; // سيتم hash في الـ backend
          } else {
            // In update mode, empty password means keep existing password
            userDTO.passwordHash = this.isUpdateMode() ? '' : member.password || '';
          }
          
          userDTO.phoneNumber = member.phone || '';
          userDTO.userType = UserTypeEnum.Merchant; // نوع المستخدم: بائع
          userDTO.isActive = true;
          userDTO.address = member.position || ''; // نستخدم المنصب كعنوان مؤقت
          
          // Create MemberDTO with UserDTO
          const memberDTO = new MemberDTO();
          memberDTO.id = member.id || 0; // Use existing member ID if available
          memberDTO.userId = member.userId || 0; // سيتم تعيينه في الـ backend
          memberDTO.merchantId = this.merchantId || 0;
          memberDTO.role = member.position || 'موظف';
          memberDTO.merchantMember = userDTO;
          
          console.log('🧑‍💼 Created MemberDTO:', memberDTO);
          
          // تحويل إلى plain object باستخدام toJSON()
          const memberJsonObj = memberDTO.toJSON();
          
          // تحويل إلى PascalCase كما هو مطلوب في C# API
          const memberWithPascalCase = this.convertMemberDTOToPascalCase(memberJsonObj);
          memberDTOArray.push(memberWithPascalCase);
          
          console.log('📤 Member with PascalCase:', memberWithPascalCase);
          
          
          
          // إرسال كل عضو منفصلاً أيضاً (backup approach)
          const memberJsonString = JSON.stringify(memberJsonObj);
          formData.append(`Members[${index}]`, memberJsonString);
          
        });
        
        // إرسال أعضاء الفريق كـ JSON string واحد للـ server
        const membersJsonString = JSON.stringify(memberDTOArray);
        formData.append('MembersJson', membersJsonString);
        
        console.log('📤 Final MembersJson being sent:', membersJsonString);
        console.log('📤 MemberDTO Array count:', memberDTOArray.length);
        
        // Log the actual MemberDTO structure being sent with PascalCase
        console.log('📋 Sample MemberDTO structure:', memberDTOArray[0]);
        
      } else {
        // إذا لم يكن هناك أعضاء، أرسل array فارغ
        formData.append('MembersJson', '[]');
        
      }
      
      // الملفات المطلوبة - بأسماء API الصحيحة
      // Logo handling
      if (this.selectedLogo) {
        // New logo selected - send file via LogoForm
        formData.append('LogoForm', this.selectedLogo);
        console.log('📤 Sending new logo file:', this.selectedLogo.name);
      } else if (this.isUpdateMode() && this.currentMerchant?.logo) {
        // Edit mode with existing logo - send existing logo filename only (no LogoForm)
        formData.append('Logo', this.currentMerchant.logo);
        console.log('📤 Keeping existing logo:', this.currentMerchant.logo);
      } else if (!this.isUpdateMode()) {
        // Create mode requires LogoForm - this shouldn't happen if validation works
        formData.append('LogoForm', new Blob(), '');
        console.log('⚠️ No logo provided for create mode');
      }
      
      // National ID handling
      if (this.selectedNationalId) {
        // New national ID selected - send file via NationalIdImageForm
        formData.append('NationalIdImageForm', this.selectedNationalId);
        console.log('📤 Sending new national ID file:', this.selectedNationalId.name);
      } else if (this.isUpdateMode() && this.currentMerchant?.nationalIdImage) {
        // Edit mode with existing national ID - send existing filename only (no NationalIdImageForm)
        formData.append('NationalIdImage', this.currentMerchant.nationalIdImage);
        console.log('📤 Keeping existing national ID:', this.currentMerchant.nationalIdImage);
      } else if (!this.isUpdateMode()) {
        // Create mode requires NationalIdImageForm - this shouldn't happen if validation works
        formData.append('NationalIdImageForm', new Blob(), '');
        console.log('⚠️ No national ID provided for create mode');
      }
      
      // Commercial Registration handling
      if (this.selectedCommercialReg) {
        // New commercial reg selected - send file via CommercialRegistrationImageForm
        formData.append('CommercialRegistrationImageForm', this.selectedCommercialReg);
        console.log('📤 Sending new commercial reg file:', this.selectedCommercialReg.name);
      } else if (this.isUpdateMode() && this.currentMerchant?.commercialRegistrationImage) {
        // Edit mode with existing commercial reg - send existing filename only (no CommercialRegistrationImageForm)
        formData.append('CommercialRegistrationImage', this.currentMerchant.commercialRegistrationImage);
        console.log('📤 Keeping existing commercial reg:', this.currentMerchant.commercialRegistrationImage);
      } else if (!this.isUpdateMode()) {
        // Create mode requires CommercialRegistrationImageForm - this shouldn't happen if validation works
        formData.append('CommercialRegistrationImageForm', new Blob(), '');
        console.log('⚠️ No commercial registration provided for create mode');
      }
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      try {
        // Use forEach instead of entries() for better TypeScript compatibility
        (formData as any).forEach((value: any, key: string) => {
          if (key === 'MembersJson' || key.startsWith('Members[') || key === 'CategoriesJson' || key.startsWith('CategoriesIds[')) {
            
            if (typeof value === 'string') {
              try {
                const parsed = JSON.parse(value);
                
              } catch (e) {
                
              }
            }
          } else {
            
          }
        });
      } catch (e) {
        
        
        // Alternative method to check FormData - enhanced for Members
        
        const keys = ['MembersJson', 'ShopName', 'MobileNo', 'WhatsAppMobileNo', 'LocationOnMap'];
        keys.forEach(key => {
          const values = (formData as any).getAll(key);
          if (values && values.length > 0) {
            
            if (key === 'MembersJson') {
              values.forEach((val: any, idx: number) => {
                
                if (typeof val === 'string') {
                  try {
                    const parsed = JSON.parse(val);
                    
                  } catch (e) {
                    
                  }
                }
              });
            }
          }
        });
        
        // Check for indexed Members entries
        
        for (let i = 0; i < 5; i++) {
          const memberKey = `Members[${i}]`;
          const memberValues = (formData as any).getAll(memberKey);
          if (memberValues && memberValues.length > 0) {
            
          }
        }
      }
      

      // Send using HttpClient with proper endpoints
      // Use different endpoints for create vs update
      if (this.isUpdateMode() && this.merchantId) {
        const apiUrl = `/api/Merchant/UpdateMerchant/${this.merchantId}`;
        console.log('📤 API Endpoint:', apiUrl, '(Update mode for merchant ID:', this.merchantId, ')');
        
        this.subscriptions.add(
          this.http.post(apiUrl, formData).subscribe({
            next: (response: any) => {
              console.log('✅ Update response:', response);
              this.isLoading = false;
              if (response) {
                const successMessage = this.isAdminMode ? 'تم تحديث بيانات التاجر بنجاح' : 'تم تحديث الملف التجاري بنجاح';
                this.showToast(successMessage, 'success');
                
                this.merchantId = response.id;
                setTimeout(() => {
                  if (this.isAdminMode) {
                    this.router.navigate(['/admin']);
                  } else {
                    this.router.navigate(['/merchant-profile']);
                  }
                }, 1500);
              } else {
                this.showToast('حدث خطأ أثناء تحديث البيانات', 'error');
              }
            },
            error: (error) => {
              console.error('❌ Update error:', error);
              this.isLoading = false;
              this.handleApiError(error);
            }
          })
        );
      } else {
        const apiUrl = '/api/Merchant/InsertMerchant';
        console.log('📤 API Endpoint:', apiUrl, '(Insert mode for new merchant)');
        
        this.subscriptions.add(
          this.http.post(apiUrl, formData).subscribe({
            next: (response: any) => {
              console.log('✅ Insert response:', response);
              this.isLoading = false;
              if (response) {
                const successMessage = this.isAdminMode ? 'تم إضافة التاجر الجديد بنجاح' : 'تم إنشاء الملف التجاري بنجاح';
                this.showToast(successMessage, 'success');
                
                // Reset form completely after successful save
                this.resetFormToInitialState();
                
                this.merchantId = response.id;
                setTimeout(() => {
                  if (this.isAdminMode) {
                    this.router.navigate(['/admin']);
                  } else {
                    this.router.navigate(['/merchant-profile']);
                  }
                }, 1500);
              } else {
                this.showToast('حدث خطأ أثناء حفظ البيانات', 'error');
              }
            },
            error: (error) => {
              console.error('❌ Insert error:', error);
              this.isLoading = false;
              this.handleApiError(error);
            }
          })
        );
      }
    } else {
      
      this.isLoading = false; // Reset isLoading if form validation fails
      this.markAllFieldsAsTouched(); // Use the enhanced function
      this.updateErrors = ['يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح'];
      this.showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
    }
  }

  // Reset form to completely clean initial state
  resetFormToInitialState(): void {
    
    
    // Clear all selected files and previews
    this.selectedLogo = null;
    this.selectedNationalId = null;
    this.selectedCommercialReg = null;
    this.previewLogo = null;
    this.previewNationalId = null;
    this.previewCommercialReg = null;
    
    // Reset current merchant data
    this.currentMerchant = null;
    this.merchantId = null;
    
    // Clear any errors
    this.updateErrors = [];
    
    // Reset step to first step
    this.currentStep = 1;
    
    // Reset all step completion status
    this.steps.forEach(step => step.completed = false);
    
    // Reset progress
    this.progressPercentage = 0;
    this.completedSteps = 0;
    
    // Clear arrays completely and reinitialize
    while (this.businessHoursArray.length !== 0) {
      this.businessHoursArray.removeAt(0);
    }
    
    while (this.membersArray.length !== 0) {
      this.membersArray.removeAt(0);
    }
    
    // Reinitialize form with completely clean data
    this.initializeCleanForm();
    
    
  }

  // Initialize completely clean form (no merchant data)
  initializeCleanForm(): void {
    this.editForm = this.fb.group({
      shopName: ['', [Validators.required, Validators.minLength(3)]],
      shortDescription: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      whatsapp: [''],
      governorateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      address: ['', [Validators.required]],
      locationOnMap: ['', [Validators.required]],
      slug: [''],
      description: [''],
      commercialRegistrationNumber: ['', [Validators.required]],
      nationalIdNumber: ['', [Validators.required]],
      categories: [[]],
      categoriesIds: [[]],
      businessHours: this.fb.array([]),
      members: this.fb.array([])
    });

    // Initialize businessHours FormArray with default clean data
    const defaultBusinessHours = [
      { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true, openTime: '14:00', closeTime: '20:00' }
    ];
    
    defaultBusinessHours.forEach((bh: any) => this.businessHoursArray.push(
      this.fb.group({
        day: [bh.day],
        hours: [bh.hours],
        isOpen: [bh.isOpen],
        openTime: [bh.openTime],
        closeTime: [bh.closeTime]
      })
    ));

    // Add one clean member to the team
    this.addMember();

    // Subscribe to form changes for progress tracking
    this.editForm.valueChanges.subscribe(() => {
      this.updateProgress();
      
    });
    
    // Initial progress calculation
    this.updateProgress();

    
  }

  markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    if (this.isAdminMode) {
      // If in admin mode, go back to admin dashboard
      this.router.navigate(['/admin']);
    } else {
      // Normal back navigation
      this.location.back();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (field.errors['minlength']) return 'يجب أن يكون أكثر من 3 أحرف';
    }
    return '';
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  private handleApiError(error: any): void {
    let errorMessages: string[] = [];
    if (error.error) {
      try {
        let errorObj: any;
        if (typeof error.error === 'string') {
          errorObj = JSON.parse(error.error);
        } else {
          errorObj = error.error;
        }
        if (errorObj.errors) {
          Object.keys(errorObj.errors).forEach(key => {
            const fieldErrors = errorObj.errors[key];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((msg: string) => {
                errorMessages.push(`${key}: ${msg}`);
              });
            } else {
              errorMessages.push(`${key}: ${fieldErrors}`);
            }
          });
        } else if (errorObj.message) {
          errorMessages.push(errorObj.message);
        } else if (errorObj.title) {
          errorMessages.push(errorObj.title);
        }
      } catch (parseError) {
        errorMessages.push(error.error.toString());
      }
    } else if (error.message) {
      errorMessages.push(error.message);
    }
    if (errorMessages.length === 0) {
      errorMessages.push('حدث خطأ غير متوقع أثناء حفظ البيانات');
    }
    this.updateErrors = errorMessages;
    this.showToast('حدث خطأ أثناء حفظ الملف التجاري', 'error');
  }

  isUpdateMode(): boolean {
    return this.merchantId !== null && this.merchantId > 0;
  }

  getMerchantTitle(): string {
    if (this.isAdminMode) {
      return this.isUpdateMode() ? 'تحديث بيانات التاجر (وضع الأدمن)' : 'إضافة تاجر جديد (وضع الأدمن)';
    }
    return this.isUpdateMode() ? 'تحديث الملف التجاري' : 'إنشاء ملف تجاري جديد';
  }

  getDayControl(index: number): FormGroup {
    return this.businessHoursArray.at(index) as FormGroup;
  }

  // Helper method to convert UserDTO to PascalCase for C# API
  private convertUserDTOToPascalCase(userDTO: any): any {
    return {
      Id: userDTO.id || 0,
      NationalId: userDTO.nationalId || '',
      UserName: userDTO.userName || '',
      FullName: userDTO.fullName || '',
      Email: userDTO.email || '',
      PasswordHash: userDTO.passwordHash || '',
      Photo: userDTO.photo || '',
      UserType: userDTO.userType || UserTypeEnum.Merchant,
      PhoneNumber: userDTO.phoneNumber || '',
      Address: userDTO.address || '',
      IsActive: userDTO.isActive !== undefined ? userDTO.isActive : true
    };
  }

  // Helper method to convert MemberDTO to PascalCase for C# API
  private convertMemberDTOToPascalCase(memberDTO: any): any {
    return {
      Id: memberDTO.id || 0,
      UserId: memberDTO.userId || 0,
      MerchantId: memberDTO.merchantId || 0,
      Role: memberDTO.role || '',
      MerchantMember: memberDTO.merchantMember ? this.convertUserDTOToPascalCase(memberDTO.merchantMember) : null
    };
  }

  // Helper functions for required fields
  generateSlug(shopName: string): string {
    return shopName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  generateBusinessHoursString(): string {
    const businessHours = this.businessHoursArray.value || [];
    return JSON.stringify(businessHours);
  }

  getSelectedCityName(): string {
    const cityId = this.editForm.get('cityId')?.value;
    const city = this.cities.find(c => c.id == cityId);
    return city?.nameAr || '';
  }

  getSelectedCityNameEn(): string {
    const cityId = this.editForm.get('cityId')?.value;
    const city = this.cities.find(c => c.id == cityId);
    return city?.nameAr || ''; // Use nameAr as there's no nameEn in CityLookupDto
  }

  getSelectedGovernorateName(): string {
    const governorateId = this.editForm.get('governorateId')?.value;
    const governorate = this.governorates.find(g => g.id == governorateId);
    return governorate?.name || '';
  }

  markAllFieldsAsTouched(): void {
    // Mark main form controls as touched
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
      
      // Mark FormArray controls as touched
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
          
          // Mark nested FormGroup controls as touched
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              arrayControl.get(nestedKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  getFormValidationErrors(): any {
    let formErrors: any = {};
    
    if (!this.editForm) return formErrors;

    // Check main form controls
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control?.errors) {
        formErrors[key] = control.errors;
      }

      // Check FormArray controls (like members, specialties, businessHours)
      if (control instanceof FormArray) {
        const arrayErrors: any[] = [];
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl.errors) {
            arrayErrors[index] = arrayControl.errors;
          }
          
          // Check nested FormGroup in FormArray (like members)
          if (arrayControl instanceof FormGroup) {
            const groupErrors: any = {};
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              const nestedControl = arrayControl.get(nestedKey);
              if (nestedControl?.errors) {
                groupErrors[nestedKey] = nestedControl.errors;
              }
            });
            if (Object.keys(groupErrors).length > 0) {
              arrayErrors[index] = groupErrors;
            }
          }
        });
        
        if (arrayErrors.length > 0 && arrayErrors.some(item => item)) {
          formErrors[key] = arrayErrors;
        }
      }
    });

    return formErrors;
  }

  logFieldDetails(): void {
    // Required fields check
    const requiredFields = [
      'shopName', 'phone', 'email', 'governorateId', 'cityId', 
      'address', 'locationOnMap', 'commercialRegistrationNumber', 'nationalIdNumber'
    ];

    requiredFields.forEach(field => {
      const control = this.editForm.get(field);
    });

    // Members array check
    
    this.membersArray.controls.forEach((member, index) => {
      const memberGroup = member as FormGroup;
    });
  }

  // Progress bar calculation methods
  calculateProgress(): void {
    let completed = 0;
    
    // Check logo
    if (this.isLogoComplete()) completed++;
    
    // Check basic info (shopName, phone, governorateId, cityId, address)
    if (this.isBasicInfoComplete()) completed++;
    
    // Check location (locationOnMap)
    if (this.isLocationComplete()) completed++;
    
    // Check documents (nationalId and commercial registration)
    if (this.isDocumentsComplete()) completed++;
    
    // Check team (at least one member with valid data)
    if (this.isTeamComplete()) completed++;
    
    // Check business hours (all days configured)
    if (this.isBusinessHoursComplete()) completed++;
    
    // Check categories (at least one category selected)
    if (this.isCategoriesComplete()) completed++;
    
    // Check description
    if (this.isDescriptionComplete()) completed++;
    
    this.completedSteps = completed;
    this.progressPercentage = Math.round((completed / this.totalSteps) * 100);
  }

  isBasicInfoComplete(): boolean {
    const form = this.editForm;
    if (!form) return false;
    
    const shopName = form.get('shopName')?.value?.trim();
    const phone = form.get('phone')?.value?.trim();
    const email = form.get('email')?.value?.trim();
    const governorateId = form.get('governorateId')?.value;
    const cityId = form.get('cityId')?.value;
    const address = form.get('address')?.value?.trim();
    
    // Check if form controls are valid (not just filled)
    const shopNameValid = form.get('shopName')?.valid;
    const phoneValid = form.get('phone')?.valid;
    const emailValid = form.get('email')?.valid;
    const governorateValid = form.get('governorateId')?.valid;
    const cityValid = form.get('cityId')?.valid;
    const addressValid = form.get('address')?.valid;
    
    const isComplete = !!(
      shopName &&
      phone &&
      email &&
      // governorateId &&
      // cityId &&
      // address &&
      shopNameValid &&
      phoneValid &&
      emailValid 
      // governorateValid &&
      // cityValid &&
      // addressValid
    );
    
    return isComplete;
  }

  isLocationComplete(): boolean {
    return !!(this.editForm?.get('locationOnMap')?.value?.trim());
  }

  isDocumentsComplete(): boolean {
    // For new merchants (create mode): both documents must be selected
    if (!this.isUpdateMode()) {
      return !!(this.selectedNationalId && this.selectedCommercialReg);
    }
    
    // For existing merchants (edit mode): either new documents OR existing documents from API
    const hasNewNationalId = !!(this.selectedNationalId);
    const hasExistingNationalId = !!(this.currentMerchant?.nationalIdImage && this.currentMerchant.nationalIdImage.trim() !== '');
    
    const hasNewCommercialReg = !!(this.selectedCommercialReg);
    const hasExistingCommercialReg = !!(this.currentMerchant?.commercialRegistrationImage && this.currentMerchant.commercialRegistrationImage.trim() !== '');
    
    const nationalIdComplete = hasNewNationalId || hasExistingNationalId;
    const commercialRegComplete = hasNewCommercialReg || hasExistingCommercialReg;
    
    console.log('Documents completion check (Edit Mode):');
    console.log('- National ID: new =', hasNewNationalId, ', existing =', hasExistingNationalId, ', complete =', nationalIdComplete);
    console.log('- Commercial Reg: new =', hasNewCommercialReg, ', existing =', hasExistingCommercialReg, ', complete =', commercialRegComplete);
    
    return nationalIdComplete && commercialRegComplete;
  }

  isLogoComplete(): boolean {
    // For new merchants (create mode): selectedLogo must be present
    if (!this.isUpdateMode()) {
      return !!(this.selectedLogo);
    }
    
    // For existing merchants (edit mode): either new logo selected OR existing logo from API
    const hasNewLogo = !!(this.selectedLogo);
    const hasExistingLogo = !!(this.currentMerchant?.logo && this.currentMerchant.logo.trim() !== '');
    
    console.log('Logo completion check (Edit Mode):');
    console.log('- Has new logo (selectedLogo):', hasNewLogo);
    console.log('- Has existing logo (API):', hasExistingLogo, this.currentMerchant?.logo);
    console.log('- Logo complete result:', hasNewLogo || hasExistingLogo);
    
    return hasNewLogo || hasExistingLogo;
  }

  isTeamComplete(): boolean {
    if (this.membersArray.length === 0) return false;
    
    // Check if at least one member has all required fields filled
    return this.membersArray.controls.some(member => {
      const memberGroup = member as FormGroup;
      const basicInfoComplete = !!(
        memberGroup.get('name')?.value?.trim() &&
        memberGroup.get('phone')?.value?.trim() &&
        memberGroup.get('position')?.value?.trim() &&
        memberGroup.get('username')?.value?.trim()
      );
      
      if (this.isUpdateMode()) {
        // In update mode, password is optional
        return basicInfoComplete && memberGroup.valid;
      } else {
        // In create mode, password is required
        return basicInfoComplete && 
               memberGroup.get('password')?.value?.trim() &&
               memberGroup.valid;
      }
    });
  }

  isBusinessHoursComplete(): boolean {
    // Check if business hours are configured (at least one day is open)
    return this.businessHoursArray.controls.some(day => {
      const dayGroup = day as FormGroup;
      return dayGroup.get('isOpen')?.value === true;
    });
  }

  // Call this method on form changes to update progress
  updateProgress(): void {
    this.calculateProgress();
  }

  // Get progress step details for display
  getProgressSteps(): any[] {
    return [
      {
        name: 'المعلومات الأساسية',
        completed: this.isBasicInfoComplete(),
        icon: 'fas fa-info-circle'
      },
      {
        name: 'الموقع والعنوان',
        completed: this.isLocationComplete(),
        icon: 'fas fa-map-marker-alt'
      },
      {
        name: 'الوثائق الرسمية',
        completed: this.isDocumentsComplete(),
        icon: 'fas fa-file-shield'
      },
      {
        name: 'شعار المتجر (إجباري)',
        completed: this.isLogoComplete(),
        icon: 'fas fa-image'
      },
      {
        name: 'فريق العمل',
        completed: this.isTeamComplete(),
        icon: 'fas fa-users'
      },
      {
        name: 'ساعات العمل',
        completed: this.isBusinessHoursComplete(),
        icon: 'fas fa-clock'
      }
    ];
  }

  // Check if the form is ready for submission (including logo)
  isFormReadyForSubmit(): boolean {
    console.log('Checking form readiness for submission...');
    console.log('Edit Form Valid:', this.editForm.valid);
    console.log('Logo Complete:', this.isLogoComplete());
    console.log('Documents Complete:', this.isDocumentsComplete());
    console.log('Team Complete:', this.isTeamComplete());
    console.log('isLoading:', this.isLoading);

    const formReady = this.editForm.valid && this.isLogoComplete() && this.isDocumentsComplete() && this.isTeamComplete();
    
    console.log('Form ready result (without isLoading):', formReady);

    return formReady;
  }

  // Check if logo section should have error styling
  hasLogoError(): boolean {
    return !this.isLogoComplete();
  }

  // Check if commercial registration has error
  hasCommercialRegError(): boolean {
    // For new merchants (create mode): selectedCommercialReg is required
    if (!this.isUpdateMode()) {
      return !this.selectedCommercialReg;
    }
    
    // For existing merchants (edit mode): either new file OR existing file from API
    const hasNewCommercialReg = !!(this.selectedCommercialReg);
    const hasExistingCommercialReg = !!(this.currentMerchant?.commercialRegistrationImage && this.currentMerchant.commercialRegistrationImage.trim() !== '');
    
    return !hasNewCommercialReg && !hasExistingCommercialReg;
  }

  // Check if national ID has error
  hasNationalIdError(): boolean {
    // For new merchants (create mode): selectedNationalId is required
    if (!this.isUpdateMode()) {
      return !this.selectedNationalId;
    }
    
    // For existing merchants (edit mode): either new file OR existing file from API
    const hasNewNationalId = !!(this.selectedNationalId);
    const hasExistingNationalId = !!(this.currentMerchant?.nationalIdImage && this.currentMerchant.nationalIdImage.trim() !== '');
    
    return !hasNewNationalId && !hasExistingNationalId;
  }

  // Step navigation methods
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.markCurrentStepAsCompleted();
      this.currentStep++;
      this.updateProgress();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(stepNumber: number): void {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.markCurrentStepAsCompleted();
      this.currentStep = stepNumber;
      this.updateProgress();
    }
  }

  markCurrentStepAsCompleted(): void {
    if (this.isCurrentStepValid()) {
      const step = this.steps.find(s => s.id === this.currentStep);
      if (step) {
        step.completed = true;
      }
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1: // Logo
        return this.isLogoComplete();
      case 2: // Basic Info
        return this.isBasicInfoComplete();
      case 3: // Location
        return this.isLocationComplete();
      case 4: // Documents
        return this.isDocumentsComplete();
      case 5: // Team
        return this.isTeamComplete();
      case 6: // Business Hours
        return this.isBusinessHoursComplete();
      case 7: // Categories
        return this.isCategoriesComplete();
      case 8: // Description
        return this.isDescriptionComplete();
      default:
        return false;
    }
  }

  isDescriptionComplete(): boolean {
    const description = this.editForm?.get('description')?.value;
    return !!(description && description.trim());
  }

  isCategoriesComplete(): boolean {
    const categories = this.editForm?.get('categories')?.value;
    return !!(categories && categories.length > 0);
  }

  canGoToNextStep(): boolean {
    const isValid = this.isCurrentStepValid();
    const canMove = isValid && this.currentStep < this.totalSteps;
    
    return canMove;
  }

  canGoToPrevStep(): boolean {
    return this.currentStep > 1;
  }

  isStepAccessible(stepNumber: number): boolean {
    // Allow access to current step, previous steps, and next step if current is valid
    return stepNumber <= this.currentStep || (stepNumber === this.currentStep + 1 && this.isCurrentStepValid());
  }

  // Helper method to populate business hours from API data
  populateBusinessHours(businessHours: any[]): void {
    // Clear existing business hours
    while (this.businessHoursArray.length !== 0) {
      this.businessHoursArray.removeAt(0);
    }

    // Add business hours from API data
    if (Array.isArray(businessHours) && businessHours.length > 0) {
      businessHours.forEach((bh: any) => {
        this.businessHoursArray.push(
          this.fb.group({
            day: [bh.day || ''],
            hours: [bh.hours || ''],
            isOpen: [bh.isOpen !== undefined ? bh.isOpen : true],
            openTime: [bh.openTime || '09:00'],
            closeTime: [bh.closeTime || '21:00']
          })
        );
      });
    }
  }

  // Helper method to populate team members from API data
  populateTeamMembers(members: any[]): void {
    // Clear existing team members
    while (this.membersArray.length !== 0) {
      this.membersArray.removeAt(0);
    }

    // Add team members from API data
    if (Array.isArray(members) && members.length > 0) {
      members.forEach((member: any) => {
        // For existing members in update mode, password is optional
        const passwordValidators = this.isUpdateMode() 
          ? [EditProfileComponent.passwordValidator] // Optional but validated if filled
          : [Validators.required, Validators.minLength(8), EditProfileComponent.passwordValidator];
        
        const confirmPasswordValidators = this.isUpdateMode()
          ? [] // Optional in update mode
          : [Validators.required];

        this.membersArray.push(
          this.fb.group({
            name: [member.merchantMember?.fullName || member.userDTO?.fullName || member.name || '', [Validators.required]],
            email: [member.merchantMember?.email || member.userDTO?.email || member.email || '', [Validators.email]],
            phone: [member.merchantMember?.phoneNumber || member.userDTO?.phoneNumber || member.phone || ''],
            position: [member.role || 'موظف', [Validators.required]],
            username: [member.merchantMember?.userName || member.userDTO?.userName || member.username || '', [Validators.required, Validators.minLength(3)]],
            password: ['', passwordValidators], // Empty for existing members, optional in update mode
            confirmPassword: ['', confirmPasswordValidators],
            userId: [member.userId || null],
            id: [member.id || null]
          }, { validators: EditProfileComponent.passwordMatchValidator })
        );
      });
    }
  }

  // Helper method to construct proper image URLs
  constructImageUrl(imageData: string): string {
    if (!imageData || imageData.trim() === '') {
      console.log('No image data provided');
      return '';
    }

    console.log('Constructing image URL for:', imageData.substring(0, 50) + '...');

    // If image is a filename (from API), construct path to assets/MerchantData
    if (!imageData.startsWith('data:') && !imageData.includes('/') && imageData.length < 100) {
      const constructedUrl = `assets/MerchantData/${imageData}`;
      console.log('Constructed file URL:', constructedUrl);
      return constructedUrl;
    }
    
    // If image is base64 data
    if (imageData.startsWith('data:')) {
      console.log('Using base64 data URL');
      return imageData;
    }
    
    // If image is base64 without data prefix
    if (imageData.length > 100) {
      const base64Url = `data:image/jpeg;base64,${imageData}`;
      console.log('Constructed base64 URL');
      return base64Url;
    }
    
    console.log('Using original image data as URL');
    return imageData;
  }

  // Debug method to manually reset isLoading - can be called from browser console
  resetLoadingState(): void {
    console.log('🔧 Manually resetting isLoading from', this.isLoading, 'to false');
    this.isLoading = false;
    console.log('✅ isLoading reset to:', this.isLoading);
    console.log('🚀 Form ready for submit now:', this.isFormReadyForSubmit());
    
    // Force change detection to update UI immediately
    setTimeout(() => {
      console.log('🔄 Change detection triggered - button should be enabled now');
    }, 100);
  }

  // Debug method to check current state
  checkCurrentState(): void {
    console.log('=== Current Component State ===');
    console.log('isLoading:', this.isLoading);
    console.log('Form valid:', this.editForm?.valid);
    console.log('Logo complete:', this.isLogoComplete());
    console.log('Documents complete:', this.isDocumentsComplete());
    console.log('Team complete:', this.isTeamComplete());
    console.log('Form ready for submit:', this.isFormReadyForSubmit());
    console.log('===============================');
  }

}

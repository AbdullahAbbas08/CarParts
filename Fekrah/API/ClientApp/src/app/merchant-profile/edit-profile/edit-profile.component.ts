import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserProfileService } from '../../Shared/Services/user-profile.service';
import { UserProfile, UpdateProfileRequest, BusinessHours } from '../../Shared/Models/user-profile.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  isLoading = false;
  selectedImage: File | null = null;
  selectedCoverImage: File | null = null;
  previewImage: string | null = null;
  previewCoverImage: string | null = null;
  currentProfile: UserProfile | null = null;
  updateErrors: string[] = [];
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.loadCurrentProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCurrentProfile(): void {
    this.subscriptions.add(
      this.userProfileService.currentProfile$.subscribe(profile => {
        if (profile) {
          this.currentProfile = profile;
          this.initializeForm();
        } else {
          // Load profile from service if not available
          this.userProfileService.loadProfile().subscribe(loadedProfile => {
            this.currentProfile = loadedProfile;
            this.initializeForm();
          });
        }
      })
    );
  }

  initializeForm(): void {
    const profile = this.currentProfile;
    this.editForm = this.fb.group({
      name: [profile?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [profile?.email || '', [Validators.required, Validators.email]],
      phone: [profile?.phone || '', [Validators.required]],
      whatsapp: [profile?.whatsapp || ''],
      location: [profile?.location || '', [Validators.required]],
      website: [profile?.website || ''],
      description: [profile?.description || ''],
      specialties: this.fb.array([]),
      businessHours: this.fb.array([]),
      preferredContactMethod: [profile?.preferredContactMethod || 'whatsapp'],
      availableForContact: [profile?.availableForContact ?? true],
      profileVisibility: [profile?.profileVisibility || 'public'],
      showPhone: [profile?.showPhone ?? true],
      showEmail: [profile?.showEmail ?? true],
      showLocation: [profile?.showLocation ?? true],
      socialMediaFacebook: [profile?.socialMedia?.facebook || ''],
      socialMediaInstagram: [profile?.socialMedia?.instagram || ''],
      socialMediaTwitter: [profile?.socialMedia?.twitter || ''],
      socialMediaLinkedin: [profile?.socialMedia?.linkedin || ''],
      socialMediaTiktok: [profile?.socialMedia?.tiktok || '']
    });

    // Initialize specialties FormArray
    const specialties = profile?.specialties && profile.specialties.length > 0
      ? profile.specialties
      : ['قطع المحرك', 'الفرامل', 'الكهرباء'];
    specialties.forEach(s => this.specialtiesArray.push(this.fb.control(s)));

    // Initialize businessHours FormArray
    const businessHours = profile?.businessHours && profile.businessHours.length > 0
      ? profile.businessHours
      : [
          { day: 'السبت', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الأحد', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الاثنين', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الثلاثاء', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الأربعاء', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الخميس', hours: '9:00 ص - 9:00 م', isOpen: true },
          { day: 'الجمعة', hours: '2:00 م - 8:00 م', isOpen: true }
        ];
    businessHours.forEach(bh => this.businessHoursArray.push(
      this.fb.group({
        day: [bh.day],
        hours: [bh.hours],
        isOpen: [bh.isOpen]
      })
    ));

    // Set preview images if available
    if (profile?.avatar) {
      this.previewImage = profile.avatar;
    }
    if (profile?.coverImage) {
      this.previewCoverImage = profile.coverImage;
    }
  }

  createBusinessHoursArray(businessHours?: BusinessHours[]): FormGroup[] {
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

  get specialtiesArray(): FormArray {
    return this.editForm.get('specialties') as FormArray;
  }

  get businessHoursArray(): FormArray {
    return this.editForm.get('businessHours') as FormArray;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onCoverImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCoverImage = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewCoverImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage(): void {
    this.selectedImage = null;
    this.previewImage = this.currentProfile?.avatar || null;
  }

  removeSelectedCoverImage(): void {
    this.selectedCoverImage = null;
    this.previewCoverImage = this.currentProfile?.coverImage || null;
  }

  addSpecialty(): void {
    this.specialtiesArray.push(this.fb.control(''));
  }

  removeSpecialty(index: number): void {
    this.specialtiesArray.removeAt(index);
  }

  updateSpecialty(index: number, event: any): void {
    const control = this.specialtiesArray.at(index);
    control.setValue(event?.target?.value);
  }

  toggleBusinessDay(index: number): void {
    const dayControl = this.businessHoursArray.at(index).get('isOpen');
    dayControl?.setValue(!dayControl.value);
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      this.updateErrors = [];
      
      const formValue = this.editForm.value;
      
      // Prepare the update request
      const updateRequest: UpdateProfileRequest = {
        profile: {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
          whatsapp: formValue.whatsapp,
          location: formValue.location,
          website: formValue.website,
          description: formValue.description,
          specialties: formValue.specialties.filter((s: string) => s.trim() !== ''),
          businessHours: formValue.businessHours,
          preferredContactMethod: formValue.preferredContactMethod,
          availableForContact: formValue.availableForContact,
          profileVisibility: formValue.profileVisibility,
          showPhone: formValue.showPhone,
          showEmail: formValue.showEmail,
          showLocation: formValue.showLocation,
          socialMedia: {
            facebook: formValue.socialMediaFacebook,
            instagram: formValue.socialMediaInstagram,
            twitter: formValue.socialMediaTwitter,
            linkedin: formValue.socialMediaLinkedin,
            tiktok: formValue.socialMediaTiktok
          }
        }
      };

      // Add images if selected
      if (this.selectedImage) {
        updateRequest.avatar = this.selectedImage;
      }
      if (this.selectedCoverImage) {
        updateRequest.coverImage = this.selectedCoverImage;
      }

      // Submit the update
      this.subscriptions.add(
        this.userProfileService.updateProfile(updateRequest).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.showToast('تم تحديث الملف الشخصي بنجاح', 'success');
              setTimeout(() => {
                this.router.navigate(['/merchant-profile']);
              }, 1500);
            } else {
              this.updateErrors = response.errors?.map(e => e.message) || [response.message];
              this.showToast(response.message, 'error');
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating profile:', error);
            this.showToast('حدث خطأ أثناء تحديث الملف الشخصي', 'error');
          }
        })
      );
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.location.back();
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


  getDayControl(index: number): FormGroup {
  return this.businessHoursArray.at(index) as FormGroup;
}


}

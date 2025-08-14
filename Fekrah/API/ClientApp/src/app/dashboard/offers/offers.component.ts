import { Component, OnInit } from '@angular/core';
import { SwaggerClient, OfferDTO, OfferTypeEnum, DataSourceResultOfOfferDTO, PartDTO, DataSourceResultOfPartDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-offers-admin',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersAdminComponent implements OnInit {
  offers: OfferDTO[] = [];
  parts: PartDTO[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedOffer: OfferDTO | null = null;

  offerForm: FormGroup;
  offerTypes = OfferTypeEnum;
  offerTypeOptions = [
    { value: OfferTypeEnum.NewPrice, label: 'سعر جديد', icon: 'fas fa-tag' },
    { value: OfferTypeEnum.Percentage, label: 'خصم نسبة مئوية', icon: 'fas fa-percent' },
    { value: OfferTypeEnum.FixedAmount, label: 'خصم مبلغ ثابت', icon: 'fas fa-dollar-sign' },
    { value: OfferTypeEnum.BuyXGetY, label: 'اشتري X خذ Y', icon: 'fas fa-gift' },
    { value: OfferTypeEnum.Bundle, label: 'باقة قطع', icon: 'fas fa-box' }
  ];

  constructor(
    private swaggerClient: SwaggerClient,
    private formBuilder: FormBuilder
  ) {
    this.offerForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadOffers();
    this.loadParts();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      type: [OfferTypeEnum.NewPrice, Validators.required],
      partId: ['', Validators.required],
      newPrice: [null],
      discountRate: [null, [Validators.min(0), Validators.max(100)]],
      fixedAmount: [null, Validators.min(0)],
      buyQuantity: [null, Validators.min(1)],
      getQuantity: [null, Validators.min(1)],
      freePartId: [null],
      bundlePartIdsCsv: [''],
      startAt: [null],
      endAt: [null],
      isActive: [true]
    });
  }

  loadOffers(): void {
    this.isLoading = true;
    this.swaggerClient.apiOfferGetAllGet(this.pageSize, this.currentPage, this.searchTerm)
      .subscribe({
        next: (result: DataSourceResultOfOfferDTO) => {
          this.offers = result.data || [];
          this.totalCount = result.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading offers:', error);
          this.isLoading = false;
          alert('حدث خطأ في تحميل العروض');
        }
      });
  }

  loadParts(): void {
    this.swaggerClient.apiPartsGetAllGet(1000, 1, '')
      .subscribe({
        next: (result: DataSourceResultOfPartDTO) => {
          this.parts = result.data || [];
        },
        error: (error) => {
          console.error('Error loading parts:', error);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOffers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOffers();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedOffer = null;
    this.offerForm.reset();
    this.offerForm.patchValue({
      id: 0,
      type: OfferTypeEnum.NewPrice,
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(offer: OfferDTO): void {
    this.isEditMode = true;
    this.selectedOffer = offer;
    this.offerForm.patchValue({
      ...offer,
      startAt: offer.startAt ? new Date(offer.startAt).toISOString().slice(0, 16) : null,
      endAt: offer.endAt ? new Date(offer.endAt).toISOString().slice(0, 16) : null
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedOffer = null;
    this.offerForm.reset();
  }

  onOfferTypeChange(): void {
    const type = this.offerForm.get('type')?.value;
    
    // Clear all type-specific fields
    this.offerForm.patchValue({
      newPrice: null,
      discountRate: null,
      fixedAmount: null,
      buyQuantity: null,
      getQuantity: null,
      freePartId: null,
      bundlePartIdsCsv: ''
    });

    // Set validators based on type
    this.updateValidators(type);
  }

  private updateValidators(type: OfferTypeEnum): void {
    const controls = this.offerForm.controls;
    
    // Clear all validators first
    Object.keys(controls).forEach(key => {
      if (['newPrice', 'discountRate', 'fixedAmount', 'buyQuantity', 'getQuantity'].includes(key)) {
        controls[key].clearValidators();
      }
    });

    // Set validators based on type
    switch (type) {
      case OfferTypeEnum.NewPrice:
        controls['newPrice'].setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferTypeEnum.Percentage:
        controls['discountRate'].setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
        break;
      case OfferTypeEnum.FixedAmount:
        controls['fixedAmount'].setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferTypeEnum.BuyXGetY:
        controls['buyQuantity'].setValidators([Validators.required, Validators.min(1)]);
        controls['getQuantity'].setValidators([Validators.required, Validators.min(1)]);
        break;
      case OfferTypeEnum.Bundle:
        controls['newPrice'].setValidators([Validators.required, Validators.min(0.01)]);
        break;
    }

    // Update validity
    Object.keys(controls).forEach(key => {
      controls[key].updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = { ...this.offerForm.value };
    
    // Convert dates
    if (formData.startAt) {
      formData.startAt = new Date(formData.startAt).toISOString();
    }
    if (formData.endAt) {
      formData.endAt = new Date(formData.endAt).toISOString();
    }

    const offerData: OfferDTO = formData;

    if (this.isEditMode) {
      this.updateOffer(offerData);
    } else {
      this.createOffer(offerData);
    }
  }

  private createOffer(offer: OfferDTO): void {
    this.swaggerClient.apiOfferInsertPost(offer)
      .subscribe({
        next: (result) => {
          alert('تم إضافة العرض بنجاح');
          this.closeModal();
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error creating offer:', error);
          alert('حدث خطأ في إضافة العرض');
        }
      });
  }

  private updateOffer(offer: OfferDTO): void {
    this.swaggerClient.apiOfferUpdatePost(offer)
      .subscribe({
        next: (result) => {
          alert('تم تحديث العرض بنجاح');
          this.closeModal();
          this.loadOffers();
        },
        error: (error) => {
          console.error('Error updating offer:', error);
          alert('حدث خطأ في تحديث العرض');
        }
      });
  }

  deleteOffer(offer: OfferDTO): void {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      this.swaggerClient.apiOfferDeletePost(offer.id)
        .subscribe({
          next: () => {
            alert('تم حذف العرض بنجاح');
            this.loadOffers();
          },
          error: (error) => {
            console.error('Error deleting offer:', error);
            alert('حدث خطأ في حذف العرض');
          }
        });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.offerForm.controls).forEach(key => {
      this.offerForm.get(key)?.markAsTouched();
    });
  }

  getOfferTypeLabel(type: OfferTypeEnum): string {
    return this.offerTypeOptions.find(opt => opt.value === type)?.label || '';
  }

  getOfferTypeIcon(type: OfferTypeEnum): string {
    return this.offerTypeOptions.find(opt => opt.value === type)?.icon || 'fas fa-tag';
  }

  getPartName(partId: number): string {
    return this.parts.find(p => p.id === partId)?.name || '';
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.offerForm.get(fieldName);
    return !!(control?.hasError('required') && control?.touched);
  }

  getOfferDescription(offer: OfferDTO): string {
    switch (offer.type) {
      case OfferTypeEnum.NewPrice:
        return `سعر جديد: ${offer.newPrice} جنيه`;
      case OfferTypeEnum.Percentage:
        return `خصم ${offer.discountRate}%`;
      case OfferTypeEnum.FixedAmount:
        return `خصم ${offer.fixedAmount} جنيه`;
      case OfferTypeEnum.BuyXGetY:
        return `اشتري ${offer.buyQuantity} خذ ${offer.getQuantity}`;
      case OfferTypeEnum.Bundle:
        return `باقة بسعر ${offer.newPrice} جنيه`;
      default:
        return '';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  trackByOfferId(index: number, offer: OfferDTO): number {
    return offer.id;
  }

  getDisplayedItemsEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }
}

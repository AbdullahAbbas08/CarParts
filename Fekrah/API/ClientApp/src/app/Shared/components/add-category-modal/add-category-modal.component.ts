import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwaggerClient, CategoryDTO } from '../../Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-add-category-modal',
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.css']
})
export class AddCategoryModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() categoryAdded = new EventEmitter<CategoryDTO>();
  @Output() modalClosed = new EventEmitter<void>();

  newCategoryForm!: FormGroup;
  isAddingCategory = false;

  constructor(
    private formBuilder: FormBuilder,
    private swaggerClient: SwaggerClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.newCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  show(): void {
    this.isVisible = true;
    this.visibilityChange.emit(true);
    this.resetForm();
    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');
  }

  hide(): void {
    this.isVisible = false;
    this.visibilityChange.emit(false);
    this.modalClosed.emit();
    // Restore body scroll
    document.body.classList.remove('modal-open');
  }

  private resetForm(): void {
    this.newCategoryForm.reset();
    this.isAddingCategory = false;
  }

  async addNewCategory(): Promise<void> {
    if (this.newCategoryForm.invalid || this.isAddingCategory) {
      this.newCategoryForm.markAllAsTouched();
      return;
    }

    const categoryName = this.newCategoryForm.get('name')?.value?.trim();
    if (!categoryName) {
      return;
    }

    this.isAddingCategory = true;

    try {
      // Create new CategoryDTO
      const newCategory = new CategoryDTO();
      newCategory.name = categoryName;

      console.log('📤 Sending category to API:', newCategory);

      // Add to API using the correct method
      const response = await this.swaggerClient.apiCategoriesInsertPost(newCategory).toPromise();
      
      if (response) {
        console.log('✅ Category added successfully:', response);
        this.categoryAdded.emit(response);
        this.hide();
      }
    } catch (error: any) {
      console.error('❌ Error adding category:', error);
      
      let errorMessage = 'حدث خطأ أثناء إضافة التصنيف';
      if (error.status === 400) {
        errorMessage = 'بيانات التصنيف غير صحيحة';
      } else if (error.status === 409) {
        errorMessage = 'هذا التصنيف موجود بالفعل';
      } else if (error.status === 500) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      }
      
      // You can implement error handling/toast service here
      console.error('Error message:', errorMessage);
    } finally {
      this.isAddingCategory = false;
    }
  }

  onBackdropClick(): void {
    this.hide();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  // Getter for easy access to form controls
  get nameControl() {
    return this.newCategoryForm.get('name');
  }

  // Validation helpers
  get isFormValid(): boolean {
    return this.newCategoryForm.valid;
  }

  get showNameError(): boolean {
    return !!(this.nameControl?.invalid && this.nameControl?.touched);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { OffersAdminComponent } from './offers.component';
import { SwaggerClient, DataSourceResultOfOfferDTO, DataSourceResultOfPartDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';

describe('OffersAdminComponent', () => {
  let component: OffersAdminComponent;
  let fixture: ComponentFixture<OffersAdminComponent>;
  let mockSwaggerClient: jasmine.SpyObj<SwaggerClient>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SwaggerClient', [
      'apiOfferGetAllGet', 
      'apiPartsGetAllGet', 
      'apiOfferInsertPost', 
      'apiOfferUpdatePost', 
      'apiOfferDeletePost'
    ]);

    await TestBed.configureTestingModule({
      declarations: [OffersAdminComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: SwaggerClient, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OffersAdminComponent);
    component = fixture.componentInstance;
    mockSwaggerClient = TestBed.inject(SwaggerClient) as jasmine.SpyObj<SwaggerClient>;

    // Setup default mock responses
    const mockOfferResult = new DataSourceResultOfOfferDTO();
    mockOfferResult.data = [];
    mockOfferResult.count = 0;
    mockOfferResult.additionalValue = 0;
    
    const mockPartResult = new DataSourceResultOfPartDTO();
    mockPartResult.data = [];
    mockPartResult.count = 0;
    mockPartResult.additionalValue = 0;

    mockSwaggerClient.apiOfferGetAllGet.and.returnValue(of(mockOfferResult));
    mockSwaggerClient.apiPartsGetAllGet.and.returnValue(of(mockPartResult));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load offers on init', () => {
    component.ngOnInit();
    expect(mockSwaggerClient.apiOfferGetAllGet).toHaveBeenCalled();
  });

  it('should load parts on init', () => {
    component.ngOnInit();
    expect(mockSwaggerClient.apiPartsGetAllGet).toHaveBeenCalled();
  });

  it('should create form with default values', () => {
    expect(component.offerForm).toBeDefined();
    expect(component.offerForm.get('type')?.value).toBe(1); // OfferTypeEnum.NewPrice
    expect(component.offerForm.get('isActive')?.value).toBe(true);
  });

  it('should open add modal', () => {
    component.openAddModal();
    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(false);
  });

  it('should close modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBe(false);
  });
});

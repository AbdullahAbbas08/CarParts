import { Component, OnInit } from '@angular/core';
import { CarPart } from '../../../../Shared/Models/car-card';
import { ActivatedRoute } from '@angular/router';
import { SellerDto, SwaggerClient } from '../../../../Shared/Services/Swagger/SwaggerClient.service';

type FilterKey = 'brands' | 'models' | 'years' | 'types' | 'categories' | 'condition';

@Component({
  selector: 'app-seller-page',
  templateUrl: './seller-page.component.html',
  styleUrls: ['./seller-page.component.scss']
})
export class SellerPageComponent implements OnInit {

  sellerProducts: CarPart[] = [
    {
      id: '101',
      name: 'فلتر زيت تويوتا كورولا',
      subtitle: 'فلتر زيت أصلي صناعة يابانية',
      condition: 'جديد',
      store: {
        name: 'مؤسسة العجمي لقطع الغيار',
        phone: '01011223344'
      },
      car: {
        brand: 'تويوتا',
        model: 'كورولا',
        year: '2020'
      },
      price: 180,
      priceAfterDiscount: 150,
      discount: 17,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'فلتر',
      origin: 'اليابان',
      image: 'assets/images/toyota_filter.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: '6 أشهر'
    },
    {
      id: '102',
      name: 'بطارية نيسان صني 70 أمبير',
      subtitle: 'بطارية جافة بضمان سنة',
      condition: 'جديد',
      store: {
        name: 'مؤسسة النور لقطع الغيار',
        phone: '01123456789'
      },
      car: {
        brand: 'نيسان',
        model: 'صني',
        year: '2022'
      },
      price: 950,
      priceAfterDiscount: 850,
      discount: 10,
      isFavorite: true,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'بطارية',
      origin: 'كوريا',
      image: 'assets/images/nissan_battery.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: 'سنة واحدة'
    },
    {
      id: '103',
      name: 'طقم تيل فرامل أمامي هوندا سيفيك',
      subtitle: 'أداء عالي وخامة متميزة',
      condition: 'جديد',
      store: {
        name: 'الوفاء لقطع الغيار',
        phone: '01234567890'
      },
      car: {
        brand: 'هوندا',
        model: 'سيفيك',
        year: '2019'
      },
      price: 450,
      priceAfterDiscount: 420,
      discount: 7,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'فرامل',
      origin: 'تايلاند',
      image: 'assets/images/honda_brake.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: '6 أشهر'
    },
    {
      id: '104',
      name: 'موتور كامل هيونداي إلنترا HD',
      subtitle: 'محرك استيراد بحالة ممتازة',
      condition: 'مستعمل',
      store: {
        name: 'المصرية للاستيراد',
        phone: '01099887766'
      },
      car: {
        brand: 'هيونداي',
        model: 'إلنترا',
        year: '2015'
      },
      price: 14500,
      priceAfterDiscount: 13200,
      discount: 9,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز تاني',
      partType: 'محرك',
      origin: 'كوريا',
      image: 'assets/images/hyundai_engine.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: '3 أشهر'
    },
    {
      id: '105',
      name: 'كشاف أمامي يسار مرسيدس C180',
      subtitle: 'LED أصلي مع عدسة',
      condition: 'مستعمل',
      store: {
        name: 'جودة للاستيراد',
        phone: '01222113355'
      },
      car: {
        brand: 'مرسيدس',
        model: 'C180',
        year: '2018'
      },
      price: 3200,
      priceAfterDiscount: 2950,
      discount: 8,
      isFavorite: true,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'مصابيح',
      origin: 'ألمانيا',
      image: 'assets/images/mercedes_headlight.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: '3 أشهر'
    },
    {
      id: '106',
      name: 'ردياتير كيا سبورتاج',
      subtitle: 'أصلي وارد كوريا',
      condition: 'جديد',
      store: {
        name: 'الدولي لقطع الغيار',
        phone: '01155667788'
      },
      car: {
        brand: 'كيا',
        model: 'سبورتاج',
        year: '2021'
      },
      price: 2600,
      priceAfterDiscount: 2300,
      discount: 12,
      isFavorite: false,
      hasDelivery: true,
      grade: 'فرز أول',
      partType: 'تبريد',
      origin: 'كوريا',
      image: 'assets/images/kia_radiator.jpg',
      thumbnails: [],
      hasWarranty: true,
      warrantyPeriod: 'سنة واحدة'
    }
  ];

  filteredProducts: CarPart[] = [];
  showFilters = false;
  pageSize = 12;

  // ✅ تهيئة القيمة مباشرة لتفادي null
  activeFilterSection: string = 'brands';

  selectedFilters: {
    brands: string[];
    models: string[];
    years: string[];
    types: string[];
    categories: string[];
    condition: string[];
    priceRange: {
      min: number | null;
      max: number | null;
    };
  } = {
      brands: [],
      models: [],
      years: [],
      types: [],
      categories: [],
      condition: [],
      priceRange: { min: null, max: null }
    };

  availableBrands: string[] = [];
  availableModels: string[] = [];
  availableYears: string[] = [];
  availableTypes: string[] = [];
  availableConditions: string[] = [];
  availableCategories: string[] = [];

  filterSections = [
    { key: 'brands', title: 'الماركة', icon: 'fa-car' },
    { key: 'models', title: 'الموديل', icon: 'fa-car' },
    { key: 'years', title: 'السنة', icon: 'fa-calendar' },
    { key: 'types', title: 'النوع', icon: 'fa-tools' },
    { key: 'price', title: 'نطاق السعر', icon: 'fa-tag' },
    { key: 'categories', title: 'الفئة', icon: 'fa-list' },
    { key: 'condition', title: 'الحالة', icon: 'fa-check-circle' }
  ];
  sellerId: number | undefined = undefined;
  sellerDetails:SellerDto = new SellerDto();
  constructor(private route: ActivatedRoute,private swagger:SwaggerClient) {}
  ngOnInit(): void {
    this.sellerId = Number(this.route.snapshot.paramMap.get('id'));
    this.getsellerById()
    this.initializeFilters();
    this.filteredProducts = [...this.sellerProducts];
  }
  getsellerById(){
    this.swagger.apiSellersGetDetailsGet(this.sellerId).subscribe((res) => {
      if(res) {
        this.sellerDetails = res;
        this.updateRatingStars(this.sellerDetails.rating);
      }
    });
  }
  private initializeFilters(): void {
    const brands = new Set<string>();
    const models = new Set<string>();
    const years = new Set<string>();
    const types = new Set<string>();
    const categories = new Set<string>();
    const conditions = new Set<string>();

    this.sellerProducts.forEach(p => {
      brands.add(p.car.brand);
      models.add(p.car.model);
      years.add(p.car.year);
      types.add(p.grade); // النوع = الفرز
      categories.add(p.partType); // الفئة = نوع القطعة
      conditions.add(p.condition);
    });

    this.availableBrands = Array.from(brands);
    this.availableModels = Array.from(models);
    this.availableYears = Array.from(years).sort((a, b) => +b - +a);
    this.availableTypes = Array.from(types);
    this.availableCategories = Array.from(categories);
    this.availableConditions = Array.from(conditions);
  }
  ratingStars: number[] = [];

updateRatingStars(rating: number): void {
  const fullStars = Math.floor(rating); // عدد النجوم المضيئة
  const emptyStars = 5 - fullStars;     // عدد النجوم الفارغة

  this.ratingStars = [
    ...Array(fullStars).fill(1),   // 1 تمثل نجمة مضيئة
    ...Array(emptyStars).fill(0)   // 0 تمثل نجمة مطفية
  ];
}
  toggleFilterSection(sectionKey: string): void {
    this.activeFilterSection = this.activeFilterSection === sectionKey ? '' : sectionKey;
  }

  toggleSidebar(): void {
    this.showFilters = !this.showFilters;
  }

  closeSidebar(): void {
    this.showFilters = false;
  }

  toggleFilter(filterType: FilterKey, value: string): void {
    const current = this.selectedFilters[filterType];
    const index = current.indexOf(value);
    if (index > -1) current.splice(index, 1);
    else current.push(value);
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    const { brands, models, years, types, categories, condition, priceRange } = this.selectedFilters;
    let count = brands.length + models.length + years.length + types.length + categories.length + condition.length;
    if (priceRange.min !== null || priceRange.max !== null) count += 1;
    return count;
  }

  onPageSizeChange(): void {
    console.log('تم تغيير حجم الصفحة إلى:', this.pageSize);
  }

  trackByPartId(index: number, part: CarPart): string {
    return part.id;
  }

  onPartClick(part: CarPart): void {
    console.log('تم النقر على القطعة:', part);
  }

  searchTerm: string = '';

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.performSearch();
  }

  performSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.applyFilters();
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.filteredProducts.filter(part =>
      part.name.toLowerCase().includes(searchLower) ||
      part.subtitle.toLowerCase().includes(searchLower) ||
      part.car.brand.toLowerCase().includes(searchLower) ||
      part.car.model.toLowerCase().includes(searchLower) ||
      part.partType.toLowerCase().includes(searchLower) ||
      part.condition.toLowerCase().includes(searchLower) ||
      part.grade.toLowerCase().includes(searchLower) ||
      part.origin.toLowerCase().includes(searchLower)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.sellerProducts.filter(part => {
      const f = this.selectedFilters;
      return (
        (f.brands.length === 0 || f.brands.includes(part.car.brand)) &&
        (f.models.length === 0 || f.models.includes(part.car.model)) &&
        (f.years.length === 0 || f.years.includes(part.car.year)) &&
        (f.types.length === 0 || f.types.includes(part.grade)) &&
        (f.categories.length === 0 || f.categories.includes(part.partType)) &&
        (f.condition.length === 0 || f.condition.includes(part.condition)) &&
        (f.priceRange.min === null || part.priceAfterDiscount >= f.priceRange.min) &&
        (f.priceRange.max === null || part.priceAfterDiscount <= f.priceRange.max)
      );
    });

    if (this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchLower) ||
        part.subtitle.toLowerCase().includes(searchLower) ||
        part.car.brand.toLowerCase().includes(searchLower) ||
        part.car.model.toLowerCase().includes(searchLower) ||
        part.partType.toLowerCase().includes(searchLower) ||
        part.condition.toLowerCase().includes(searchLower) ||
        part.grade.toLowerCase().includes(searchLower) ||
        part.origin.toLowerCase().includes(searchLower)
      );
    }

    this.filteredProducts = filtered;
  }

  clearAllFilters(): void {
    this.selectedFilters = {
      brands: [],
      models: [],
      years: [],
      types: [],
      categories: [],
      condition: [],
      priceRange: { min: null, max: null }
    };
    this.searchTerm = '';
    this.applyFilters();
  }
}

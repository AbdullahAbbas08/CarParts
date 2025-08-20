import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CarPart } from 'src/app/Shared/Models/car-card';
import { SwaggerClient, BrandDTO, ModelTypeDTO, CategoryDTO } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';
import { FilterService } from 'src/app/Shared/Services/filter.service';

// مفاتيح الفلاتر المدعومة
type FilterKey = 'brands' | 'models' | 'years' | 'types' | 'categories' | 'condition';

@Component({
  selector: 'app-category-parts',
  templateUrl: './category-parts.component.html',
  styleUrls: ['./category-parts.component.scss']
})
export class CategoryPartsComponent implements OnInit {

  showSidebar = false;
  pageSize = 12;
  currentPage = 1;
  pageSizeOptions = [12, 24, 36];
  categoryName = 'كهرباء';

  // Search Properties
  searchTerm: string = '';

  itemsPerPage: number = 6;
  itemsPerPageOptions: number[] = [6, 12, 24];
  private destroy$ = new Subject<void>();

  allParts: CarPart[] = [];
  filteredParts: CarPart[] = [];
  displayParts: CarPart[] = [];

  selectedFilters: {
    brands: string[];
    models: string[];
    years: string[];
    types: string[];
    categories: string[];
    condition: string[]; // ✅ الحالة
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

  // Arrays for sidebar filters
  availableBrands = ['تويوتا', 'نيسان', 'هيونداي', 'كيا', 'مرسيدس', 'بي ام دبليو', 'أودي', 'فولكس واجن'];
  availableModels = ['كورولا', 'كامري', 'يارس', 'راف 4', 'ألتيما', 'سنترا', 'إلنترا', 'سوناتا'];
  availableCategories = ['قطع المحرك', 'قطع كهربائية', 'الفلاتر', 'القطع الداخلية', 'فرامل', 'إطارات', 'زيوت'];
  availableYears = [
    '2024', '2023', '2022', '2021', '2020',
    '2019', '2018', '2017', '2016', '2015',
    '2014', '2013', '2012', '2011', '2010',
    '2009', '2008', '2007', '2006', '2005',
    '2004', '2003', '2002', '2001', '2000'
  ];
  availableTypes = ['أصلي', 'تجاري'];
  availableConditions = ['جديد', 'مستعمل', 'مستورد']; // ✅ الحالات المتاحة
  pagedParts!: CarPart[];

  constructor(private swaggerClient: SwaggerClient, private filterService: FilterService) { }

  ngOnInit(): void {
    this.selectedFilters.priceRange.min = 1000;
    this.selectedFilters.priceRange.max = 30000;
    
    this.getMockData();
    this.filteredParts = [...this.allParts];
    this.updateDisplayParts();

    console.log('Category-parts component initialized with FilterService');
  }

  // Search functionality
  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applySearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearch();
  }

  private applySearch() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredParts = [...this.allParts];
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredParts = this.allParts.filter(part => 
        part.name.toLowerCase().includes(searchLower) ||
        part.car.brand.toLowerCase().includes(searchLower) ||
        part.car.model.toLowerCase().includes(searchLower) ||
        part.car.year.toString().includes(searchLower) ||
        part.store.name.toLowerCase().includes(searchLower) ||
        part.condition.toLowerCase().includes(searchLower) ||
        part.grade.toLowerCase().includes(searchLower)
      );
    }
    this.updateDisplayParts();
  }

  activeFilterSection: string | null = null;

  filterSections = [
    { key: 'brands', title: 'الماركة', icon: 'fa-car' },
    { key: 'models', title: 'الموديل', icon: 'fa-car' },
    { key: 'years', title: 'السنة', icon: 'fa-calendar' },
    { key: 'types', title: 'النوع', icon: 'fa-tools' },
    { key: 'price', title: 'نطاق السعر', icon: 'fa-tag' },
    { key: 'categories', title: 'الفئة', icon: 'fa-list' },
    { key: 'condition', title: 'الحالة', icon: 'fa-check-circle' } // ✅ الحالة بدلاً من التوفر
  ];

  toggleFilterSection(sectionKey: string) {
    this.activeFilterSection = this.activeFilterSection === sectionKey ? null : sectionKey;
  }

  toggleSidebar() {
    this.filterService.toggleSidebar();
  }

  closeSidebar() {
    console.log('closeSidebar called in category-parts!');
    this.filterService.closeSidebar();
  }

  changePageSize(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.updateDisplayParts();
  }

  pageChanged(event: number) {
    this.currentPage = event;
    this.updateDisplayParts();
  }

  onPaginatorPageChange(event: any) {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.itemsPerPage = event.rows;
    this.updatePagedParts();
  }

  updateDisplayParts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayParts = this.filteredParts.slice(start, end);
  }

  trackByPartId(index: number, part: any): number {
    return part.id;
  }

  onPartClick(part: any) {
    console.log('Part clicked:', part);
  }

  toggleFilter(filterType: FilterKey, value: string) {
    const currentFilters = this.selectedFilters[filterType];
    const index = currentFilters.indexOf(value);

    if (index > -1) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(value);
    }

    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    const { brands, years, types, categories, condition, priceRange } = this.selectedFilters;
    let count = brands.length + years.length + types.length + categories.length + condition.length;
    if (priceRange.min !== null) count++;
    if (priceRange.max !== null) count++;
    return count;
  }

  applyFilters() {
    this.filteredParts = this.allParts.filter(part => {
      const matchesBrand = this.selectedFilters.brands.length === 0 || this.selectedFilters.brands.includes(part.car.brand);
      const matchesModels = this.selectedFilters.models.length === 0 || this.selectedFilters.models.includes(part.car.model);
      const matchesYear = this.selectedFilters.years.length === 0 || this.selectedFilters.years.includes(part.car.year);
      const matchesType = this.selectedFilters.types.length === 0 || this.selectedFilters.types.includes(part.partType);
      const matchesCategory = this.selectedFilters.categories.length === 0 || this.selectedFilters.categories.includes(this.getCategoryForPart(part));
      const matchesCondition = this.selectedFilters.condition.length === 0 || this.selectedFilters.condition.includes(part.condition);
      const matchesMinPrice = this.selectedFilters.priceRange.min == null || part.priceAfterDiscount >= this.selectedFilters.priceRange.min;
      const matchesMaxPrice = this.selectedFilters.priceRange.max == null || part.priceAfterDiscount <= this.selectedFilters.priceRange.max;

      return matchesBrand && matchesModels && matchesYear && matchesType &&
        matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
    });

    this.currentPage = 1;
    this.updateDisplayParts();
  }

  clearAllFilters() {
    this.selectedFilters = {
      brands: [],
      models: [],
      years: [],
      types: [],
      categories: [],
      condition: [],
      priceRange: { min: null, max: null }
    };

    this.applyFilters();
  }

  getCategoryForPart(part: CarPart): string {
    if (part.name.includes('فلتر')) return 'الفلاتر';
    if (part.name.includes('بطارية')) return 'قطع كهربائية';
    if (part.name.includes('طرمبة')) return 'قطع المحرك';
    return 'القطع الداخلية';
  }

  getMockData() {
    this.allParts = [
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1000',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت جديد فرز تاني',
        condition: 'جديد',
        store: { name: 'تبريد الخليج', phone: '01000000524' },
        car: { brand: 'كيا', model: 'ريو', year: '2019' },
        price: 1917,
        priceAfterDiscount: 1629,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'ياباني',
        origin: 'اليابان'
      },
      {
        id: '1001',
        name: 'رديتر مياه',
        subtitle: 'رديتر مياه مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'مكيفات الشرق', phone: '01000000518' },
        car: { brand: 'نيسان', model: 'سنترا', year: '2022' },
        price: 1365,
        priceAfterDiscount: 1228,
        discount: 10,
        isFavorite: true,
        hasDelivery: false,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'اليابان'
      },
      {
        id: '1002',
        name: 'بطارية',
        subtitle: 'بطارية مستعمل فرز تاني',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000873' },
        car: { brand: 'شيفروليه', model: 'تاهو', year: '2013' },
        price: 1718,
        priceAfterDiscount: 1546,
        discount: 10,
        isFavorite: false,
        hasDelivery: true,
        grade: 'فرز تاني',
        partType: 'صيني',
        origin: 'كوريا'
      },
      {
        id: '1003',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'وقود بلس', phone: '01000000119' },
        car: { brand: 'تويوتا', model: 'كامري', year: '2021' },
        price: 1370,
        priceAfterDiscount: 1164,
        discount: 15,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'كوري',
        origin: 'الصين'
      },
      {
        id: '1004',
        name: 'فلتر زيت',
        subtitle: 'فلتر زيت مستعمل فرز أول',
        condition: 'مستعمل',
        store: { name: 'تبريد الخليج', phone: '01000000269' },
        car: { brand: 'شيفروليه', model: 'كابتيفا', year: '2015' },
        price: 1493,
        priceAfterDiscount: 1418,
        discount: 5,
        isFavorite: true,
        hasDelivery: true,
        grade: 'فرز أول',
        partType: 'ياباني',
        origin: 'اليابان'
      },
    ];
  }

  updatePagedParts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedParts = this.displayParts.slice(startIndex, endIndex);
  }

  nextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updatePagedParts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedParts();
    }
  }

  goToPage(pageNumber: number): void {
    const totalPages = this.getTotalPages();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      this.currentPage = pageNumber;
      this.updatePagedParts();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.displayParts.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    const maxPagesToShow = 5;
    const pages: number[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const middle = Math.ceil(maxPagesToShow / 2);
      if (this.currentPage <= middle) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - middle + 1) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - Math.floor(middle / 2); i <= this.currentPage + Math.ceil(middle / 2) - 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  }

}

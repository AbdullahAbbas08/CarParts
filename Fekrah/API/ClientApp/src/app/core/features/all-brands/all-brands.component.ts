import { Component, OnInit } from '@angular/core';
import { DataSourceResultOfCarsModelDto, SwaggerClient } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-all-brands',
  templateUrl: './all-brands.component.html',
  styleUrls: ['./all-brands.component.scss']
})
export class AllBrandsComponent implements OnInit {

  // allCarBrands = [
  //   { id: 1, name: 'تويوتا', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 2, name: 'هوندا', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 3, name: 'نيسان', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 4, name: 'مازدا', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 5, name: 'سوبارو', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 6, name: 'ميتسوبيشي', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 7, name: 'اينفينيتي', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 8, name: 'لكزس', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 9, name: 'اكورا', logo: 'assets/images/brands/image_100_100.png', country: 'اليابان' },
  //   { id: 10, name: 'هيونداي', logo: 'assets/images/brands/image_100_100.png', country: 'كوريا الجنوبية' },
  //   { id: 11, name: 'كيا', logo: 'assets/images/brands/image_100_100.png', country: 'كوريا الجنوبية' },
  //   { id: 12, name: 'جينيسيس', logo: 'assets/images/brands/image_100_100.png', country: 'كوريا الجنوبية' },
  //   { id: 13, name: 'شيفروليه', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 14, name: 'فورد', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 15, name: 'جيب', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 16, name: 'كاديلاك', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 17, name: 'كرايسلر', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 18, name: 'دودج', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 19, name: 'لينكولن', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 20, name: 'بويك', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 21, name: 'جي إم سي', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  //   { id: 22, name: 'مرسيدس بنز', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 23, name: 'بي إم دبليو', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 24, name: 'أودي', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 25, name: 'فولكس واجن', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 26, name: 'بورش', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 27, name: 'أوبل', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 28, name: 'مايباخ', logo: 'assets/images/brands/image_100_100.png', country: 'ألمانيا' },
  //   { id: 29, name: 'فولفو', logo: 'assets/images/brands/image_100_100.png', country: 'السويد' },
  //   { id: 30, name: 'ساب', logo: 'assets/images/brands/image_100_100.png', country: 'السويد' },
  //   { id: 31, name: 'فيات', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 32, name: 'ألفا روميو', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 33, name: 'لانشيا', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 34, name: 'فيراري', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 35, name: 'لامبورجيني', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 36, name: 'مازيراتي', logo: 'assets/images/brands/image_100_100.png', country: 'إيطاليا' },
  //   { id: 37, name: 'بيجو', logo: 'assets/images/brands/image_100_100.png', country: 'فرنسا' },
  //   { id: 38, name: 'رينو', logo: 'assets/images/brands/image_100_100.png', country: 'فرنسا' },
  //   { id: 39, name: 'سيتروين', logo: 'assets/images/brands/image_100_100.png', country: 'فرنسا' },
  //   { id: 40, name: 'سكودا', logo: 'assets/images/brands/image_100_100.png', country: 'التشيك' },
  //   { id: 41, name: 'سيات', logo: 'assets/images/brands/image_100_100.png', country: 'إسبانيا' },
  //   { id: 42, name: 'رولز رويس', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 43, name: 'بنتلي', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 44, name: 'جاكوار', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 45, name: 'لاند روفر', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 46, name: 'أستون مارتن', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 47, name: 'ميني', logo: 'assets/images/brands/image_100_100.png', country: 'بريطانيا' },
  //   { id: 48, name: 'جيلي', logo: 'assets/images/brands/image_100_100.png', country: 'الصين' },
  //   { id: 49, name: 'بي واي دي', logo: 'assets/images/brands/image_100_100.png', country: 'الصين' },
  //   { id: 50, name: 'تشانجان', logo: 'assets/images/brands/image_100_100.png', country: 'الصين' },
  //   { id: 51, name: 'جي إيه سي', logo: 'assets/images/brands/image_100_100.png', country: 'الصين' },
  //   { id: 52, name: 'تشيري', logo: 'assets/images/brands/image_100_100.png', country: 'الصين' },
  //   { id: 53, name: 'تاتا', logo: 'assets/images/brands/image_100_100.png', country: 'الهند' },
  //   { id: 54, name: 'ماهيندرا', logo: 'assets/images/brands/image_100_100.png', country: 'الهند' },
  //   { id: 55, name: 'لادا', logo: 'assets/images/brands/image_100_100.png', country: 'روسيا' },
  //   { id: 56, name: 'تيسلا', logo: 'assets/images/brands/image_100_100.png', country: 'أمريكا' },
  // ];

allCarBrands:any[]= []
  filteredBrands = [...this.allCarBrands];
  searchTerm = '';
  selectedCountry = '';

  // قائمة البلدان المتاحة
  countries = [
    'الكل',
    'اليابان',
    'كوريا الجنوبية',
    'أمريكا',
    'ألمانيا',
    'السويد',
    'إيطاليا',
    'فرنسا',
    'التشيك',
    'إسبانيا',
    'بريطانيا',
    'الصين',
    'الهند',
    'روسيا'
  ];
  constructor(private swagger: SwaggerClient) {}
  ngOnInit(): void {
    this.filterBrands();
    this.getAllCarBrands()
  }

  onSearchChange(): void {
    this.filterBrands();
  }

  onCountryChange(): void {
    this.filterBrands();
  }

  filterBrands(): void {
    this.filteredBrands = this.allCarBrands.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCountry = !this.selectedCountry || this.selectedCountry === 'الكل' || brand.country === this.selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }
  
  onBrandClick(brand: any): void {
    // التنقل إلى صفحة قطع الغيار للماركة المحددة
    console.log('Selected brand:', brand);
  }
  getAllCarBrands(){
        this.swagger.apiCarsModelGetAllGet(10,1,undefined).subscribe((res:DataSourceResultOfCarsModelDto) => {
        if(res){
           this.allCarBrands = res.data;
           this.filteredBrands = res.data
        }
    })
  }
  trackByBrandId(index: number, brand: any): number {
    return brand.id;
  }
}

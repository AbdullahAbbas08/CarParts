import { Component, OnInit } from '@angular/core';

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
  searchText = '';
  allParts = this.getMockData();
  filteredParts = [...this.allParts];
  categoryName = 'كهرباء';
  suggestions: string[] = [];
  searchFocused = false;

  constructor() {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  changePageSize(event: any) {
    this.pageSize = +event.target.value;
  }

  pageChanged(event: number) {
    this.currentPage = event;
  }

  getMockData() {
    const types = ['كوري', 'ياباني', 'صيني'];
    const categories = ['محرك', 'إطارات', 'بطاريات', 'زيوت'];
    const brands = ['تويوتا', 'هيونداي', 'كيا', 'نيسان'];
    const grades = ['فرز أول', 'فرز تاني', null];

    return Array.from({ length: 100 }).map((_, index) => {
      const isOnSale = index % 3 === 0;
      const basePrice = Math.floor(Math.random() * 1000) + 100;
      const quantity = Math.floor(Math.random() * 20);
      const condition = index % 2 === 0 ? 'جديد' : 'استيراد';
      const grade = condition === 'استيراد' ? grades[Math.floor(Math.random() * grades.length)] : null;

      return {
        id: index + 1,
        name: `قطعة غيار ${index + 1}`,
        category: categories[index % categories.length],
        brand: brands[index % brands.length],
        condition: condition,
        type: types[index % types.length],
        price: basePrice,
        oldPrice: isOnSale ? basePrice + Math.floor(Math.random() * 500) + 100 : null,
        imageUrl: `../../assets/images/image100_100.png`,
        storeName: `متجر ${index + 1}`,
        sellerId: index + 100,
        sellerPhone: `201000000${String(index).padStart(3, '0')}`,
        isOnSale: isOnSale,
        freeDelivery: index % 5 === 0,
        quantity: quantity,
        availability: quantity > 0 ? 'متوفر' : 'غير متوفر',
        grade: grade
      };
    });
  }

  onSearch(event: any) {
    const text = event.target.value.toLowerCase();
    this.filteredParts = this.allParts.filter(part =>
      part.name.toLowerCase().includes(text)
    );

    // Suggestions
    this.suggestions = this.allParts
      .map(part => part.name)
      .filter(name => name.toLowerCase().includes(text))
      .slice(0, 5);
  }

  selectSuggestion(suggestion: string) {
    this.searchText = suggestion;
    this.filteredParts = this.allParts.filter(part =>
      part.name === suggestion
    );
    this.suggestions = [];
  }
}

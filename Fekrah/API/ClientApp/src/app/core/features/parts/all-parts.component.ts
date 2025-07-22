// all-parts.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-parts',
  templateUrl: './all-parts.component.html',
  styleUrls: ['./all-parts.component.scss']
})
export class AllPartsComponent implements OnInit {

  allParts = [
    { id: 1, name: 'بوابة الهواء', imageUrl: 'assets/images/image100_100.png', category: 'نظام الوقود' },
    { id: 2, name: 'شورت بلوك', imageUrl: 'assets/images/image100_100.png', category: 'المحرك' },
    { id: 3, name: 'كتاوت', imageUrl: 'assets/images/image100_100.png', category: 'نظام الإشعال' },
    { id: 4, name: 'دينامو', imageUrl: 'assets/images/image100_100.png', category: 'النظام الكهربائي' },
    { id: 5, name: 'صليبة', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 6, name: 'دركسيون', imageUrl: 'assets/images/image100_100.png', category: 'نظام التوجيه' },
    { id: 7, name: 'فلتر زيت', imageUrl: 'assets/images/image100_100.png', category: 'الفلاتر' },
    { id: 8, name: 'فلتر هواء', imageUrl: 'assets/images/image100_100.png', category: 'الفلاتر' },
    { id: 9, name: 'فلتر بنزين', imageUrl: 'assets/images/image100_100.png', category: 'الفلاتر' },
    { id: 10, name: 'طلمبة بنزين', imageUrl: 'assets/images/image100_100.png', category: 'نظام الوقود' },
    { id: 11, name: 'كبالن', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 12, name: 'مقصات', imageUrl: 'assets/images/image100_100.png', category: 'نظام التعليق' },
    { id: 13, name: 'كبالن داخلية', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 14, name: 'كبالن خارجية', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 15, name: 'سربنتينة تكييف', imageUrl: 'assets/images/image100_100.png', category: 'نظام التكييف' },
    { id: 16, name: 'طرمبة مياه', imageUrl: 'assets/images/image100_100.png', category: 'نظام التبريد' },
    { id: 17, name: 'بوجيهات', imageUrl: 'assets/images/image100_100.png', category: 'نظام الإشعال' },
    { id: 18, name: 'حساس حرارة', imageUrl: 'assets/images/image100_100.png', category: 'أجهزة الاستشعار' },
    { id: 19, name: 'سير كاتينة', imageUrl: 'assets/images/image100_100.png', category: 'المحرك' },
    { id: 20, name: 'سير مجموعة', imageUrl: 'assets/images/image100_100.png', category: 'المحرك' },
    { id: 21, name: 'رادياتير', imageUrl: 'assets/images/image100_100.png', category: 'نظام التبريد' },
    { id: 22, name: 'كوع مياه', imageUrl: 'assets/images/image100_100.png', category: 'نظام التبريد' },
    { id: 23, name: 'مروحة تبريد', imageUrl: 'assets/images/image100_100.png', category: 'نظام التبريد' },
    { id: 24, name: 'سلك فتيس', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 25, name: 'كبالن فتيس', imageUrl: 'assets/images/image100_100.png', category: 'ناقل الحركة' },
    { id: 26, name: 'ردياتير تكييف', imageUrl: 'assets/images/image100_100.png', category: 'نظام التكييف' },
    { id: 27, name: 'ردياتير مياه', imageUrl: 'assets/images/image100_100.png', category: 'نظام التبريد' },
    { id: 28, name: 'ذراع دركسيون', imageUrl: 'assets/images/image100_100.png', category: 'نظام التوجيه' },
    { id: 29, name: 'بيضة', imageUrl: 'assets/images/image100_100.png', category: 'نظام التعليق' },
    { id: 30, name: 'مساعد خلفي', imageUrl: 'assets/images/image100_100.png', category: 'نظام التعليق' },
    { id: 31, name: 'مساعد أمامي', imageUrl: 'assets/images/image100_100.png', category: 'نظام التعليق' },
    { id: 32, name: 'كمبرسور تكييف', imageUrl: 'assets/images/image100_100.png', category: 'نظام التكييف' },
    { id: 33, name: 'تيل فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 34, name: 'اسطوانة فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 35, name: 'قرص فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 36, name: 'خرطوم فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 37, name: 'مضخة فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 38, name: 'كالبر فرامل', imageUrl: 'assets/images/image100_100.png', category: 'نظام الفرامل' },
    { id: 39, name: 'إطار احتياطي', imageUrl: 'assets/images/image100_100.png', category: 'الإطارات' },
    { id: 40, name: 'جنط', imageUrl: 'assets/images/image100_100.png', category: 'الإطارات' },
    { id: 41, name: 'صمام إطار', imageUrl: 'assets/images/image100_100.png', category: 'الإطارات' },
    { id: 42, name: 'مصباح أمامي', imageUrl: 'assets/images/image100_100.png', category: 'الإضاءة' },
    { id: 43, name: 'مصباح خلفي', imageUrl: 'assets/images/image100_100.png', category: 'الإضاءة' },
    { id: 44, name: 'لمبة إشارة', imageUrl: 'assets/images/image100_100.png', category: 'الإضاءة' },
    { id: 45, name: 'لمبة فرامل', imageUrl: 'assets/images/image100_100.png', category: 'الإضاءة' }
  ];

  filteredParts = [...this.allParts];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 12;

  constructor(private router: Router) {}

  ngOnInit() {
    this.extractCategories();
  }

  private extractCategories() {
    const uniqueCategories = [...new Set(this.allParts.map(part => part.category))];
    this.categories = uniqueCategories.sort();
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredParts = this.allParts.filter(part => {
      const matchesCategory = !this.selectedCategory || part.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ||
        part.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.filteredParts = [...this.allParts];
  }

  get paginatedParts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredParts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredParts.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  navigateToCategory(partId: number) {
    this.router.navigate(['/category', partId]);
  }

  trackByPartId(index: number, part: any): number {
    return part.id;
  }
}

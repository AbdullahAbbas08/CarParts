import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs';

export interface FilterData {
  searchText?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  partCategory?: string;
  priceRange?: string;
  location?: string;
  inStock?: boolean;
}

export interface PartItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  category: string;
  price: number;
  location: string;
  inStock: boolean;
  description?: string;
  images?: string[];
  sellerId: string;
  sellerName: string;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filtersSubject = new BehaviorSubject<FilterData>({});
  private partsDataSubject = new BehaviorSubject<PartItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable للفلاتر الحالية
  filters$ = this.filtersSubject.asObservable();

  // Observable للبيانات الأصلية
  partsData$ = this.partsDataSubject.asObservable();

  // Observable لحالة التحميل
  loading$ = this.loadingSubject.asObservable();

  // Observable للبيانات المفلترة
  filteredParts$: Observable<PartItem[]> = combineLatest([
    this.partsData$,
    this.filters$.pipe(
      debounceTime(300), // تأخير لتحسين الأداء
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    )
  ]).pipe(
    map(([parts, filters]) => this.filterParts(parts, filters))
  );

  constructor() {
    // تحميل البيانات المحفوظة عند البدء
    this.loadSavedFilters();
  }

  // تحديث الفلاتر
  updateFilters(filters: FilterData): void {
    this.filtersSubject.next(filters);
    this.saveFiltersToStorage(filters);
  }

  // الحصول على الفلاتر الحالية
  getCurrentFilters(): FilterData {
    return this.filtersSubject.value;
  }

  // إعادة تعيين الفلاتر
  resetFilters(): void {
    this.filtersSubject.next({});
    this.clearSavedFilters();
  }

  // تحديث بيانات القطع
  updatePartsData(parts: PartItem[]): void {
    this.partsDataSubject.next(parts);
  }

  // تعيين حالة التحميل
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // فلترة البيانات
  private filterParts(parts: PartItem[], filters: FilterData): PartItem[] {
    if (!parts || parts.length === 0) {
      return [];
    }

    return parts.filter(part => {
      // فلتر النص
      if (filters.searchText && filters.searchText.trim()) {
        const searchTerm = filters.searchText.toLowerCase().trim();
        const matchesText = part.name.toLowerCase().includes(searchTerm) ||
                           part.description?.toLowerCase().includes(searchTerm) ||
                           part.brand.toLowerCase().includes(searchTerm) ||
                           part.model.toLowerCase().includes(searchTerm);
        if (!matchesText) return false;
      }

      // فلتر الماركة
      if (filters.brand && part.brand !== filters.brand) {
        return false;
      }

      // فلتر الموديل
      if (filters.model && part.model !== filters.model) {
        return false;
      }

      // فلتر السنة
      if (filters.year && part.year !== filters.year) {
        return false;
      }

      // فلتر الحالة
      if (filters.condition && part.condition !== filters.condition) {
        return false;
      }

      // فلتر الفئة
      if (filters.partCategory && part.category !== filters.partCategory) {
        return false;
      }

      // فلتر السعر
      if (filters.priceRange && !this.matchesPriceRange(part.price, filters.priceRange)) {
        return false;
      }

      // فلتر الموقع
      if (filters.location && filters.location.trim()) {
        const locationTerm = filters.location.toLowerCase().trim();
        if (!part.location.toLowerCase().includes(locationTerm)) {
          return false;
        }
      }

      // فلتر التوفر في المخزون
      if (filters.inStock && !part.inStock) {
        return false;
      }

      return true;
    });
  }

  // فحص نطاق السعر
  private matchesPriceRange(price: number, range: string): boolean {
    switch (range) {
      case '0-100':
        return price < 100;
      case '100-500':
        return price >= 100 && price <= 500;
      case '500-1000':
        return price >= 500 && price <= 1000;
      case '1000-5000':
        return price >= 1000 && price <= 5000;
      case '5000+':
        return price > 5000;
      default:
        return true;
    }
  }

  // حفظ الفلاتر في التخزين المحلي
  private saveFiltersToStorage(filters: FilterData): void {
    try {
      localStorage.setItem('parts_filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to storage:', error);
    }
  }

  // تحميل الفلاتر المحفوظة
  private loadSavedFilters(): void {
    try {
      const saved = localStorage.getItem('parts_filters');
      if (saved) {
        const filters = JSON.parse(saved);
        this.filtersSubject.next(filters);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }

  // مسح الفلاتر المحفوظة
  private clearSavedFilters(): void {
    try {
      localStorage.removeItem('parts_filters');
    } catch (error) {
      console.error('Error clearing saved filters:', error);
    }
  }

  // إحصائيات الفلترة
  getFilterStats(): Observable<{
    totalParts: number;
    filteredParts: number;
    appliedFiltersCount: number;
  }> {
    return combineLatest([
      this.partsData$,
      this.filteredParts$,
      this.filters$
    ]).pipe(
      map(([allParts, filteredParts, filters]) => ({
        totalParts: allParts.length,
        filteredParts: filteredParts.length,
        appliedFiltersCount: Object.values(filters).filter(value =>
          value !== '' && value !== null && value !== undefined
        ).length
      }))
    );
  }

  // البحث المتقدم
  advancedSearch(criteria: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    dateRange?: { from: Date; to: Date };
    sellerIds?: string[];
  }): Observable<PartItem[]> {
    return this.filteredParts$.pipe(
      map(parts => parts.filter(part => {
        if (criteria.minPrice && part.price < criteria.minPrice) return false;
        if (criteria.maxPrice && part.price > criteria.maxPrice) return false;
        if (criteria.minRating && part.rating < criteria.minRating) return false;
        if (criteria.dateRange) {
          const partDate = new Date(part.createdAt);
          if (partDate < criteria.dateRange.from || partDate > criteria.dateRange.to) {
            return false;
          }
        }
        if (criteria.sellerIds && !criteria.sellerIds.includes(part.sellerId)) {
          return false;
        }
        return true;
      }))
    );
  }
}

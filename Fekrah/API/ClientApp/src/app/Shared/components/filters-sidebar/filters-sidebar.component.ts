import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges } from '@angular/core';

export interface FilterSections {
  key: string;
  title: string;
  icon: string;
}

export interface SelectedFilters {
  brands: string[];
  models: string[];
  years: string[];
  types: string[];
  categories: string[];
  condition: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

@Component({
  selector: 'app-filters-sidebar',
  templateUrl: './filters-sidebar.component.html',
  styleUrls: ['./filters-sidebar.component.scss']
})
export class FiltersSidebarComponent implements OnInit, OnChanges {
  @Input() showSidebar: boolean = false;
  @Input() filterSections: FilterSections[] = [];
  @Input() availableBrands: string[] = [];
  @Input() availableModels: string[] = [];
  @Input() availableYears: string[] = [];
  @Input() availableTypes: string[] = [];
  @Input() availableCategories: string[] = [];
  @Input() availableConditions: string[] = [];
  @Input() selectedFilters: SelectedFilters = {
    brands: [],
    models: [],
    years: [],
    types: [],
    categories: [],
    condition: [],
    priceRange: { min: 0, max: 10000 }
  };
  @Input() activeFilterSection: string = '';

  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleFilterSection = new EventEmitter<string>();
  @Output() toggleFilter = new EventEmitter<{type: string, value: string}>();
  @Output() clearAllFilters = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    console.log('FiltersSidebarComponent initialized. showSidebar:', this.showSidebar);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showSidebar']) {
      console.log('FiltersSidebarComponent: showSidebar changed from', 
        changes['showSidebar'].previousValue, 'to', changes['showSidebar'].currentValue);
    }
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onToggleFilterSection(sectionKey: string): void {
    this.toggleFilterSection.emit(sectionKey);
  }

  onToggleFilter(type: string, value: string): void {
    this.toggleFilter.emit({ type, value });
  }

  onClearAllFilters(): void {
    this.clearAllFilters.emit();
  }
}

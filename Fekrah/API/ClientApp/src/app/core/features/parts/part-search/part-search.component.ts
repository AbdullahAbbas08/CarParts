import { Component, OnInit } from '@angular/core';
import { SwaggerClient } from '../../../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-part-search',
  templateUrl: './part-search.component.html',
  styleUrls: ['./part-search.component.scss']
})
export class PartSearchComponent implements OnInit {

  allParts: any[] = [];
  filteredParts: any[] = [];

  constructor(private apiClient: SwaggerClient) { }

  ngOnInit(): void {
    // this.apiClient.apiPartsGet().subscribe(parts => {
    //   this.allParts = parts;
    //   this.filteredParts = parts; // مبدأياً كل القطع
    // });
  }

  applyFilters(filters: any) {
    this.filteredParts = this.allParts.filter(part => {
      const matchName = filters.name ? part.name?.toLowerCase().includes(filters.name.toLowerCase()) : true;
      const matchCondition = filters.condition ? part.condition === filters.condition : true;
      const matchCategory = filters.categoryId ? part.categoryName === filters.categoryName : true;
      return matchName && matchCondition && matchCategory;
    });
  }
}

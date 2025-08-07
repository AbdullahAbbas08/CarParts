import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SwaggerClient, DataSourceResultOfBrandDTO, BrandDTO } from '../../Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {

  // Statistics properties
  totalBrands: number = 0;
  totalModelTypes: number = 0;
  isLoadingStats: boolean = false;

  constructor(
    private router: Router,
    private swaggerClient: SwaggerClient
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  navigateToBrands(): void {
    this.router.navigate(['admin/lookup/brand']);
  }

  navigateToModelTypes(): void {
    this.router.navigate(['admin/lookup/model-type']);
  }

  private loadStatistics(): void {
    this.isLoadingStats = true;
    
    // Load brands count
    this.swaggerClient.apiCarsModelGetAllGet(1, 1, '').subscribe({
      next: (response: DataSourceResultOfBrandDTO) => {
        this.totalBrands = response.count || 0;
        this.checkStatsLoadComplete();
      },
      error: (error: any) => {
        console.error('Error loading brands count:', error);
        this.checkStatsLoadComplete();
      }
    });

    // Load model types count by getting brands with their model types
    this.swaggerClient.apiCarsModelGetAllGet(100, 1, '').subscribe({
      next: (response: DataSourceResultOfBrandDTO) => {
        let modelTypesCount = 0;
        if (response.data) {
          response.data.forEach((brand: BrandDTO) => {
            if (brand.modelTypes && brand.modelTypes.length > 0) {
              modelTypesCount += brand.modelTypes.length;
            }
          });
        }
        this.totalModelTypes = modelTypesCount;
        this.checkStatsLoadComplete();
      },
      error: (error: any) => {
        console.error('Error loading model types count:', error);
        this.checkStatsLoadComplete();
      }
    });
  }

  private checkStatsLoadComplete(): void {
    // Simple check - in real scenario you might want to track both calls
    this.isLoadingStats = false;
  }

  // Helper methods for template
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getActiveCount(): number {
    return this.totalBrands + this.totalModelTypes;
  }
}

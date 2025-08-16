import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataSourceResultOfUserDTO, PartDTO, SwaggerClient } from '../../Shared/Services/Swagger/SwaggerClient.service';
import { CarPart } from '../../Shared/Models/car-card';

@Injectable({
  providedIn: 'root'
})
export class ProductManagementService {


  constructor(private swaggerClient: SwaggerClient) { }
  
  productsCount:number = 0;
  loadProduct(pageSize: number = 10, page: number = 1, searchTerm: string = ''): Observable<DataSourceResultOfUserDTO> {
   
     
    return this.swaggerClient.apiPartsGetAllGet(pageSize, page, searchTerm || undefined).pipe(
      map((result: DataSourceResultOfUserDTO) => {
        if (result.data) {
            this.productsCount = result.count || 0;
        }
        return result;
      }),
      catchError((error) => {
        console.error('Error loading users:', error);
        throw error;
      })
    );
  }

getProducStatistics(): Observable<any[]> {
  return this.loadProduct(1000, 1).pipe(
    map((result: DataSourceResultOfUserDTO) => {
      const users = result.data || [];

    //   const carParts: CarPart[] = users.map((item: PartDTO) => ({
    //     isFavorite: item.isFavorite || false,
    //     condition:item.condition || '',
    //     id: item.id || '',
    //     name:item.name || '',
    //     subtitle:'',
    //       car: {
    //       brand: item.carModelTypeName|| '',
    //       model: item.carModelName|| '',
    //       year: item.yearOfManufacture || '',
    //     },
    //     condition:item.conditionName || '',
    //     grade:item.
    //   }));

      return users;
    })
  );
}





  
}

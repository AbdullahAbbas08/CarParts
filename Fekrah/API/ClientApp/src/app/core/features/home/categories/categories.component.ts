import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CategoryDto, SwaggerClient } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  @ViewChild('brandsSection') brandsSection!: ElementRef;
 categories:CategoryDto[] = [];


 constructor(private swagger:SwaggerClient) {

  }

  ngOnInit(): void { 
    this.getAllCat()
  }
    getAllCat(){
    this.swagger.apiCategoriesGetAllGet(10,1,undefined).subscribe((res)=> {
      if(res){
        this.categories = res.data
      }
    })
  }
  scrollToBrands() {
    this.brandsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
  scrollLeft(): void {
    this.scrollContainer.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.scrollContainer.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollToCategory(code: string) {
    const el = document.getElementById(code);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }



}

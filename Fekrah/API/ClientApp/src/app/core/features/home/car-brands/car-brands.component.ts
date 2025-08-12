import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { LoaderService  } from '../../../../Shared/Services/Loader.service';
import { BrandDTO, DataSourceResultOfBrandDTO, SwaggerClient } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-car-brands',
  templateUrl: './car-brands.component.html',
  styleUrls: ['./car-brands.component.scss']
})
export class CarBrandsComponent implements OnInit {
  carBrands:BrandDTO[] = [];
  constructor(private swagger: SwaggerClient,private loaderService: LoaderService) {}
  ngOnInit() {
    new Swiper('.brand-types-swiper', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 15,
      slidesPerGroup: 1,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 8000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.brand-types-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.brand-types-button-next',
        prevEl: '.brand-types-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 10,
        },
        480: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 3,
          slidesPerGroup: 1,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 5,
          slidesPerGroup: 1,
          spaceBetween: 25,
        },
      }
    });
    this.getAllCarBrands();
  }
  getAllCarBrands(){
          this.loaderService.show(); 
        this.swagger.apiBrandGetAllGet(10,1,undefined).subscribe((res:DataSourceResultOfBrandDTO) => {
        if(res){
           this.carBrands = res.data;
           this.loaderService.hide(); 
        }
    })
  }
}

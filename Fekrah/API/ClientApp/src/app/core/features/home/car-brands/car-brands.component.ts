import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { CarsModelDto, DataSourceResultOfCarsModelDto, SwaggerClient } from '../../../../Shared/Services/Swagger/SwaggerClient.service';
import { LoaderService } from '../../../../Shared/Services/Loader.service';

@Component({
  selector: 'app-car-brands',
  templateUrl: './car-brands.component.html',
  styleUrls: ['./car-brands.component.scss']
})
export class CarBrandsComponent implements OnInit {
  carBrands:CarsModelDto[] = [];
  constructor(private swagger: SwaggerClient,private loaderService: LoaderService) {}
  ngOnInit() {
                     new Swiper('.swiper', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 2,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 3,
          spaceBetween: 10,  // زيادة المسافة بين الكروت هنا
          centeredSlides: false,
        },
        480: {
          slidesPerView: 4,
          spaceBetween: 20,  // زيادة المسافة هنا أيضاً
        },
        768: {
          slidesPerView: 6,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 10,
          spaceBetween: 10,
        },
      }

    });
    this.getAllCarBrands();

  }
  getAllCarBrands(){
          this.loaderService.show(); 
        this.swagger.apiCarsModelGetAllGet(10,1,undefined).subscribe((res:DataSourceResultOfCarsModelDto) => {
        if(res){
           this.carBrands = res.data;
           this.loaderService.hide(); 
        }
    })
  }
}

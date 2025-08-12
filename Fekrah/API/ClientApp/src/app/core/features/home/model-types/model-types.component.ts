import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { LoaderService } from '../../../../Shared/Services/Loader.service';
import { ModelTypeDTO, SwaggerClient } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';

@Component({
  selector: 'app-model-types',
  templateUrl: './model-types.component.html',
  styleUrls: ['./model-types.component.scss']
})
export class ModelTypesComponent implements OnInit {
  modelTypes: ModelTypeDTO[] = [];
  
  constructor(
    private swagger: SwaggerClient,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit() {
    new Swiper('.model-types-swiper', {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 15,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 8000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.model-types-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.model-types-button-next',
        prevEl: '.model-types-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        480: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 6,
          spaceBetween: 25,
        },
      }
    });
    this.getAllModelTypes();
  }

  getAllModelTypes() {
    this.loaderService.show();
    this.swagger.apiModelTypeGetAllGet(20, 1, undefined).subscribe((res: any) => {
      if (res && res.data) {
        this.modelTypes = res.data;
        this.loaderService.hide();
      }
    });
  }

  viewMoreModelTypes() {
    // Navigate to the model types management page
    this.router.navigate(['/admin/lookup/model-type']);
  }
}

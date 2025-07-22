// part-types.component.ts - Updated with View More functionality
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

@Component({
  selector: 'app-part-types',
  templateUrl: './part-types.component.html',
  styleUrls: ['./part-types.component.scss']
})
export class PartTypesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  partTypes = [
    { id: 1, name: 'بوابة الهواء', imageUrl: 'assets/images/image100_100.png' },
    { id: 2, name: 'شورت بلوك', imageUrl: 'assets/images/image100_100.png' },
    { id: 3, name: 'كتاوت', imageUrl: 'assets/images/image100_100.png' },
    { id: 4, name: 'دينامو', imageUrl: 'assets/images/image100_100.png' },
    { id: 5, name: 'صليبة', imageUrl: 'assets/images/image100_100.png' },
    { id: 6, name: 'دركسيون', imageUrl: 'assets/images/image100_100.png' },
    { id: 7, name: 'فلتر زيت', imageUrl: 'assets/images/image100_100.png' },
    { id: 8, name: 'فلتر هواء', imageUrl: 'assets/images/image100_100.png' },
    { id: 9, name: 'فلتر بنزين', imageUrl: 'assets/images/image100_100.png' },
    { id: 10, name: 'طلمبة بنزين', imageUrl: 'assets/images/image100_100.png' },
    { id: 11, name: 'كبالن', imageUrl: 'assets/images/image100_100.png' },
    { id: 12, name: 'مقصات', imageUrl: 'assets/images/image100_100.png' },
    { id: 13, name: 'كبالن داخلية', imageUrl: 'assets/images/image100_100.png' },
    { id: 14, name: 'كبالن خارجية', imageUrl: 'assets/images/image100_100.png' },
    { id: 15, name: 'سربنتينة تكييف', imageUrl: 'assets/images/image100_100.png' },
    { id: 16, name: 'طرمبة مياه', imageUrl: 'assets/images/image100_100.png' },
    { id: 17, name: 'بوجيهات', imageUrl: 'assets/images/image100_100.png' },
    { id: 18, name: 'حساس حرارة', imageUrl: 'assets/images/image100_100.png' },
    { id: 19, name: 'سير كاتينة', imageUrl: 'assets/images/image100_100.png' },
    { id: 20, name: 'سير مجموعة', imageUrl: 'assets/images/image100_100.png' },
    { id: 21, name: 'رادياتير', imageUrl: 'assets/images/image100_100.png' },
    { id: 22, name: 'كوع مياه', imageUrl: 'assets/images/image100_100.png' },
    { id: 23, name: 'مروحة تبريد', imageUrl: 'assets/images/image100_100.png' },
    { id: 24, name: 'سلك فتيس', imageUrl: 'assets/images/image100_100.png' },
    { id: 25, name: 'كبالن فتيس', imageUrl: 'assets/images/image100_100.png' },
    { id: 26, name: 'ردياتير تكييف', imageUrl: 'assets/images/image100_100.png' },
    { id: 27, name: 'ردياتير مياه', imageUrl: 'assets/images/image100_100.png' },
    { id: 28, name: 'ذراع دركسيون', imageUrl: 'assets/images/image100_100.png' },
    { id: 29, name: 'بيضة', imageUrl: 'assets/images/image100_100.png' },
    { id: 30, name: 'مساعد خلفي', imageUrl: 'assets/images/image100_100.png' }
  ];

  private swiper: Swiper | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    Swiper.use([Navigation, Pagination, Autoplay]);
  }

  ngAfterViewInit() {
    setTimeout(() => this.initializeSwiper(), 0);
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  private initializeSwiper() {
    const swiperElement = this.swiperRef?.nativeElement;
    if (!swiperElement) return;

    this.swiper = new Swiper(swiperElement, {
      slidesPerView: 5,
      spaceBetween: 15,
      loop: true,
      centeredSlides: false,
      autoplay: {
        delay: 5000,
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
        320: { slidesPerView: 2, spaceBetween: 10 },
        480: { slidesPerView: 3, spaceBetween: 12 },
        768: { slidesPerView: 4, spaceBetween: 15 },
        1024: { slidesPerView: 5, spaceBetween: 18 },
        1280: { slidesPerView: 6, spaceBetween: 20 }
      }
    });
  }

  // Navigate to specific category
  navigateToCategory(partId: number) {
    this.router.navigate(['/category', partId]);
  }

  // Navigate to all parts page
  viewAllParts() {
    this.router.navigate(['/parts']);
  }

  trackByPartName(index: number, part: { name: string }): string {
    return part.name;
  }
}

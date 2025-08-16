import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-full-width-banner',
  templateUrl: './full-width-banner.component.html',
  styleUrls: ['./full-width-banner.component.scss']
})
export class FullWidthBannerComponent {
  @Input() imagePath: string = 'assets/images/variable_section/banner1.png';
  @Input() altText: string = 'Banner';
  @Input() size: number = 1; // 1 = 100%, 0.5 = 50%
  @Input() height: number = 1; // 1 = 85vh, 0.75 = 63.75vh, 0.5 = 42.5vh, 0.25 = 21.25vh

  get bannerWidth(): string {
    return `${this.size * 100}%`;
  }

  get bannerHeight(): string {
    return `${this.height * 85}vh`;
  }
}

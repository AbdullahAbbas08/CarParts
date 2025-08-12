import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-full-width-banner',
  templateUrl: './full-width-banner.component.html',
  styleUrls: ['./full-width-banner.component.scss']
})
export class FullWidthBannerComponent {
  @Input() imagePath: string = 'assets/images/variable_section/banner1.png';
  @Input() altText: string = 'Banner';
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrls: ['./part-list.component.scss']
})
export class PartListComponent {
  @Input() parts: any[] = [];
}

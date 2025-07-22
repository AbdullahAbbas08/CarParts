import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { LoaderService } from '../../Services/Loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  loading$!: Observable<boolean>;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.loading$ = this.loaderService.loading$;
  }
}
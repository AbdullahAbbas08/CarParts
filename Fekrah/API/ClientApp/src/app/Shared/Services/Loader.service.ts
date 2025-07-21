import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingSubject.next(true);
    document.body.classList.add('no-scroll');
  }

  hide(): void {
    this.loadingSubject.next(false);
      document.body.classList.remove('no-scroll'); 
  }
}
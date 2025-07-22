import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let hasToken = localStorage.getItem('token');

    
    if(hasToken) {

      const modifiedRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${localStorage.getItem("token")}`)
      });

      return next.handle(modifiedRequest);
    }

    return next.handle(request);
  }
}

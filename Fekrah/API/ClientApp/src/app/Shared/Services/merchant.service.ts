import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Merchant } from '../Models/merchant.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  private baseUrl = `${environment.BASE_URL}/api`;
  private currentMerchantSubject = new BehaviorSubject<Merchant | null>(null);
  public currentMerchant$ = this.currentMerchantSubject.asObservable();

  constructor(private http: HttpClient) { }

  getMerchant(id: number): Observable<Merchant> {
    return this.http.get<Merchant>(`${this.baseUrl}/merchants/${id}`);
  }

  getCurrentMerchant(): Observable<Merchant> {
    return this.http.get<Merchant>(`${this.baseUrl}/merchants/current`);
  }

  updateMerchant(merchant: Merchant): Observable<Merchant> {
    return this.http.put<Merchant>(`${this.baseUrl}/merchants/${merchant.id}`, merchant);
  }

  uploadLogo(merchantId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/merchants/${merchantId}/logo`, formData);
  }

  uploadCommercialRegistration(merchantId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/merchants/${merchantId}/commercial-registration`, formData);
  }

  uploadNationalId(merchantId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/merchants/${merchantId}/national-id`, formData);
  }

  addToFavorites(merchantId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/merchants/${merchantId}/favorite`, {});
  }

  removeFromFavorites(merchantId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/merchants/${merchantId}/favorite`);
  }

  setCurrentMerchant(merchant: Merchant): void {
    this.currentMerchantSubject.next(merchant);
  }

  getCurrentMerchantValue(): Merchant | null {
    return this.currentMerchantSubject.value;
  }
}

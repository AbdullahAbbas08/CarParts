import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, finalize, map, takeLast } from 'rxjs/operators';
import { AuthDto, SwaggerClient, UserTypeEnum } from '../../../Shared/Services/Swagger/SwaggerClient.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user$ = new BehaviorSubject<AuthDto | undefined>(undefined);
  public token: string | undefined;
  private user:AuthDto | undefined;
  public authStatus: boolean = false;
  public authUserType!:UserTypeEnum
  authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private swaggerService: SwaggerClient,

  ) {
   }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }
  currentUserSub() {
    return this.user$.asObservable();
  }
  getAuthStatus() {
    return this.authStatus;
  }
  getUserType(){
    return this.authUserType
  }

  loginUser(body: any) {
    return this.swaggerService.apiAccountLoginPost(body).pipe(map((res: AuthDto) => {
      this.token = res.token;
      if (!this.token) {
        this.authStatus = false;
        this.authStatusListener.next(false);
        this.user = undefined;
        this.user$.next(undefined);
        return false;
      } else {
        this.user = res;
        this.authUserType = res.userType!
        return true
      }
    },
    )

    );
  }
  saveAuthData(token:string | undefined, user:AuthDto | undefined) {
    localStorage.setItem('token', token!);
    localStorage.setItem('user', JSON.stringify(user)!);
  }
  getUserAuthData(){
    this.user$.next(this.user);
    this.authStatus = true;
    this.authStatusListener.next(true);
    this.saveAuthData(this.token, this.user);
    this.router.navigate(['/']);
  }
  getAuthData() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token) return;
    return {
      token: token,
      user: user,
    };
  }
  autoAuthUser() {
    const authData = this.getAuthData();

    if (!authData) {
      return;
    }
      this.token = authData.token;
      this.user = JSON.parse(authData.user!);
      this.authStatus = true;
      this.authStatusListener.next(true);
      this.user$.next(JSON.parse(authData.user!));
      this.authUserType = this.user?.userType!
  }
  clearAuthData() {
    this.authStatus = false;
    this.authStatusListener.next(false);
    this.user = undefined;
    this.user$.next(undefined);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
  }

  getheaders(): HttpHeaders {
    let accessToken = this.token;
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Cache-Control', 'no-cache');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Authorization', `Bearer ${accessToken}`);
    return headers;
  }

}
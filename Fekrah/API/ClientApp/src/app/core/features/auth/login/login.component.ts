import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthDto, SwaggerClient } from '../../../../Shared/Services/Swagger/SwaggerClient.service';
import { AuthService } from '../auth.service';
import { LoaderService } from '../../../../Shared/Services/Loader.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private swagger: SwaggerClient,
    private authService:AuthService,
    private loaderService: LoaderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

 onSubmit() {
    this.authService.clearAuthData()
    if (!this.loginForm.valid) {
      return 
    }

     this.loaderService.show(); 
    

    this.authService.loginUser(this.loginForm.value).subscribe((isLoggedIn:boolean) => {
        if(isLoggedIn){
           this.authService.getUserAuthData();
          this.toastr.success("تم تسجيل الدخول بنجاح")
          this.loaderService.hide(); 
          this.router.navigate(['/']);
        } else {
          this.toastr.error("من فضلك تأكد من البيانات المدخلة")
          this.loaderService.hide(); 
        }
    });
  }
}
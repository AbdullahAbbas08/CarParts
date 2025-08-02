import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthDto, SwaggerClient, UserTypeEnum } from '../../../../Shared/Services/Swagger/SwaggerClient.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;

  roles = [
    { id: UserTypeEnum.Client, label: 'عميل (Client)' },
    { id: UserTypeEnum.Merchant, label: 'تاجر (Merchant)' },
    { id: UserTypeEnum.ShippingCompany, label: 'شركة شحن (Shipping Company)' },
  ];

  constructor(private fb: FormBuilder, private swagger: SwaggerClient,private toastr: ToastrService,  private router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      userType: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

const formData = {
  ...this.signupForm.value,
  userType: Number(this.signupForm.value.userType)
};  
    this.swagger.apiAccountRegisterNewUserPost(formData).subscribe((response:AuthDto) => {
       if(response.message === 'تم تسجيل مستخدم جديد بنجاح .'){
          this.toastr.success('تم التسجيل بنجاح', 'نجاح');
           this.router.navigate(['/auth/login']);
       }else {
          this.toastr.error(response.message);
       }
    })

    // TODO: Call your API here
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      userType: ['user', Validators.required], // default value
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]], // رقم مصري مثلاً
    }, {
      validators: [this.matchPasswords('password', 'confirmPassword')]
    });
  }

  matchPasswords(password: string, confirmPassword: string) {
    return (formGroup: AbstractControl) => {
      const pass = formGroup.get(password);
      const confirm = formGroup.get(confirmPassword);

      if (pass && confirm && pass.value !== confirm.value) {
        confirm.setErrors({ notMatched: true });
      } else {
        confirm?.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const formData = this.signupForm.value;
    console.log('📦 بيانات التسجيل:', formData);

    // TODO: Call your API here
  }
}
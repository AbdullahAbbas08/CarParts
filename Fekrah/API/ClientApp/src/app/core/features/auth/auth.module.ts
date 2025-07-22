import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component'; // ← تأكد من المسار الصحيح
import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';


@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    SignUpComponent
  ],
  imports: [
   CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }

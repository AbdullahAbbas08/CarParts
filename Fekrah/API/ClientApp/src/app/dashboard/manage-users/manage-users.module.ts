import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ManageUsersRoutingModule } from './manage-users-routing.module';
import { ManageUsersComponent } from './manage-users.component';
import { UserManagementService } from './user-management.service';

@NgModule({
  declarations: [
    ManageUsersComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ManageUsersRoutingModule
  ],
  providers: [
    UserManagementService
  ]
})
export class ManageUsersModule { }

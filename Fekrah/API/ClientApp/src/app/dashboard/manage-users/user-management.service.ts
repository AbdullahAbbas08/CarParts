import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataSourceResultOfUserDTO, SwaggerClient, UserDTO, UserTypeEnum } from 'src/app/Shared/Services/Swagger/SwaggerClient.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private usersSubject = new BehaviorSubject<UserDTO[]>([]);
  public users$ = this.usersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private totalCountSubject = new BehaviorSubject<number>(0);
  public totalCount$ = this.totalCountSubject.asObservable();

  constructor(private swaggerClient: SwaggerClient) { }

  /**
   * Load all users with pagination and search
   */
  loadUsers(pageSize: number = 10, page: number = 1, searchTerm: string = ''): Observable<DataSourceResultOfUserDTO> {
    this.loadingSubject.next(true);
    
    return this.swaggerClient.apiAccountGetAllGet(pageSize, page, searchTerm || undefined).pipe(
      map((result: DataSourceResultOfUserDTO) => {
        if (result.data) {
          this.usersSubject.next(result.data);
          this.totalCountSubject.next(result.count || 0);
        }
        this.loadingSubject.next(false);
        return result;
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        console.error('Error loading users:', error);
        throw error;
      })
    );
  }

  /**
   * Get user details by ID
   */
  getUserById(id: number): Observable<UserDTO> {
    return this.swaggerClient.apiAccountGetDetailsGet(id);
  }

  /**
   * Create new user
   */
  createUser(user: UserDTO): Observable<UserDTO> {
    return this.swaggerClient.apiAccountInsertPost(user).pipe(
      map((newUser: UserDTO) => {
        // Refresh the users list after creating a new user
        this.refreshUsers();
        return newUser;
      }),
      catchError((error) => {
        console.error('Error creating user:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing user
   */
  updateUser(user: UserDTO): Observable<UserDTO> {
    return this.swaggerClient.apiAccountUpdatePost(user).pipe(
      map((updatedUser: UserDTO) => {
        // Refresh the users list after updating
        this.refreshUsers();
        return updatedUser;
      }),
      catchError((error) => {
        console.error('Error updating user:', error);
        throw error;
      })
    );
  }

  /**
   * Delete user by ID
   */
  deleteUser(id: number): Observable<UserDTO> {
    return this.swaggerClient.apiAccountDeletePost(id).pipe(
      map((deletedUser: UserDTO) => {
        // Refresh the users list after deletion
        this.refreshUsers();
        return deletedUser;
      }),
      catchError((error) => {
        console.error('Error deleting user:', error);
        throw error;
      })
    );
  }

  /**
   * Set user active status (Enable/Disable user)
   */
  setUserActiveStatus(userId: number, isActive: boolean): Observable<any> {
    return this.swaggerClient.apiAccountSetUserActiveStatusPatch(userId, isActive).pipe(
      map((result) => {
        // Update the user in the local list
        const currentUsers = this.usersSubject.value;
        const updatedUsers = currentUsers.map(user => {
          if (user.id === userId) {
            const updatedUser = new UserDTO(user);
            updatedUser.isActive = isActive;
            return updatedUser;
          }
          return user;
        });
        this.usersSubject.next(updatedUsers);
        return result;
      }),
      catchError((error) => {
        console.error('Error setting user active status:', error);
        throw error;
      })
    );
  }

  /**
   * Get users by type
   */
  getUsersByType(userType: UserTypeEnum, pageSize: number = 10, page: number = 1): Observable<UserDTO[]> {
    return this.loadUsers(pageSize, page).pipe(
      map((result: DataSourceResultOfUserDTO) => {
        return result.data ? result.data.filter(user => user.userType === userType) : [];
      })
    );
  }

  /**
   * Get user type display name in Arabic
   */
  getUserTypeDisplayName(userType: UserTypeEnum | undefined): string {
    switch (userType) {
      case UserTypeEnum.Admin:
        return 'مدير';
      case UserTypeEnum.Client:
        return 'عميل';
      case UserTypeEnum.Merchant:
        return 'تاجر';
      case UserTypeEnum.ShippingCompany:
        return 'شركة شحن';
      default:
        return 'غير محدد';
    }
  }

  /**
   * Validate user data
   */
  validateUser(user: UserDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.userName || user.userName.trim().length === 0) {
      errors.push('اسم المستخدم مطلوب');
    }

    if (!user.fullName || user.fullName.trim().length === 0) {
      errors.push('الاسم الكامل مطلوب');
    }

    if (!user.email || user.email.trim().length === 0) {
      errors.push('البريد الإلكتروني مطلوب');
    } else if (!this.isValidEmail(user.email)) {
      errors.push('البريد الإلكتروني غير صالح');
    }

    if (!user.phoneNumber || user.phoneNumber.trim().length === 0) {
      errors.push('رقم الهاتف مطلوب');
    }

    if (user.userType === undefined) {
      errors.push('نوع المستخدم مطلوب');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Refresh users list
   */
  private refreshUsers(): void {
    // Get current values to maintain pagination state
    const currentUsers = this.usersSubject.value;
    if (currentUsers.length > 0) {
      this.loadUsers(10, 1); // Reload first page
    }
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    clientUsers: number;
    merchantUsers: number;
    shippingUsers: number;
  }> {
    return this.loadUsers(1000, 1).pipe( // Load a large number to get all users for stats
      map((result: DataSourceResultOfUserDTO) => {
        const users = result.data || [];
        return {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          adminUsers: users.filter(u => u.userType === UserTypeEnum.Admin).length,
          clientUsers: users.filter(u => u.userType === UserTypeEnum.Client).length,
          merchantUsers: users.filter(u => u.userType === UserTypeEnum.Merchant).length,
          shippingUsers: users.filter(u => u.userType === UserTypeEnum.ShippingCompany).length
        };
      })
    );
  }
}

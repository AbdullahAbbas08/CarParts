import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../Shared/Services/user-profile.service';
import { UserProfile } from '../Shared/Models/user-profile.model';

@Component({
  selector: 'app-user-profile-demo',
  template: `
    <div class="demo-container" dir="rtl">
      <h2>عرض توضيحي لتحديث بيانات المستخدم</h2>
      
      <div class="current-profile" *ngIf="currentProfile">
        <h3>البيانات الحالية:</h3>
        <div class="profile-info">
          <img [src]="currentProfile.avatar" alt="صورة المستخدم" class="avatar">
          <div class="info">
            <p><strong>الاسم:</strong> {{ currentProfile.name }}</p>
            <p><strong>البريد الإلكتروني:</strong> {{ currentProfile.email }}</p>
            <p><strong>الهاتف:</strong> {{ currentProfile.phone }}</p>
            <p><strong>الموقع:</strong> {{ currentProfile.location }}</p>
            <p><strong>آخر تحديث:</strong> {{ currentProfile.lastUpdated | date:'medium' }}</p>
          </div>
        </div>
      </div>

      <div class="demo-actions">
        <button (click)="loadProfile()" [disabled]="isLoading" class="btn btn-primary">
          تحميل البيانات
        </button>
        <button (click)="updateSampleData()" [disabled]="isLoading" class="btn btn-success">
          تحديث بيانات تجريبية
        </button>
        <button (click)="resetProfile()" [disabled]="isLoading" class="btn btn-warning">
          إعادة تعيين
        </button>
      </div>

      <div class="loading" *ngIf="isLoading">
        <p>جاري المعالجة...</p>
      </div>

      <div class="messages" *ngIf="message">
        <div [class]="messageType">{{ message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .current-profile {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .profile-info {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .info p {
      margin: 5px 0;
    }

    .demo-actions {
      display: flex;
      gap: 15px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary { background: #007bff; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .messages {
      margin: 20px 0;
    }

    .success {
      padding: 10px;
      background: #d4edda;
      color: #155724;
      border-radius: 4px;
    }

    .error {
      padding: 10px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
  `]
})
export class UserProfileDemoComponent implements OnInit {
  currentProfile: UserProfile | null = null;
  isLoading = false;
  message = '';
  messageType = '';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.userProfileService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
    });

    this.userProfileService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  loadProfile(): void {
    this.clearMessage();
    this.userProfileService.loadProfile().subscribe({
      next: (profile) => {
        this.showMessage('تم تحميل البيانات بنجاح', 'success');
      },
      error: (error) => {
        this.showMessage('حدث خطأ أثناء تحميل البيانات', 'error');
      }
    });
  }

  updateSampleData(): void {
    this.clearMessage();
    const updateRequest = {
      profile: {
        name: 'اسم محدث - ' + new Date().toLocaleTimeString('ar-EG'),
        description: 'وصف محدث في ' + new Date().toLocaleString('ar-EG'),
        location: 'موقع محدث - الرياض',
        website: 'www.updated-website.com'
      }
    };

    this.userProfileService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(response.message, 'success');
        } else {
          this.showMessage(response.message, 'error');
        }
      },
      error: (error) => {
        this.showMessage('حدث خطأ أثناء التحديث', 'error');
      }
    });
  }

  resetProfile(): void {
    this.clearMessage();
    this.userProfileService.resetProfile().subscribe({
      next: (profile) => {
        this.showMessage('تم إعادة تعيين البيانات', 'success');
      },
      error: (error) => {
        this.showMessage('حدث خطأ أثناء إعادة التعيين', 'error');
      }
    });
  }

  private showMessage(message: string, type: string): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  private clearMessage(): void {
    this.message = '';
    this.messageType = '';
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryPageComponent } from './core/features/home/category-page/category-page.component';
import { NotFoundComponent } from './Shared/components/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./core/features/home/home.module').then(m => m.HomeModule) },
  { path: 'parts', loadChildren: () => import('./core/features/parts/parts.module').then(m => m.PartsModule) },
  { path: 'auth', loadChildren: () => import('./core/features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'admin', loadChildren: () => import('./core/features/admin/admin.module').then(m => m.AdminModule) },
  { path: 'category', loadChildren: () => import('./core/features/category/category.module').then(m => m.CategoryModule) },
  { path: 'brands', loadChildren: () => import('./core/features/all-brands/all-prands.module').then(m => m.AllPrandsModule) },
  { path: 'offers', loadChildren: () => import('./core/features/all-offers/all-offers.module').then(m => m.AllOffersModule) },
  { path: 'addCart', loadChildren: () => import('./core/add-to-cart/add-to-cart.module').then(m => m.AddToCartModule) },
  { path: 'footer', loadChildren: () => import('./Shared/layout/footer/footer.module').then(m => m.FooterModule) },
  { path: 'merchant', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'order-mgr', loadChildren: () => import('./order-manager/order-manager.module').then(m => m.OrderManagerModule) },
  { path: 'category/:name', component: CategoryPageComponent },

  { path: 'seller', loadChildren: () => import('./core/features/seller/seller-page.module').then(m => m.SellerModule) },
  { path: 'NotFound', component: NotFoundComponent },
  // أي مسارات تانية


  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

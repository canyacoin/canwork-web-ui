import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { PublicJobComponent } from './public-job/public-job/public-job.component'
import { BrandComponent } from './core-components/brand/brand.component'
import { AuthGuard } from './core-utils/auth.guard'
import { UserIsSetupGuard } from './core-utils/user-is-setup.guard'
import { WalletBnbComponent } from './wallet-bnb/wallet-bnb.component'
import { WalletBnbAssetsComponent } from './wallet-bnb-assets/wallet-bnb-assets.component'
// Import library module for spinner
import { NgxSpinnerModule } from 'ngx-spinner'

@NgModule({
  imports: [
    BrowserAnimationsModule,
    NgxSpinnerModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          redirectTo: '/home',
          pathMatch: 'full',
        },
        {
          path: 'login',
          redirectTo: '/auth',
          pathMatch: 'full',
        },
        {
          path: 'auth',
          loadChildren: () =>
            import('./auth/auth.module').then((m) => m.AuthModule),
          canActivate: [AuthGuard],
          data: { requiresLoggedOut: true },
        },
        {
          path: 'home',
          loadChildren: () =>
            import('./home/home.module').then((m) => m.HomeModule),
        },
        {
          path: 'search',
          loadChildren: () =>
            import('./search/search.module').then((m) => m.SearchModule),
        },
        {
          path: 'blog',
          loadChildren: () =>
            import('./blog/blog.module').then((m) => m.BlogModule),
        },
        {
          path: 'jobs',
          loadChildren: () =>
            import('./public-job/dashboard/dashboard.module').then((m) => m.DashboardModule),
        },
        {
          path: 'jobs/:jobId',
          component: PublicJobComponent,
        },
        {
          path: 'jobs/public/:slug',
          component: PublicJobComponent,
        },
        {
          path: 'profile',
          loadChildren: () =>
            import('./profile/profile.module').then((m) => m.ProfileModule),
          runGuardsAndResolvers: 'always',
        },
        {
          path: 'inbox',
          loadChildren: () =>
            import('./inbox/inbox.module').then((m) => m.InboxModule),
          canActivate: [AuthGuard, UserIsSetupGuard],
          data: { requiresLoggedIn: true },
          runGuardsAndResolvers: 'always',
        },
        {
          path: 'brand',
          component: BrandComponent,
        },
        {
          path: 'faqs',
          loadChildren: () =>
            import('./faqs/faqs.module').then((m) => m.FaqsModule),
        },
        {
          path: 'wallet-bnb',
          component: WalletBnbComponent,
          pathMatch: 'full',
          runGuardsAndResolvers: 'always',
        },
        {
          path: 'wallet-bnb/assets',
          component: WalletBnbAssetsComponent,
          pathMatch: 'full',
          runGuardsAndResolvers: 'always',
        },
        {
          path: '**',
          loadChildren: () =>
            import('./error/error.module').then((m) => m.ErrorModule),
        },
      ],
      {}
    ),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [RouterModule, NgxSpinnerModule],
})
export class AppRoutingModule {}

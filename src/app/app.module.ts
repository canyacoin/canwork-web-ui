import { HttpClientModule } from '@angular/common/http'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
// import { NgAisModule } from 'angular-instantsearch'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
//import { CanpayModule } from '@canpay-lib/canpay.module'
import { StarRatingModule } from 'angular-star-rating'
import { AngularFireModule } from '@angular/fire/compat'
import { AngularFireAuthModule } from '@angular/fire/compat/auth'
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { AngularFireStorageModule } from '@angular/fire/compat/storage'
import { NgxSliderModule } from 'ngx-slider-v2'
import { NgxPaginationModule } from 'ngx-pagination'
import { FirebaseUIModule } from 'firebaseui-angular'
import { environment } from '../environments/environment'
import { AppComponent } from './app.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app.routing.module'
import { CoreComponentsModule } from './core-components/core-components.module'
import { firebaseUiAuthConfig } from './core-config/app-auth-config'
import { CoreUtilsModule } from './core-utils/core-utils.module'
import { PublicJobComponent } from './public-job/public-job/public-job.component'
import { DashboardComponent } from './public-job/dashboard/dashboard.component'
import { JobBidsComponent } from './public-job/job-bids/job-bids.component'
//import { FilterPipeModule } from 'ngx-filter-pipe' // obsolete
//import { OrderModule } from 'ngx-order-pipe' // obsolete
import { NgArrayPipesModule } from 'ngx-pipes' // https://www.npmjs.com/package/ngx-pipes#array

import { AngularFireFunctionsModule } from '@angular/fire/compat/functions'
import { WalletBnbComponent } from './wallet-bnb/wallet-bnb.component'
import { WalletBnbAssetsComponent } from './wallet-bnb-assets/wallet-bnb-assets.component'
import { ClipboardModule } from 'ngx-clipboard'
import { ToastrModule } from 'ngx-toastr'

// Service Providers
import { AuthService } from './core-services/auth.service'
import { CertificationsService } from './core-services/certifications.service'
import { CoreServicesModule } from './core-services/core-services.module'
import { JobNotificationService } from './core-services/job-notification.service'
import { MobileService } from './core-services/mobile.service'
import { NavService } from './core-services/nav.service'
import { PublicJobService } from './core-services/public-job.service'
import { LedgerService } from '@service/ledger.service'
import { WindowService } from './shared/services/window.service'

import { ConfirmPopupModule } from 'primeng/confirmpopup'
import { ToastModule } from 'primeng/toast'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    PublicJobComponent,
    JobBidsComponent,
    DashboardComponent,
    WalletBnbComponent,
    WalletBnbAssetsComponent,
  ],
  imports: [
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    // NgAisModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HttpClientModule,
    //FilterPipeModule,
    NgArrayPipesModule,
    NgxSliderModule,
    FormsModule,
    ReactiveFormsModule,
    //OrderModule,
    NgxPaginationModule,
    StarRatingModule.forRoot(),
    ClipboardModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
    }),
    ToastModule,
    ConfirmPopupModule,
  ],
  exports: [
    /*FilterPipeModule*/
  ],
  providers: [
    AuthService,
    MobileService,
    NavService,
    JobNotificationService,
    CertificationsService,
    PublicJobService,
    LedgerService,
    WindowService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

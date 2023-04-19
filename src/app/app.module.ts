import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CanpayModule } from '@canpay-lib/canpay.module'
import { StarRatingModule } from 'angular-star-rating'
import { AngularFireModule } from 'angularfire2'
import { AngularFireAuthModule } from 'angularfire2/auth'
import { AngularFirestoreModule } from 'angularfire2/firestore'
import { AngularFireStorageModule } from 'angularfire2/storage'
import { Ng5SliderModule } from 'ng5-slider'
import { NgxPaginationModule } from 'ngx-pagination'
//import { FirebaseUIModule } from 'firebaseui-angular'
import { environment } from '../environments/environment'
import { AppComponent } from './app.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app.routing.module'
import { CoreComponentsModule } from './core-components/core-components.module'
import { firebaseUiAuthConfig } from './core-config/app-auth-config'
import { AuthService } from './core-services/auth.service'
import { CertificationsService } from './core-services/certifications.service'
import { CoreServicesModule } from './core-services/core-services.module'
import { JobNotificationService } from './core-services/job-notification.service'
import { MobileService } from './core-services/mobile.service'
import { NavService } from './core-services/nav.service'
import { PublicJobService } from './core-services/public-job.service'
import { CoreUtilsModule } from './core-utils/core-utils.module'
import { PublicJobComponent } from './public-job/public-job/public-job.component'
import { DashboardComponent } from './public-job/dashboard/dashboard.component'
import { JobBidsComponent } from './public-job/job-bids/job-bids.component'
import { FilterPipeModule } from 'ngx-filter-pipe'
import { OrderModule } from 'ngx-order-pipe'
import { AngularFireFunctionsModule } from '@angular/fire/functions'
import { WalletBnbComponent } from './wallet-bnb/wallet-bnb.component'
import { LedgerService } from '@service/ledger.service'
import { WalletBnbAssetsComponent } from './wallet-bnb-assets/wallet-bnb-assets.component'
import { ClipboardModule } from 'ngx-clipboard'
import { ToastrModule } from 'ngx-toastr'

@NgModule({
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
    //    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    BrowserModule,
    BrowserAnimationsModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HttpClientModule,
    FilterPipeModule,
    Ng5SliderModule,
    FormsModule,
    ReactiveFormsModule,
    OrderModule,
    NgxPaginationModule,
    StarRatingModule.forRoot(),
    ClipboardModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
    }),
  ],
  exports: [FilterPipeModule],
  providers: [
    AuthService,
    MobileService,
    NavService,
    JobNotificationService,
    CertificationsService,
    PublicJobService,
    LedgerService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

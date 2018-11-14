import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanpayModule } from '@canyaio/canpay-lib';
import { StarRatingModule } from 'angular-star-rating';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { Ng5SliderModule } from 'ng5-slider';
import { FilterPipeModule } from 'ngx-filter-pipe';

import { FirebaseUIModule } from 'firebaseui-angular';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { CoreComponentsModule } from './core-components/core-components.module';
import { firebaseUiAuthConfig } from './core-config/app-auth-config';
import { AuthService } from './core-services/auth.service';
import { CertificationsService } from './core-services/certifications.service';
import { CoreServicesModule } from './core-services/core-services.module';
import { DockIoService } from './core-services/dock-io.service';
import { CanWorkEthService } from './core-services/eth.service';
import { JobNotificationService } from './core-services/job-notification.service';
import { MobileService } from './core-services/mobile.service';
import { NavService } from './core-services/nav.service';
import { PublicJobService } from './core-services/public-job.service';
import { CoreUtilsModule } from './core-utils/core-utils.module';
import { PublicJobComponent } from './public-job/public-job.component';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { Ng5SliderModule } from 'ng5-slider';
import { DockIoService } from './core-services/dock-io.service';

@NgModule({
  declarations: [
    AppComponent,
    PublicJobComponent
  ],
  imports: [
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    BrowserModule,
    BrowserAnimationsModule,
    CanpayModule.forRoot({
      useTestNet: environment.contracts.useTestNet,
      contracts: {
        canyaCoinAddress: environment.contracts.canYaCoin
      }
    }),
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HttpClientModule,
    FilterPipeModule,
    Ng5SliderModule,
    StarRatingModule.forRoot()
  ],
  exports: [
    FilterPipeModule
  ],
  providers: [
    AuthService,
    MobileService,
    CanWorkEthService,
    NavService,
    JobNotificationService,
    CertificationsService,
    DockIoService,
    PublicJobService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanpayModule } from '@canyaio/canpay-lib';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';

import { FirebaseUIModule } from 'firebaseui-angular';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { CoreComponentsModule } from './core-components/core-components.module';
import { firebaseUiAuthConfig } from './core-config/app-auth-config';
import { AuthService } from './core-services/auth.service';
import { CoreServicesModule } from './core-services/core-services.module';
import { CanWorkEthService } from './core-services/eth.service';
import { NavService } from './core-services/nav.service';
import { CoreUtilsModule } from './core-utils/core-utils.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    BrowserModule,
    BrowserAnimationsModule,
    CanpayModule.forRoot({
      contracts: {
        useTestNet: environment.contracts.useTestNet,
        canyaCoinAddress: environment.contracts.canYaCoin
      }
    }),
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HttpModule
  ],
  providers: [
    AuthService,
    CanWorkEthService,
    NavService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

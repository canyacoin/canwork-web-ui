import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { FirebaseUIModule } from 'firebaseui-angular';
import { firebaseUiAuthConfig } from './app-auth-config';

import { CoreComponentsModule } from './core-components/core-components.module';
import { CoreServicesModule } from './core-services/core-services.module';
import { CoreUtilsModule } from './core-utils/core-utils.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AuthModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ]),
    BrowserModule,
    BrowserAnimationsModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HomeModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

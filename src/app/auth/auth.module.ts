import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FirebaseUIModule } from 'firebaseui-angular';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';

import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent }
    ]),
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    FirebaseUIModule
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule { }

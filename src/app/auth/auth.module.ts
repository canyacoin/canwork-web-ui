import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FirebaseUIModule } from 'firebaseui-angular';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { AuthGuard } from '../core-utils/auth.guard';

import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, data: { canAccessWhenLoggedOut: true, canAccessWhenLoggedIn: false }, canActivate: [AuthGuard] }
    ]),
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    FirebaseUIModule
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule { }

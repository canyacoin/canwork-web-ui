import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { FirebaseUIModule } from 'firebaseui-angular'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { CoreUtilsModule } from '../core-utils/core-utils.module'
import { AuthRoutingModule } from './auth.routing.module'

import { LoginComponent } from './login/login.component'

@NgModule({
  imports: [
    AuthRoutingModule,
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    FirebaseUIModule,
    FormsModule,
  ],
  declarations: [LoginComponent],
  exports: [AuthRoutingModule],
})
export class AuthModule {}

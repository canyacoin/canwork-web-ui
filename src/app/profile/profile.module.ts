import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { ProfileRoutingModule } from './profile.routing.module';

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    ProfileRoutingModule
  ],
  declarations: [],
  exports: [
    ProfileRoutingModule
  ]
})
export class ProfileModule { }

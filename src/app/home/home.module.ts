import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreComponentsModule } from '../core-services/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';

import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }

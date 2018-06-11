import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { ExchangeComponent } from './exchange.component';
import { ExchangeRoutingModule } from './exchange.routing.module';
import { FaqComponent } from './faq/faq.component';
import { InstructionsComponent } from './instructions/instructions.component';

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreComponentsModule,
    ExchangeRoutingModule
  ],
  declarations: [
    ExchangeComponent,
    InstructionsComponent,
    FaqComponent
  ],
  exports: [
    ExchangeRoutingModule
  ]
})
export class ExchangeModule { }

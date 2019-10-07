import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { ExchangeComponent } from './exchange.component'
import { ExchangeRoutingModule } from './exchange.routing.module'

@NgModule({
  imports: [CommonModule, CoreComponentsModule, ExchangeRoutingModule],
  declarations: [ExchangeComponent],
  exports: [ExchangeRoutingModule],
})
export class ExchangeModule {}

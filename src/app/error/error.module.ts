import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { ErrorRoutingModule } from './error.routing.module'
import { CoreComponentsModule } from "../core-components/core-components.module";

@NgModule({
  imports: [CommonModule, ErrorRoutingModule, CoreComponentsModule],
  declarations: [PageNotFoundComponent],
  exports: [ErrorRoutingModule],
})
export class ErrorModule {}

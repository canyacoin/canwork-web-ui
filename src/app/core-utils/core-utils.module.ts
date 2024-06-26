import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { AuthGuard } from './auth.guard'
import { SanitizeHtmlPipe } from './sanitize-html.pipe'
import { LinkifyPipe } from './linkify.pipe'
import { UserIsNotSetupGuard } from './user-is-not-setup.guard'
import { UserIsSetupGuard } from './user-is-setup.guard'
import { CustomDatePipe } from './custom-date.pipe'

@NgModule({
  imports: [CommonModule],
  declarations: [SanitizeHtmlPipe, LinkifyPipe, CustomDatePipe],
  providers: [AuthGuard, UserIsSetupGuard, UserIsNotSetupGuard],
  exports: [SanitizeHtmlPipe, LinkifyPipe, CustomDatePipe],
})
export class CoreUtilsModule {}

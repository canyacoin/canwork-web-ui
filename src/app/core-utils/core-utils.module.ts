import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AuthGuard } from './auth.guard';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { UserIsSetupGuard } from './user-is-setup.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SanitizeHtmlPipe
  ],
  providers: [
    AuthGuard,
    UserIsSetupGuard
  ],
  exports: [
    SanitizeHtmlPipe
  ]
})
export class CoreUtilsModule { }

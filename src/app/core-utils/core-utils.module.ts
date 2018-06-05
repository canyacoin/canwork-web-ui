import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth.guard';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SanitizeHtmlPipe
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    SanitizeHtmlPipe
  ]
})
export class CoreUtilsModule { }

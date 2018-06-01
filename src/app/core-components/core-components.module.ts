import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FeedbackComponent,
    FooterComponent,
    ScrollTopComponent
  ],
  exports: [
    FeedbackComponent,
    FooterComponen,
    ScrollTopComponent
  ]
})
export class CoreComponentsModule { }

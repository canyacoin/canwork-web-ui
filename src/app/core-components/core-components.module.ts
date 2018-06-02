import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SearchFilterOptionComponent } from './header/search-filter-option/search-filter-option.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent
  ],
  exports: [
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent
  ]
})
export class CoreComponentsModule { }

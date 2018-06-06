import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CoreUtilsModule } from '../core-utils/core-utils.module';

import { BrandComponent } from './brand/brand.component';
import { ConsoleComponent } from './console/console.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SearchFilterOptionComponent } from './header/search-filter-option/search-filter-option.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { ToolsComponent } from './tools/tools.component';
import { BotComponent } from './bot/bot.component';



@NgModule({
  imports: [
    CommonModule,
    CoreUtilsModule,
    RouterModule
  ],
  declarations: [
    BotComponent,
    BrandComponent,
    ConsoleComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent,
    ToolsComponent,
  ],
  exports: [
    BotComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent
  ]
})
export class CoreComponentsModule { }

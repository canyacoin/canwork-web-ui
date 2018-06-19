import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { BackButtonComponent } from './back-button/back-button.component';
import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { BotComponent } from './bot/bot.component';
import { BrandComponent } from './brand/brand.component';
import { ConsoleComponent } from './console/console.component';
import { FaqComponent } from './wallet-install/faq/faq.component';
import { InstructionsComponent } from './wallet-install/instructions/instructions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import {
    SearchFilterOptionComponent
} from './header/search-filter-option/search-filter-option.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { SkillTagComponent } from './skill-tag/skill-tag.component';
import { ToolsComponent } from './tools/tools.component';
import { WalletInstallComponent } from './wallet-install/wallet-install.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUtilsModule,
    ImgFallbackModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    ConsoleComponent,
    FaqComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    InstructionsComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent,
    SkillTagComponent,
    ToolsComponent,
    BackButtonComponent,
    WalletInstallComponent,
  ],
  exports: [
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent,
    SkillTagComponent,
    WalletInstallComponent
  ]
})
export class CoreComponentsModule { }

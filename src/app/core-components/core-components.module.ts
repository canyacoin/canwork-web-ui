import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { AttachmentComponent } from './attachment/attachment.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { BotComponent } from './bot/bot.component';
import { BrandComponent } from './brand/brand.component';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import {
    SearchFilterOptionComponent
} from './header/search-filter-option/search-filter-option.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { SkillTagComponent } from './skill-tag/skill-tag.component';
import { SkillTagsSelectionComponent } from './skill-tags-selection/skill-tags-selection.component';
import { ToolsComponent } from './tools/tools.component';
import { VStepperComponent } from './v-stepper/v-stepper.component';
import { FaqComponent } from './wallet-install/faq/faq.component';
import { InstructionsComponent } from './wallet-install/instructions/instructions.component';
import { WalletInstallComponent } from './wallet-install/wallet-install.component';
import { WindowScrollDirective } from './window-scroll.directive';

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
    AttachmentComponent,
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    FaqComponent,
    FaqPageComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    InstructionsComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    ToolsComponent,
    BackButtonComponent,
    WalletInstallComponent,
    WindowScrollDirective,
    VStepperComponent
  ],
  exports: [
    AttachmentComponent,
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    FaqPageComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    WalletInstallComponent,
    VStepperComponent,
    WindowScrollDirective
  ]
})
export class CoreComponentsModule { }

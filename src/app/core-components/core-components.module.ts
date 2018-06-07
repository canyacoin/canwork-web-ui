import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { BotComponent } from './bot/bot.component';
import { BrandComponent } from './brand/brand.component';
import { ConsoleComponent } from './console/console.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import {
    SearchFilterOptionComponent
} from './header/search-filter-option/search-filter-option.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { SkillTagsComponent } from './skill-tags/skill-tags.component';
import { ToolsComponent } from './tools/tools.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUtilsModule,
    ImgFallbackModule,
    RouterModule
  ],
  declarations: [
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    ConsoleComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent,
    SkillTagsComponent,
    ToolsComponent,
  ],
  exports: [
    BotComponent,
    BlogPostsComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent,
    SkillTagsComponent
  ]
})
export class CoreComponentsModule { }

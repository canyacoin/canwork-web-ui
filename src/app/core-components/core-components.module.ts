import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DROPZONE_CONFIG, DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { LandingComponent } from '../landing/landing.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { BotComponent } from './bot/bot.component';
import { BrandComponent } from './brand/brand.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import {
    SearchFilterOptionComponent
} from './header/search-filter-option/search-filter-option.component';
import { StatusLightComponent } from './header/status-light/status-light.component';
import { IpfsDropzoneComponent } from './ipfs-dropzone/ipfs-dropzone.component';
import { ProviderCardComponent } from './provider-card/provider-card.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { SkillTagComponent } from './skill-tag/skill-tag.component';
import { SkillTagsSelectionComponent } from './skill-tags-selection/skill-tags-selection.component';
import { TermsComponent } from './terms/terms.component';
import { ToolsComponent } from './tools/tools.component';
import { VStepperComponent } from './v-stepper/v-stepper.component';
import { FaqComponent } from './wallet-install/faq/faq.component';
import { InstructionsComponent } from './wallet-install/instructions/instructions.component';
import { WalletInstallComponent } from './wallet-install/wallet-install.component';
import { WindowScrollDirective } from './window-scroll.directive';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: '/upload',
  autoQueue: false,
  maxFilesize: 20000000000,
  maxFiles: 1,
  uploadMultiple: false,
  acceptedFiles: null
};

@NgModule({
  imports: [
    CommonModule,
    CoreUtilsModule,
    ImgFallbackModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DropzoneModule
  ],
  declarations: [
    AttachmentComponent,
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    FaqComponent,
    FaqPageComponent,
    LandingComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    InstructionsComponent,
    SearchFilterOptionComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    TermsComponent,
    ToolsComponent,
    BackButtonComponent,
    WalletInstallComponent,
    WindowScrollDirective,
    VStepperComponent,
    StatusLightComponent,
    ProviderCardComponent,
    IpfsDropzoneComponent,
    ComingSoonComponent
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
    TermsComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    WalletInstallComponent,
    VStepperComponent,
    ProviderCardComponent,
    WindowScrollDirective,
    IpfsDropzoneComponent
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    }
  ]
})
export class CoreComponentsModule { }

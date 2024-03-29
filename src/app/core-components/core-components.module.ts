import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { StarRatingModule } from 'angular-star-rating'
import {
  DROPZONE_CONFIG,
  DropzoneConfigInterface,
  DropzoneModule,
} from 'ngx-dropzone-wrapper'
import { ImgFallbackModule } from 'ngx-img-fallback'

import { CoreUtilsModule } from '../core-utils/core-utils.module'
import { LandingComponent } from '../landing/landing.component'
import { AttachmentComponent } from './attachment/attachment.component'
import { BackButtonComponent } from './back-button/back-button.component'
import { BlogPostsComponent } from './blog-posts/blog-posts.component'
import { BotComponent } from './bot/bot.component'
import { BrandComponent } from './brand/brand.component'
import { FeedbackComponent } from './feedback/feedback.component'
import { FooterComponent } from './footer/footer.component'
import { HeaderComponent } from './header/header.component'
import { StorageDropzoneComponent } from './storage-dropzone/storage-dropzone.component'
import { ProviderCardComponent } from './provider-card/provider-card.component'
import { ScrollTopComponent } from './scroll-top/scroll-top.component'
import { SkillTagComponent } from './skill-tag/skill-tag.component'
import { SkillTagsSelectionComponent } from './skill-tags-selection/skill-tags-selection.component'
import { StarRatingNativeComponent } from './star-rating-native/star-rating-native.component'
import { TermsComponent } from './terms/terms.component'
import { VStepperComponent } from './v-stepper/v-stepper.component'
import { WindowScrollDirective } from './window-scroll.directive'
import { AvatarComponent } from './avatar/avatar.component'
import { VerifiedMarkComponent } from './verified-mark/verified-mark.component'
import { DynamicCoinComponent } from './dynamic-coin/dynamic-coin.component'
import { DynamicCoinWrapperComponent } from './dynamic-coin-wrapper/dynamic-coin-wrapper.component'
import { LedgerModalComponent } from '../binance/ledger-modal/ledger-modal.component'
import { PopperComponent } from './popper/popper.component'
import { BasicButtonComponent } from './buttons/basic-button/basic-button.component'
import { BasicTagComponent } from './tag/basic-tag/basic-tag.component'
import { CategoryCardComponent } from './category-card/category-card.component'
import { LinkButtonComponent } from './link-button/link-button.component'
import { ProfileCardComponent } from './profile-card/profile-card.component'
import { SwitchGridListComponent } from './buttons/switch-grid-list/switch-grid-list.component'
import { SkProfileCardComponent } from './skeletons/sk-profile-card/sk-profile-card.component'
import { BadgeComponent } from './badge/badge.component'
import { DelTagComponent } from './tag/del-tag/del-tag.component'
import { StarRatingComponent } from './star-rating/star-rating.component'
import { JoinCommunityComponent } from './join-community/join-community.component'
import { PostJobComponent } from './post-job/post-job.component'
import { MenuModule } from 'primeng/menu'
import { ToastModule } from 'primeng/toast'
import { AvatarModule } from 'primeng/avatar'
import { BadgeModule } from 'primeng/badge'

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: '/upload',
  autoQueue: false,
  maxFilesize: 20000000000,
  maxFiles: 1,
  uploadMultiple: false,
  acceptedFiles: null,
}

@NgModule({
  imports: [
    CommonModule,
    CoreUtilsModule,
    ImgFallbackModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DropzoneModule,
    StarRatingModule.forChild(),
    MenuModule,
    ToastModule,
    AvatarModule,
    BadgeModule,
  ],
  declarations: [
    AttachmentComponent,
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    LandingComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    StarRatingNativeComponent,
    TermsComponent,
    BackButtonComponent,
    WindowScrollDirective,
    VStepperComponent,
    ProviderCardComponent,
    StorageDropzoneComponent,
    AvatarComponent,
    VerifiedMarkComponent,
    DynamicCoinComponent,
    DynamicCoinWrapperComponent,
    LedgerModalComponent,
    PopperComponent,
    BasicButtonComponent,
    BasicTagComponent,
    CategoryCardComponent,
    LinkButtonComponent,
    ProfileCardComponent,
    SwitchGridListComponent,
    SkProfileCardComponent,
    BadgeComponent,
    DelTagComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
  ],
  exports: [
    AttachmentComponent,
    BackButtonComponent,
    BotComponent,
    BlogPostsComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    TermsComponent,
    ScrollTopComponent,
    SkillTagComponent,
    SkillTagsSelectionComponent,
    StarRatingNativeComponent,
    VStepperComponent,
    ProviderCardComponent,
    WindowScrollDirective,
    StorageDropzoneComponent,
    AvatarComponent,
    VerifiedMarkComponent,
    DynamicCoinComponent,
    DynamicCoinWrapperComponent,
    BasicButtonComponent,
    BasicTagComponent,
    CategoryCardComponent,
    LinkButtonComponent,
    ProfileCardComponent,
    SwitchGridListComponent,
    SkProfileCardComponent,
    BadgeComponent,
    DelTagComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    },
  ],
})
export class CoreComponentsModule {}

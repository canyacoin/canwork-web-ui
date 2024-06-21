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
import { CategoryCardComponent } from './cards/category-card/category-card.component'
import { LinkButtonComponent } from './buttons/link-button/link-button.component'
import { ProfileCardComponent } from './cards/profile-card/profile-card.component'
import { SwitchGridListComponent } from './buttons/switch-grid-list/switch-grid-list.component'
import { SkProfileCardComponent } from './skeletons/sk-profile-card/sk-profile-card.component'
import { SkJobCardComponent } from './skeletons/sk-job-card/sk-job-card.component'
import { BadgeComponent } from './badge/badge.component'
import { DelTagComponent } from './tag/del-tag/del-tag.component'
import { StarRatingComponent } from './star-rating/star-rating.component'
import { JoinCommunityComponent } from './join-community/join-community.component'
import { PostJobComponent } from './post-job/post-job.component'
import { MenuModule } from 'primeng/menu'
import { ToastModule } from 'primeng/toast'
import { AvatarModule } from 'primeng/avatar'
import { BadgeModule } from 'primeng/badge'
import { JobCardComponent } from './cards/job-card/job-card.component'
import { SearchButtonComponent } from './buttons/search-button/search-button.component'
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from 'primeng/dialog'

import { BasicDialogComponent } from './basic-dialog/basic-dialog.component'
import { DropdownModule } from 'primeng/dropdown'
import { TableModule } from 'primeng/table'
import { WarningMessageComponent } from './warning-message/warning-message.component'
import { BackToJobBoardComponent } from './buttons/back-to-job-board/back-to-job-board.component'
import { JobDetailsPanelComponent } from './job/job-details-panel/job-details.component'
import { JobProposalsPanelComponent } from './job/job-proposals-panel/job-proposals.component'
import { JobStatusPanelComponent } from './job/job-status-panel/job-status-panel.component'
import { BookmarkButtonComponent } from './buttons/bookmark-button/bookmark-button.component';
import { ShareButtonComponent } from './buttons/share-button/share-button.component'

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
    CheckboxModule,
    DialogModule,
    DropdownModule,
    TableModule,
  ],
  declarations: [
    AttachmentComponent,
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
    BasicTagComponent,
    CategoryCardComponent,
    ProfileCardComponent,
    SwitchGridListComponent,
    SkProfileCardComponent,
    SkJobCardComponent,
    BadgeComponent,
    DelTagComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
    JobCardComponent,
    BasicDialogComponent,
    WarningMessageComponent,
    BackToJobBoardComponent,
    // panels
    JobDetailsPanelComponent,
    JobProposalsPanelComponent,
    JobStatusPanelComponent,
    // buttons
    BackButtonComponent,
    BasicButtonComponent,
    LinkButtonComponent,
    SearchButtonComponent,
    BookmarkButtonComponent,
    ShareButtonComponent,
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
    SkJobCardComponent,
    BadgeComponent,
    DelTagComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
    JobCardComponent,
    SearchButtonComponent,
    BasicDialogComponent,
    WarningMessageComponent,
    BackToJobBoardComponent,
    // panels
    JobDetailsPanelComponent,
    JobProposalsPanelComponent,
    JobStatusPanelComponent,
    // buttons
    BackButtonComponent,
    BasicButtonComponent,
    LinkButtonComponent,
    SearchButtonComponent,
    BookmarkButtonComponent,
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    },
  ],
})
export class CoreComponentsModule {}

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
import { BasicTagComponent } from './tags/basic-tag/basic-tag.component'
import { DelTagComponent } from './tags/del-tag/del-tag.component'
import { LinkButtonComponent } from './buttons/link-button/link-button.component'
import { SwitchGridListComponent } from './buttons/switch-grid-list/switch-grid-list.component'
import { SkProfileCardComponent } from './skeletons/sk-profile-card/sk-profile-card.component'
import { SkJobCardComponent } from './skeletons/sk-job-card/sk-job-card.component'
import { BadgeComponent } from './badge/badge.component'
import { StarRatingComponent } from './star-rating/star-rating.component'
import { JoinCommunityComponent } from './join-community/join-community.component'
import { PostJobComponent } from './post-job/post-job.component'
import { MenuModule } from 'primeng/menu'
import { ToastModule } from 'primeng/toast'
import { AvatarModule } from 'primeng/avatar'
import { BadgeModule } from 'primeng/badge'
import { SearchButtonComponent } from './buttons/search-button/search-button.component'
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from 'primeng/dialog'
import { TabMenuModule } from 'primeng/tabmenu'

import { BasicDialogComponent } from './dialogs/basic-dialog/basic-dialog.component'
import { ProposalDetailsDialogComponent } from './dialogs/proposal-details-dialog/proposal-details-dialog.component'

import { DropdownModule } from 'primeng/dropdown'
import { TableModule } from 'primeng/table'

// messages
import { WarningMessageComponent } from './messages/warning-message/warning-message.component'
import { ErrorMessageComponent } from './messages/error-message/error-message.component'

import { BackToJobBoardComponent } from './buttons/back-to-job-board/back-to-job-board.component'
import { JobDetailsPanelComponent } from './job/job-details-panel/job-details-panel.component'
import { JobProposalsPanelComponent } from './job/job-proposals-panel/job-proposals-panel.component'
import { JobStatusPanelComponent } from './job/job-status-panel/job-status-panel.component'
import { BookmarkButtonComponent } from './buttons/bookmark-button/bookmark-button.component'
import { ShareButtonComponent } from './buttons/share-button/share-button.component'
import { JobApplicationPanelComponent } from './job/job-application-panel/job-application-panel.component'
import { AttachmentButtonComponent } from './buttons/attachment-button/attachment-button.component'
// Cards
import { CategoryCardComponent } from './cards/category-card/category-card.component'
import { JobCardComponent } from './cards/job-card/job-card.component'
import { JobDashboardCardComponent } from './cards/job-dashboard-card/job-dashboard-card.component'
import { ProfileCardComponent } from './cards/profile-card/profile-card.component'

import { StatusIconComponent } from './status-icon/status-icon.component'
import { JobActionLogPanelComponent } from './job/job-action-log-panel/job-action-log-panel.component'
import { JobTransactionHistoryPanelComponent } from './job/job-transaction-history-panel/job-transaction-history-panel.component'
import { JobFreelancerInformationPanelComponent } from './job/job-freelancer-information-panel/job-freelancer-information-panel.component'
import { CopyButtonComponent } from './buttons/copy-button/copy-button.component'
import { RefreshButtonComponent } from './buttons/refresh-button/refresh-button.component'
import { ExternalLinkButtonComponent } from './buttons/external-link-button/external-link-button.component'
import { ConnectWalletDialogComponent } from './dialogs/connect-wallet/connect-wallet.component'
import { WalletButtonComponent } from './buttons/wallet-button/wallet-button.component'
import { RaiseDisputeButtonComponent } from './buttons/raise-dispute-button/raise-dispute-button.component'
import { ActionDialogComponent } from './dialogs/action-dialog/action-dialog.component'
import { SeeMoreLessButtonComponent } from './buttons/see-more-less-button/see-more-less-button.component'
import { JobSwitchActionTransactionPanelComponent } from './job/job-switch-action-transaction-panel/job-switch-action-transaction-panel.component'
import { ChatButtonComponent } from './buttons/chat-button/chat-button.component'
import { BackToEditButtonComponent } from './buttons/back-to-edit-button/back-to-edit-button.component'
import { XButtonComponent } from './buttons/x-button/x-button.component'
import { StarRatingSelectComponent } from './star-rating-select/star-rating-select.component'
import { JobReviewPanelComponent } from './job/job-review-panel/job-review-panel.component'

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
    TabMenuModule,
    DropdownModule,
    TableModule,
  ],
  declarations: [
    AttachmentComponent,
    BotComponent,
    BlogPostsComponent,
    BrandComponent,
    FeedbackComponent,
    FooterComponent,
    HeaderComponent,
    ScrollTopComponent,
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
    SwitchGridListComponent,
    SkProfileCardComponent,
    SkJobCardComponent,
    BadgeComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
    BackToJobBoardComponent,

    // Messages
    WarningMessageComponent,
    ErrorMessageComponent,

    // Cards
    CategoryCardComponent,
    JobCardComponent,
    JobDashboardCardComponent,
    ProfileCardComponent,
    // Tags
    SkillTagComponent,
    SkillTagsSelectionComponent,
    BasicTagComponent,
    DelTagComponent,
    // Panels
    JobDetailsPanelComponent,
    JobProposalsPanelComponent,
    JobStatusPanelComponent,
    JobApplicationPanelComponent,
    JobFreelancerInformationPanelComponent,
    JobReviewPanelComponent,
    // Buttons
    BackButtonComponent,
    BasicButtonComponent,
    LinkButtonComponent,
    SearchButtonComponent,
    BookmarkButtonComponent,
    ShareButtonComponent,
    AttachmentButtonComponent,
    CopyButtonComponent,
    RefreshButtonComponent,
    ExternalLinkButtonComponent,
    WalletButtonComponent,
    RaiseDisputeButtonComponent,
    WalletButtonComponent,
    SeeMoreLessButtonComponent,
    ChatButtonComponent,
    BackToEditButtonComponent,
    XButtonComponent,
    // Dialogs
    BasicDialogComponent,
    ProposalDetailsDialogComponent,
    ConnectWalletDialogComponent,
    ActionDialogComponent,

    StatusIconComponent,
    JobActionLogPanelComponent,
    JobTransactionHistoryPanelComponent,
    JobSwitchActionTransactionPanelComponent,
    StarRatingSelectComponent,
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
    LinkButtonComponent,
    SwitchGridListComponent,
    SkProfileCardComponent,
    SkJobCardComponent,
    BadgeComponent,
    StarRatingComponent,
    JoinCommunityComponent,
    PostJobComponent,
    SearchButtonComponent,
    BackToJobBoardComponent,

    // Messages
    WarningMessageComponent,
    ErrorMessageComponent,

    // Cards
    CategoryCardComponent,
    JobCardComponent,
    JobDashboardCardComponent,
    ProfileCardComponent,
    // Tags
    SkillTagComponent,
    SkillTagsSelectionComponent,
    BasicTagComponent,
    DelTagComponent,
    // Panels
    JobDetailsPanelComponent,
    JobProposalsPanelComponent,
    JobStatusPanelComponent,
    JobApplicationPanelComponent,
    JobFreelancerInformationPanelComponent,
    JobReviewPanelComponent,
    // Buttons
    BackButtonComponent,
    BasicButtonComponent,
    LinkButtonComponent,
    SearchButtonComponent,
    BookmarkButtonComponent,
    ShareButtonComponent,
    AttachmentButtonComponent,
    CopyButtonComponent,
    RefreshButtonComponent,
    ExternalLinkButtonComponent,
    WalletButtonComponent,
    RaiseDisputeButtonComponent,
    SeeMoreLessButtonComponent,
    ChatButtonComponent,
    BackToEditButtonComponent,
    XButtonComponent,
    // Dialogs
    BasicDialogComponent,
    ProposalDetailsDialogComponent,
    ConnectWalletDialogComponent,
    ActionDialogComponent,

    StatusIconComponent,
    JobActionLogPanelComponent,
    JobTransactionHistoryPanelComponent,
    JobSwitchActionTransactionPanelComponent,
    StarRatingSelectComponent,
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    },
  ],
})
export class CoreComponentsModule {}

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
//import { CanpayModule } from '@canpay-lib/lib'
import { StarRatingModule } from 'angular-star-rating'
import { ImgFallbackModule } from 'ngx-img-fallback'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { CoreUtilsModule } from '../core-utils/core-utils.module'
import { BuyCoffeeComponent } from './buy-coffee/buy-coffee.component'
import { CertificationsFormComponent } from './certifications-form/certifications-form.component'
import { AboutComponent } from './components/about/about.component'
import { BioComponent } from './components/bio/bio.component'
import { CertificationsComponent } from './components/certifications/certifications.component'
import { ItemComponent } from './components/portfolio/item/item.component'
import { PortfolioComponent } from './components/portfolio/portfolio.component'
import { ReviewsComponent } from './components/reviews/reviews.component'
import { SocialComponent } from './components/social/social.component'
import { TimezoneComponent } from './components/timezone/timezone.component'
import { VisitorsComponent } from './components/visitors/visitors.component'
import { EditComponent } from './edit/edit.component'
import { ProfileViewsComponent } from './profile-views/profile-views.component'
import { ProfileComponent } from './profile.component'
import { ProfileRoutingModule } from './profile.routing.module'
import { ProjectComponent } from './project/project.component'
import { CreateClientProfileComponent } from './setup/create-client-profile/create-client-profile.component'
import { CreateProviderProfileComponent } from './setup/create-provider-profile/create-provider-profile.component'
import { ProviderStateComponent } from './setup/provider-state/provider-state.component'
import { SetupComponent } from './setup/setup.component'
import { MarkdownModule, MarkedOptions } from 'ngx-markdown'
import { GetReferralComponent } from './get-referral/get-referral.component'
import { WorkhistoryComponent } from './components/workhistory/workhistory.component'
import { SkillsComponent } from './components/skills/skills.component'
import { EducationComponent } from './components/education/education.component'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    ImgFallbackModule,
    FormsModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    StarRatingModule.forChild(),
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          sanitize: true,
        },
      },
    }),
  ],
  declarations: [
    AboutComponent,
    BioComponent,
    BuyCoffeeComponent,
    CreateClientProfileComponent,
    CreateProviderProfileComponent,
    CertificationsFormComponent,
    EditComponent,
    ItemComponent,
    PortfolioComponent,
    ProfileComponent,
    CertificationsComponent,
    ProfileViewsComponent,
    ProjectComponent,
    ProviderStateComponent,
    SocialComponent,
    SetupComponent,
    TimezoneComponent,
    VisitorsComponent,
    ReviewsComponent,
    GetReferralComponent,
    WorkhistoryComponent,
    SkillsComponent,
    EducationComponent,
  ],
  exports: [ProfileRoutingModule],
  providers: [],
})
export class ProfileModule {}

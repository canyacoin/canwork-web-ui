import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NgAisModule } from 'angular-instantsearch'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { HomeComponent } from './home.component'
import { HomeRoutingModule } from './home.routing.module'
import { HeroComponent } from './hero/hero.component'
import { FeatureFreelancersComponent } from './feature-freelancers/feature-freelancers.component'
import { WhyUseComponent } from './why-use/why-use.component'
import { WhyFreelanceComponent } from './why-freelance/why-freelance.component'
import { HowWorksComponent } from './how-works/how-works.component'
import { BrowseFreelancersComponent } from './browse-freelancers/browse-freelancers.component'
import { TopPortfoliosComponent } from './top-portfolios/top-portfolios.component'
import { BlogPostsComponent } from './blog-posts/blog-posts.component'
import { WhoBehindComponent } from './who-behind/who-behind.component'
import { JoinCommunityComponent } from './join-community/join-community.component'
import { CarouselModule } from 'primeng/carousel'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    HomeRoutingModule,
    NgAisModule,
    CarouselModule,
  ],
  declarations: [
    HomeComponent,
    HeroComponent,
    FeatureFreelancersComponent,
    WhyUseComponent,
    WhyFreelanceComponent,
    HowWorksComponent,
    BrowseFreelancersComponent,
    TopPortfoliosComponent,
    BlogPostsComponent,
    WhoBehindComponent,
    JoinCommunityComponent,
  ],
  exports: [HomeRoutingModule],
})
export class HomeModule {}

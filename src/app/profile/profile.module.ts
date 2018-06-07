import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { CoreUtilsModule } from '../core-utils/core-utils.module';
import { AboutComponent } from './components/about/about.component';
import { BioComponent } from './components/bio/bio.component';
import { ItemComponent } from './components/portfolio/item/item.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { SocialComponent } from './components/social/social.component';
import { SupportMeComponent } from './components/support-me/support-me.component';
import { TimezoneComponent } from './components/timezone/timezone.component';
import { VisitorsComponent } from './components/visitors/visitors.component';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile.routing.module';

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    ImgFallbackModule,
    ProfileRoutingModule
  ],
  declarations: [
    AboutComponent,
    BioComponent,
    PortfolioComponent,
    ItemComponent,
    ProfileComponent,
    SocialComponent,
    SupportMeComponent,
    TimezoneComponent,
    VisitorsComponent
  ],
  exports: [
    ProfileRoutingModule
  ]
})
export class ProfileModule { }

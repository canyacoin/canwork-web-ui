import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DatePipe, CurrencyPipe } from '@angular/common';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { AuthGuard } from './auth.guard';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
// import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import {
  AuthMethods,
  AuthProvider,
  AuthProviderWithCustomConfig,
  CredentialHelper,
  FirebaseUIAuthConfig,
  FirebaseUIModule
} from 'firebaseui-angular';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { ImgFallbackModule } from 'ngx-img-fallback';

import { environment } from '../environments/environment';

import { UserService } from './user.service';
import { AnimationsService } from './animations.service';
import { FeedService } from './feed.service';
import { EthService } from './eth.service';

import { SanitizeHtmlPipe } from './sanitizehtml.pipe';

import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { HeaderComponent } from './header/header.component';
import { TopComponent } from './top/top.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { BotComponent } from './bot/bot.component';
import { WorkComponent } from './work/work.component';
import { SetupComponent } from './setup/setup.component';
import { ReactionsComponent } from './reactions/reactions.component';
import { BrandComponent } from './brand/brand.component';
import { ConsoleComponent } from './console/console.component';
import { ChatComponent } from './chat/chat.component';
import { ToolsComponent } from './tools/tools.component';
import { WizardComponent } from './wizard/wizard.component';
import { EditComponent } from './edit/edit.component';
import { JobComponent } from './job/job.component';
import { ProjectComponent } from './project/project.component';
import { WhoComponent } from './who/who.component';
import { BuyComponent } from './buy/buy.component';
import { PayComponent } from './pay/pay.component';
import { PostComponent } from './post/post.component';

declare let require: any;
declare let window: any;
declare let escape: any;

const facebookCustomConfig: AuthProviderWithCustomConfig = {
  provider: AuthProvider.Facebook,
  customConfig: {
    scopes: [
      'public_profile',
      'email'
    ],
    customParameters: {
      // Forces password re-entry.
      auth_type: 'reauthenticate'
    }
  }
};

const firebaseUiAuthConfig: FirebaseUIAuthConfig = {
  providers: [
    AuthProvider.Google,
    facebookCustomConfig,
    AuthProvider.Twitter,
    AuthProvider.Github,
    AuthProvider.Password,
    AuthProvider.Phone
  ],
  method: AuthMethods.Popup,
  tos: 'https://canya.io/assets/docs/Terms-CanYa.pdf',
  credentialHelper: CredentialHelper.OneTap
};

@NgModule({
  declarations: [
    AppComponent,
    SanitizeHtmlPipe,
    HomeComponent,
    PageNotFoundComponent,
    HeaderComponent,
    TopComponent,
    FooterComponent,
    LoginComponent,
    ProfileComponent,
    BotComponent,
    WorkComponent,
    SetupComponent,
    ReactionsComponent,
    BrandComponent,
    ConsoleComponent,
    ChatComponent,
    ToolsComponent,
    WizardComponent,
    EditComponent,
    JobComponent,
    ProjectComponent,
    WhoComponent,
    BuyComponent,
    PayComponent,
    PostComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LazyLoadImageModule,
    HttpModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase), // imports firebase/app needed for everything
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFirestoreModule.enablePersistence(), // imports firebase/firestore, only needed for database features
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    ImgFallbackModule
  ],
  providers: [AuthGuard, DatePipe, CurrencyPipe, UserService, AnimationsService, FeedService, EthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

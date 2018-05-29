import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth.guard';

import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { BotComponent } from '../bot/bot.component';
import { SetupComponent } from '../setup/setup.component';
import { ProfileComponent } from '../profile/profile.component';
import { WorkComponent } from '../work/work.component';
import { BrandComponent } from '../brand/brand.component';
import { ConsoleComponent } from '../console/console.component';
import { ChatComponent } from '../chat/chat.component';
import { ToolsComponent } from '../tools/tools.component';
import { WizardComponent } from '../wizard/wizard.component';
import { EditComponent } from '../edit/edit.component';
import { ProjectComponent } from '../project/project.component';
import { WhoComponent } from '../who/who.component';
import { BuyComponent } from '../buy/buy.component';
import { PayComponent } from '../pay/pay.component';
import { PostComponent } from '../post/post.component';
import { PageNotFoundComponent } from '../pagenotfound/pagenotfound.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        // canActivate: [AuthGuard]
    },
    {
        path: 'index.html',
        component: HomeComponent,
        // canActivate: [AuthGuard]
    },
    {
        path: 'home',
        component: HomeComponent,
        // canActivate: [AuthGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'bot',
        component: SetupComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'search/:query',
        component: HomeComponent,
        // canActivate: [AuthGuard]
    },
    {
        path: 'wizard',
        component: WizardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        // canActivate: [AuthGuard]
    },
    {
        path: 'profile/edit',
        component: EditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile/:address',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'project/:address',
        component: ProjectComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'post/:address',
        component: PostComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'chat',
        component: ChatComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'chat/:address',
        component: ChatComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'work',
        component: WorkComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'who',
        component: WhoComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'brand',
        component: BrandComponent
    },
    {
        path: 'console',
        component: ConsoleComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tools',
        component: ToolsComponent
    },
    {
        path: 'buy',
        component: BuyComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pay',
        component: PayComponent,
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'r/:referralCode',
    //     component: HomeComponent
    // },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: false })
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule { }

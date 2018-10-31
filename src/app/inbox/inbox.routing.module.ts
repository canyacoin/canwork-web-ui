import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat/chat.component';
import { ActionHistoryComponent } from './jobs/container/action-history/action-history.component';
import { JobContainerComponent } from './jobs/container/job-container.component';
import { JobDetailsComponent } from './jobs/container/job-details/job-details.component';
import { JobDashboardComponent } from './jobs/dashboard/job-dashboard.component';
import { PostComponent } from './jobs/post/post.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/chat',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'chat/:address',
    component: ChatComponent
  },
  {
    path: 'post/:address',
    component: PostComponent
  },
  {
    path: 'jobs',
    component: JobDashboardComponent
  },
  {
    path: 'job/:id',
    component: JobContainerComponent,
    children: [
      {
        path: '',
        component: JobDetailsComponent
      }
      {
        path: 'payment',
        component: ActionHistoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboxRoutingModule { }

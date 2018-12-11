import { Component, OnInit } from '@angular/core';
import { PublicJobService } from '@service/public-job.service';
import { AuthService } from '@service/auth.service';
import { NavService } from '@service/nav.service';
import { Job, JobDescription, JobState, PaymentType } from '@class/job';
import { OrderPipe } from 'ngx-order-pipe';
import { Subscription } from 'rxjs';
import { User, UserType } from '@class/user';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allJobs: any;
  queryJobs: any;
  authSub: Subscription;
  currentUser: User;
  orderType = 'actionLog[0].timestamp';
  index = 1;
  reverseOrder = true;
  filterByCategory: any;
  paymentType = PaymentType;
  providerTypes = [
    {
      name: 'All Jobs',
      img: 'writer.svg',
      id: 'all'
    },
    {
      name: 'Content Creators',
      img: 'writer.svg',
      id: 'contentCreator'
    },
    {
      name: 'Software Developers',
      img: 'dev.svg',
      id: 'softwareDev'
    },
    {
      name: 'Designers & Creatives',
      img: 'creatives.svg',
      id: 'designer'
    },
    {
      name: 'Financial Experts',
      img: 'finance.svg',
      id: 'finance'
    },
    {
      name: 'Marketing & Seo',
      img: 'marketing.svg',
      id: 'marketing'
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.svg',
      id: 'virtualAssistant'
    }
  ];

  constructor(
    private publicJobService: PublicJobService,
    private authService: AuthService,
    private navService: NavService,
    private order: OrderPipe
  ) { }

  async ngOnInit() {
    this.filterByCategory = 'all';
    this.orderType = 'information.title';
    this.navService.setHideSearchBar(true);
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user;
      }
    });
    this.publicJobService.getAllOpenJobs().subscribe(result => {
      this.allJobs = result;
      this.queryJobs = this.allJobs;
    });
  }
  get isProvider(): boolean {
    return this.currentUser.type === UserType.provider;
  }
  timestampToDate(timestamp) {
    const date = new Date(parseInt(timestamp, 10)).toLocaleDateString();
    return date;
  }
  onKeyUp(event: any) {
    this.onSearch(event);
  }

  onSearch(query: string) {
    if (query !== '') {
      const tmpJobs: any = [];
      this.allJobs.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
          tmpJobs.push(item);
        }
      });
      console.log(tmpJobs);
      this.queryJobs = tmpJobs;
    } else {
      this.queryJobs = this.allJobs;
    }
  }

  filterJobsByCategory() {
    console.log(this.filterByCategory);
    if (this.filterByCategory !== 'all') {
      this.queryJobs = this.allJobs.filter(job => job.information.providerType === this.filterByCategory);
    } else {
      this.queryJobs = this.allJobs;
    }
  }

  getImage(string) {
    let url = 'assets/img/providers/';
    const type = this.providerTypes.find(prov => prov.id === string);
    url = url + type.img;
    return url;
  }
}

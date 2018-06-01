import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { MomentService } from './moment.service';

declare let require: any;

const parseString = require('xml2js').parseString;

@Injectable()
export class FeedService {

  feedUrl = 'https://feed.rssunify.com/5a9322f94d907/rss.xml';

  constructor(public http: Http, private moment: MomentService) { }

  getItems(): Observable<any[]> {
    return this.http.get(this.feedUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  extractData(res: Response) {
    return Observable.create( (observer: Observer<any>) => {
      parseString( res.text(), (err, result) => {
        // result['rss']['channel'][0]['item']; // .json();
        const items = result['rss']['channel'][0]['item'];
        const body = [];
        const re = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;

        if ( items ) {
          for (let i = 0; i < items.length; i++) {
            const tmp = {};
            tmp['title'] = items[i]['title'][0];
            tmp['timestamp'] = this.moment.get(items[i]['pubDate'][0]);
            tmp['content'] = items[i]['content:encoded'][0].replace(re, '<iframe width="100%" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
            tmp['link'] = items[i]['link'][0];

            if ( items[i]['description'] instanceof Array) {
              // console.log('description', typeof items[i]['description']['0']);
              tmp['description'] = items[i]['description']['0'];
            }

            if ( items[i]['media:thumbnail'] instanceof Array) {
              tmp['thumbnail'] = items[i]['media:thumbnail']['0'].$.url || 'assets/img/work-placeholder.svg';
            }
            body.push(tmp);
          }
        }
        observer.next(body || []);
        observer.complete();
      });
    });
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'RSS Server error';
    console.error(error);
    return Observable.throw(errMsg);
  }
}

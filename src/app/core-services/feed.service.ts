import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { FeedItem } from '../core-classes/feed-item';

import { environment } from '../../environments/environment';

declare let require: any;

const parseString = require('xml2js').parseString;

@Injectable()
export class FeedService {

  feedUrl = environment.blogFeedUrl;

  constructor(public http: Http) { }

  async getItemsAsync(amount: number): Promise<FeedItem[]> {
    try {
      const feedData = await this.http.get(this.feedUrl).toPromise();
      const parsedFeed = await this.parseFeedAsync(amount, feedData.text());
      return parsedFeed;
    } catch (error) {
      const errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'RSS Server error';
      return Promise.reject('RSS Server error');
    }
  }

  async parseFeedAsync(amount: number, xml: string): Promise<FeedItem[]> {

    const parsedXml = await new Promise((resolve, reject) => parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }));

    const items = parsedXml['rss']['channel'][0]['item'];
    const parsedFeedData = [];

    if (items) {
      for (let i = 0; i < amount; i++) {
        const tmp = {};
        tmp['title'] = items[i]['title'][0];
        tmp['link'] = items[i]['link'][0];

        if (items[i]['description'] instanceof Array) {
          tmp['description'] = items[i]['description']['0'];
        }

        if (items[i]['media:thumbnail'] instanceof Array) {
          tmp['thumbnail'] = items[i]['media:thumbnail']['0'].$.url || 'assets/img/work-placeholder.svg';
        }
        if (tmp['thumbnail'] === 'null' || tmp['thumbnail'] === null) {
          tmp['thumbnail'] = 'assets/img/work-placeholder.svg';
        }
        parsedFeedData.push(tmp);
      }
    }

    return Promise.resolve(parsedFeedData);
  }
}

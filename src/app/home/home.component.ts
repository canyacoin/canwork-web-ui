import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { UserCategory } from '../core-classes/user';
declare var require: any;
const algoliasearch = require('algoliasearch');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private algoliaSearch;
  private algoliaIndex;
  public developers = [];
  public designers = [];
  public contents = [];
  algoIndex = environment.algolia.indexName;
  algoId = environment.algolia.appId;
  algoKey = environment.algolia.apiKey;

  constructor(
    private router: Router
  ) { }
  providerTypes = [
    {
      name: 'Content Creators',
      img: 'writer.svg'
    },
    {
      name: 'Software Engineers',
      img: 'dev.svg'
    },
    {
      name: 'Designers & Creatives',
      img: 'creatives.svg'
    },
    {
      name: 'Financial Experts',
      img: 'finance.svg'
    },
    {
      name: 'Marketing Experts',
      img: 'marketing.svg'
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.svg'
    }
  ]

  ngOnInit() {
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey);
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex);
    this.getProviders( UserCategory.softwareDev, this.developers);
    this.getProviders( UserCategory.designer, this.designers);
    this.getProviders( UserCategory.contentCreator, this.contents);
  }

  getProviders(searchQuery, array) {
    this.algoliaIndex.search({ query: searchQuery }).then(res => {
      const result = res.hits;
      for (let i = 1; i < 4; i++) {
        const filteredSkills = [];
        if (result[i].skillTags.length === 1) {
          filteredSkills.push(result[i].skillTags[0]);
        } else if (result[i].skillTags.length >= 2) {
          filteredSkills.push(result[i].skillTags[0]);
          filteredSkills.push(result[i].skillTags[1]);
        }
        const provider = {
          'address': result[i].address,
          'avatar': result[i].avatar,
          'skillTags': filteredSkills,
          'title': result[i].title,
          'name': result[i].name,
          'category': result[i].category,
          'timezone': result[i].timezone,
        }
        array.push(provider);
      }
      return array;
    });
  }

  onSubmit(event: any) {
    this.router.navigate(['search'], { queryParams: { 'query': event } });
  }
}

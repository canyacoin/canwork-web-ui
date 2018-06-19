import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NavService {


  private hideSearchBar = new BehaviorSubject<boolean>(false);
  hideSearchBar$ = this.hideSearchBar.asObservable();

  constructor() { }

  setHideSearchBar(bool: boolean) {
    this.hideSearchBar.next(bool);
  }
}

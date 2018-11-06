import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Observable } from 'rxjs';

@Injectable()
export class NavService {


  private hideSearchBar = new BehaviorSubject<boolean>(false);
  hideSearchBar$ = this.hideSearchBar.asObservable();

  constructor() { }

  setHideSearchBar(bool: boolean) {
    this.hideSearchBar.next(bool);
  }
}

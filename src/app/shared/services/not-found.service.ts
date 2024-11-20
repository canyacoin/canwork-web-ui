import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotFoundService {
  private isShowBoarder = new BehaviorSubject<boolean>(true);
  isShowBoarder$ = this.isShowBoarder.asObservable();

  setIsShowBoarder(value: boolean) {
    this.isShowBoarder.next(value);
  }
}

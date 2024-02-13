import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  Directive,
} from '@angular/core'
import { Observable, from } from 'rxjs'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() user: any
  @Input() customClass: string

  avatarUrl: Observable<string>

  constructor() {}

  ngOnInit() {
    this.initAvatarUrl()
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (
        changes.user.currentValue.avatar.uri !==
          changes.user.previousValue.avatar.uri ||
        changes.user.currentValue.compressedAvatarUrl !==
          changes.user.previousValue.compressedAvatarUrl // handle changes also con compressedAvatarUrl
      ) {
        this.initAvatarUrl()
      }
    } catch (e) {
      // NOOP
    }
  }

  initAvatarUrl() {
    let url = this.user && this.user.avatar && this.user.avatar.uri // current, retrocomp
    if (
      this.user &&
      this.user.compressedAvatarUrl &&
      this.user.compressedAvatarUrl != 'new'
    ) {
      url = this.user.compressedAvatarUrl
      // use compressed thumb if exist and not a massive update (new)
    }
    this.avatarUrl = from(
      new Promise<string>((resolve, reject) => {
        if (!url) {
          return
        }
        const img = new Image()
        img.onload = () => {
          resolve(url)
        }
        img.onerror = reject
        img.src = url
      })
    )
  }

  getInitials() {
    if (this.user && this.user.name) {
      return this.user.name
        .split(' ')
        .map((str) => str[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    return ''
  }
}

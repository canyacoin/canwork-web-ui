import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core'
import { User } from '@class/user'
import { Observable, from } from 'rxjs'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() user: User
  @Input() size: number = 40

  avatarUrl: Observable<string>

  constructor() {}

  ngOnInit() {
    this.initAvatarUrl()
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      const userChange = changes.user
      if (
        userChange &&
        userChange.previousValue &&
        userChange.currentValue &&
        (userChange.currentValue.avatar.uri !==
          userChange.previousValue.avatar.uri ||
          userChange.currentValue.compressedAvatarUrl !==
            userChange.previousValue.compressedAvatarUrl)
      ) {
        this.initAvatarUrl()
      }
    } catch (e) {
      console.error('Error in ngOnChanges:', e)
    }
  }
  initAvatarUrl() {
    const url = this.getAvatarUrl()
    if (!url) {
      this.avatarUrl = from(Promise.resolve(''))
      return
    }

    this.avatarUrl = from(
      new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject('Image load error')
        img.src = url
      })
    )

    this.avatarUrl.subscribe({
      next: (url) => console.log('Avatar URL loaded:', url),
      error: (err) => console.error('Failed to load avatar URL:', err),
    })
  }

  getAvatarUrl(): string | undefined {
    if (
      this.user?.compressedAvatarUrl &&
      this.user.compressedAvatarUrl !== 'new'
    ) {
      return this.user.compressedAvatarUrl
    }
    return this.user?.avatar?.uri
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

  getSizeClass(): string {
    switch (this.size) {
      case 48:
        return '!w-[48px] !h-[48px]'
      case 40:
        return '!w-[40px] !h-[40px]'
      default:
        return '!w-[32px] !h-[32px]'
    }
  }
}

import { Component, OnInit, Input } from '@angular/core'
import { Observable, from } from 'rxjs'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css'],
})
export class AvatarComponent implements OnInit {
  @Input() user: any
  @Input() customClass: string

  avatarUrl: Observable<string>

  constructor() {}

  ngOnInit() {
    const url = this.user && this.user.avatar && this.user.avatar.uri
    this.avatarUrl = from(
      new Promise<string>((resolve, reject) => {
        if (!url) {
          reject(new Error('Missing avatar URL'))
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
        .map(str => str[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    return ''
  }
}

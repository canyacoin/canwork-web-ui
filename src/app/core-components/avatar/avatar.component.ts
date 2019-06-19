import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit {

  @Input() user: any;

  constructor() { }

  ngOnInit() { }

  getBackground() {
    if (this.user && this.user.avatar && this.user.avatar.uri) {
      return `url(${this.user.avatar.uri})`;
    }
    return null;
  }

  getInitials() {
    if (this.user && this.user.name) {
      return this.user.name
      .split(' ')
      .map(str => str[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    }
    return '';
  }
}

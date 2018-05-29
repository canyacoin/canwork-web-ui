import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';

import { UserService } from '../user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('100ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('120ms ease-out', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {

  currentUser: any = JSON.parse( localStorage.getItem('credentials') );

  @Input() empty = false;
  @Input() filter = false;

  constructor(private router: Router, private userService: UserService, private afs: AngularFirestore) { }

  ngOnInit() {
  }

  onConnect() {
    try {
      this.userService.connect().then( (credentials) => {
        this.currentUser = credentials;

        this.afs.collection<any>('users').doc( this.currentUser.address ).valueChanges().subscribe( (user: any) => {
          console.log('onConnect - user', user);
          if ( user.state !== 'Done' ) {
            this.router.navigate(['/bot']);
          } else {
            this.router.navigate(['/home']);
          }
        });

        // const state = this.userService.db.get('state');
        // console.log('state', this.currentUser.state);
        // if ( this.currentUser.state === 'Done' ) {
        //   this.router.navigate(['/home']);
        // } else {
        //   this.router.navigate(['/bot']);
        // }
      });
    } catch (error) {
      console.error('onConnect - error', error);
    }
  }

}

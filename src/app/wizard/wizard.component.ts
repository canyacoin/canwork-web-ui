import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

import { UserService } from '../user.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  animations: [
    trigger('logoAnimation', [
      transition('* => *', [
        query('.welcome-animation', style({ opacity: 0, transform: 'translateX(-10px)' })),
        query('.welcome-animation', stagger('0ms', [
          animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ]))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: 'translateX(-15px)' })),
        query(':enter', stagger('0ms', [
          animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
        ]))
      ])
    ])
  ]
})
export class WizardComponent implements OnInit {

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
  }

  onChoose(type: string) {
    this.userService.saveData('type', type);
    this.router.navigate(['/profile']);
  }

}

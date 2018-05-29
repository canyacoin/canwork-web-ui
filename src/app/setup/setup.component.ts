import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../user.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

  conversation: any = [
    { flow: 'Hi, I\'m CanYa! Welcome to the world’s best blockchain-powered marketplace of services.', command: 'message' },
    { flow: 'Let\'s get you set up. I just need to ask you some questions.', command: 'message' },
    { flow: { field: 'state', actions: [ { caption: 'Get Started', type: 'button' } ] }, command: 'actions' },

    { flow: 'What is your name?', command: 'message' },
    { flow: { field: 'name', placeholder: 'e.g. Vitalik Buterin', type: 'text', size: 22, maxlength: 26, icon: { 'ti-user': true } }, command: 'input' },
    { flow: 'Cool!', command: 'message' },

    { flow: 'What is your work email?', command: 'message' },
    { flow: { field: 'work', placeholder: 'e.g. vitalik@work.com', type: 'email', size: 22, icon: { 'ti-email': true } }, command: 'input' },
    { flow: 'Got it.', command: 'message' },

    // { flow: 'What is your ETH address?', command: 'message' },
    // { flow: { field: 'ethAddress', placeholder: '0x', type: 'text', size: 22, icon: { 'cc ETH fs-20': true }, pattern: '0x[a-fA-F0-9]{40}$' }, command: 'input' },
    // { flow: 'Great!.', command: 'message' },

    { flow: 'What\'s the headline of your profile?', command: 'message' },
    { flow: { field: 'title', placeholder: 'e.g. Front End Developer', type: 'text', size: 36, maxlength: 26, icon: { 'ti-id-badge': true } }, command: 'input' },
    { flow: 'So cool!', command: 'message' },

    { flow: 'A personal bio is a great way to express to people who you are and what you do.', command: 'message' },
    { flow: 'Write a creative short bio (max. 36 chars):', command: 'message' },
    { flow: { field: 'bio', placeholder: 'Think different! Be creative, be innovative.', type: 'text', size: 36, maxlength: 36, icon: { 'ti-write': true } }, command: 'input' },
    { flow: 'Got it. Thank you!', command: 'message' },

    { flow: 'Last step. Choosing a good color scheme for your profile is important.', command: 'message' },
    { flow: 'Pick the combination of colors that appeals to you most.', command: 'message' },
    { flow: 3, command: 'colors' },

    { flow: 'Awesome! Thanks 👍. We have all we need to set your account.', command: 'message' },
    { flow: { field: 'state', actions: [ { caption: 'Done', type: 'button' } ] }, command: 'actions' }
  ];

  constructor(private router: Router, private userService: UserService) {
  }

  ngOnInit() {
  }

  onAction(event: any) {
    this.userService.saveData(event.field, event.object);
    if (event.object === 'Done') {
      this.router.navigate(['/profile']);
      setTimeout( () => {
        if ( (<any>window).$('html, body') && ( (<any>window).$('#section-profile') && (<any>window).$('#section-profile').offset() ) ) {
          (<any>window).$('html, body').animate({scrollTop: (<any>window).$('#section-profile').offset().top - 60}, 1000);
        }
      }, 300);
    }
  }
}

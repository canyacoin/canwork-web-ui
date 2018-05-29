// , ViewChild, ElementRef
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
// import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/operator/distinctUntilChanged';

// import * as findIndex from 'lodash/findIndex';
// const index: number = findIndex(this.bot, { typing: true });

import * as randomColor from 'randomcolor';

// https://media.giphy.com/media/DwXOS8RqHocEM/giphy.gif
// { caption: '■■■', type: 'button', innerHTML: `<span style="color: ${ c1[0] }>■</span><span style="color: ${ c1[1] }>■</span><span style="color: ${ c1[2] }>■</span>` }
// (<any>window).$('#cover1').each( function (index) {
//   console.log('#cover1', index);
//   (<any>window).$(this).style({ '--animation-time1' : Math.floor(Math.random() * 50 + 1) + 's' });
//   (<any>window).$(this).style({ '--animation-time2' : Math.floor(Math.random() * 50 + 1) + 's' });
//   (<any>window).$(this).style({ '--animation-time3' : Math.floor(Math.random() * 50 + 1) + 's' });
// });
// (<any>window).$('.cover1-wave:nth-of-type(n+1)').css('--animation-time1', Math.floor(Math.random() * 50 + 1) + 's');
// (<any>window).$('.cover1-wave:nth-of-type(n+1)').css('--animation-time2', Math.floor(Math.random() * 50 + 1) + 's');
// (<any>window).$('.cover1-wave:nth-of-type(n+1)').css('--animation-time3', Math.floor(Math.random() * 50 + 1) + 's');

// (<any>window).$('.cover1-wave:nth-of-type(n+2)').css('--animation-time1', Math.floor(Math.random() * 50 + 1) + 's');
// (<any>window).$('.cover1-wave:nth-of-type(n+2)').css('--animation-time2', Math.floor(Math.random() * 50 + 1) + 's');
// (<any>window).$('.cover1-wave:nth-of-type(n+2)').css('--animation-time3', Math.floor(Math.random() * 50 + 1) + 's');
// await this.addBotMessage('Hi, I\'m CanYa! Welcome to the world’s best blockchain-powered marketplace of services.');
// await this.addBotMessage('Let\'s get you set up. I just need to ask you some questions.');
// await this.addBotActions( { field: 'state', actions: [ { caption: 'Get Started', type: 'button' } ] } );

// await this.addBotMessage('What is your name?');
// await this.addBotInput( { field: 'name', placeholder: 'e.g. Vitalik Buterin', type: 'text', size: 22, maxlength: 26, icon: { 'ti-user': true } } );
// await this.addBotMessage('Cool!');

// await this.addBotMessage('What is your work email?');
// await this.addBotInput( { field: 'email', placeholder: 'e.g. vitalik@work.com', type: 'email', size: 22, icon: { 'ti-email': true } } );
// await this.addBotMessage('Got it.');

// await this.addBotMessage('What\'s the headline of your profile?');
// await this.addBotInput( { field: 'title', placeholder: 'e.g. Front End Developer', type: 'text', size: 36, maxlength: 26, icon: { 'ti-id-badge': true } } );
// await this.addBotMessage('So cool!');

// await this.addBotMessage('A personal bio is a great way to express to people who you are and what you do.');
// await this.addBotMessage('Write a creative short bio (max. 60 chars):');
// await this.addBotInput( { field: 'bio', placeholder: 'Think different! Be creative, be innovative.', type: 'text', size: 48, maxlength: 64, icon: { 'ti-write': true } } );
// await this.addBotMessage('Got it. Thank you!');

// await this.addBotMessage('Last step. Choosing a good color scheme for your profile is important.');
// await this.addBotMessage('Pick the combination of colors that appeals to you most.');

// const colorActions = [];
// for (let i = 0; i < 3; i++) {
//   const colors = randomColor( { luminosity: 'light', count: 3 });
//   colorActions.push(
//     {
//       caption: '███',
//       type: 'button',
//       innerHTML: this.setColorsSpan(colors),
//       colors: colors
//     });
// }
// await this.addBotActions( { field: 'colors', actions: colorActions } );

// await this.addBotMessage('Awesome! Thanks 👍. We have all we need to set your account.');
// await this.addBotActions( { field: 'state', actions: [ { caption: 'Done', type: 'button' } ] } );
// this.router.navigate(['/profile']);
@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css'],
  animations: [
    trigger('logoAnimation', [
      transition('* => *', [
        query('.row', style({ opacity: 0, transform: 'translateX(-10px)' })),
        query('.row', stagger('0ms', [
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
export class BotComponent implements OnInit {

  // @ViewChild('botui') botui: ElementRef;

  index = 0;
  bot: any = [];
  triggerAction: Subject<any> = new Subject<any>();

  @Input() conversation: Array<any> = [];
  @Input() logo = true;
  @Input() header: String;
  @Output() action: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.init();
  }

  async init() {

    for (const o of this.conversation) {
      if ( o.command === 'colors' ) {
        await this.addBotActions( { field: 'colors', actions: this.randomColors(o.flow) } );
      } else if ( o.command === 'actions' ) {
        await this.addBotActions( o.flow );
      } else if ( o.command === 'input' ) {
        await this.addBotInput( o.flow );
      } else {
        await this.addBotMessage( o.flow );
      }
    }
  }

  onAction(i: number, field: string, object: any) {
    if ( object instanceof Array ) {
      this.triggerAction.next( { i: i, message: this.setColorsSpan(object)  } );
    } else {
      this.triggerAction.next( { i: i, message: object } );
    }
    this.action.emit( {field: field, object: object} );
    event.preventDefault();
  }

  onKeyUp(botInput: any, btnSubmit: any) {
    btnSubmit.disabled = !botInput.validity.valid;
    return true;
  }

  randomColors(n: number) {
    const colorActions = [];
    const defaultColors = ['#00FFCC', '#33ccff', '#15EDD8'];
    for (let i = 0; i < n; i++) {
      const colors = randomColor( { luminosity: 'light', count: 3 });
      colorActions.push(
        {
          caption: '███',
          type: 'button',
          innerHTML: this.setColorsSpan(colors),
          colors: colors
        });
    }
    colorActions.push(
      {
        caption: '███',
        type: 'button',
        innerHTML: this.setColorsSpan(defaultColors),
        colors: defaultColors
      });
    return colorActions;
  }

  // margin-right: -2.8px;
  setColorsSpan(colors: any) {
    return `<span style="color: ${ colors[0] }; font-size: 14px; line-height: 1;">█</span>
            <span style="color: ${ colors[1] }; font-size: 14px; line-height: 1; margin-left: -2.8px">█</span>
            <span style="color: ${ colors[2] }; font-size: 14px; line-height: 1; margin-left: -2.8px">█</span>`;
  }

  scrollToBottom() {
    setTimeout( () => {
      if ( (<any>window).$('html, body') && ( (<any>window).$('#section-end') && (<any>window).$('#section-end').offset() ) ) {
        (<any>window).$('html, body').animate({scrollTop: (<any>window).$('#section-end').offset().top - 60}, 1000);
      }
    }, 300);
  }

  async addBotMessage(message: string) {
    return new Promise((resolve) => {
      const i = this.bot.push({ message: message, typing: true, from: 'bot' }) - 1;
      setTimeout( () => {
        this.bot[i].typing = false;
        this.index++;
        this.scrollToBottom();
        resolve(i);
      }, 1000);
    });
  }

  async addBotActions(object: any) {
    return new Promise((resolve) => {
      const tmpActions = {};
      tmpActions['field'] = object.field;
      tmpActions['actions'] = object.actions;
      tmpActions['typing'] = false;
      tmpActions['from'] = 'bot';
      const i = this.bot.push( tmpActions ) - 1;
      this.triggerAction.take(1).subscribe( (response: any) => {
        this.bot.splice(response.i, 1);
        this.bot.push( { message: response.message, typing: false, from: 'me' } );
        this.scrollToBottom();
        resolve(response.i);
      });
    });
  }

  async addBotInput(input: any) {
    return new Promise((resolve) => {
      const tmpInput = input;
      tmpInput['typing'] = false;
      tmpInput['input'] = true;
      tmpInput['from'] = 'bot';
      const i = this.bot.push(tmpInput) - 1;
      this.triggerAction.take(1).subscribe( (response: any) => {
        this.bot.splice(response.i, 1);
        this.bot.push( { message: response.message, typing: false, from: 'me' } );
        this.scrollToBottom();
        resolve(response.i);
      });
    });
  }
}

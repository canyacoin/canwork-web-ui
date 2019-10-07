import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import * as randomColor from 'randomcolor'

import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: [
    './bot.component.css',
    './botui.min.css',
    './botui-theme-default.css',
  ],
  animations: [
    trigger('logoAnimation', [
      transition('* => *', [
        query('.row', style({ opacity: 0, transform: 'translateX(-10px)' })),
        query(
          '.row',
          stagger('0ms', [
            animate(
              '600ms ease-out',
              style({ opacity: 1, transform: 'translateX(0)' })
            ),
          ])
        ),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: 'translateX(-15px)' })),
        query(
          ':enter',
          stagger('0ms', [
            animate(
              '300ms ease-out',
              style({ opacity: 1, transform: 'translateX(0)' })
            ),
          ])
        ),
      ]),
    ]),
  ],
})
export class BotComponent implements OnInit {
  index = 0
  bot: any = []
  triggerAction: Subject<any> = new Subject<any>()

  @Input() conversation: Array<any> = []
  @Input() logo = true
  @Input() header: String
  @Output() action: EventEmitter<any> = new EventEmitter()

  constructor(private router: Router) {}

  ngOnInit() {
    this.init()
  }

  async init() {
    for (const o of this.conversation) {
      if (o.command === 'colors') {
        await this.addBotActions({
          field: 'colors',
          actions: this.randomColors(o.flow),
        })
      } else if (o.command === 'actions') {
        await this.addBotActions(o.flow)
      } else if (o.command === 'input') {
        await this.addBotInput(o.flow)
      } else {
        await this.addBotMessage(o.flow)
      }
    }
  }

  onAction(i: number, field: string, object: any) {
    event.preventDefault()
    if (object instanceof Array) {
      this.triggerAction.next({ i: i, message: this.setColorsSpan(object) })
    } else {
      this.triggerAction.next({ i: i, message: object })
    }
    this.action.emit({ field: field, object: object })
  }

  onKeyUp(botInput: any, btnSubmit: any) {
    btnSubmit.disabled = !botInput.validity.valid
    return true
  }

  randomColors(n: number) {
    const colorActions = []
    const defaultColors = ['#00FFCC', '#33ccff', '#15EDD8']
    for (let i = 0; i < n; i++) {
      const colors = randomColor({ luminosity: 'light', count: 3 })
      colorActions.push({
        caption: '███',
        type: 'button',
        innerHTML: this.setColorsSpan(colors),
        colors: colors,
      })
    }
    colorActions.push({
      caption: '███',
      type: 'button',
      innerHTML: this.setColorsSpan(defaultColors),
      colors: defaultColors,
    })
    return colorActions
  }

  setColorsSpan(colors: any) {
    return `<span style="color: ${colors[0]}; font-size: 14px; line-height: 1;">█</span>
            <span style="color: ${colors[1]}; font-size: 14px; line-height: 1; margin-left: -2.8px">█</span>
            <span style="color: ${colors[2]}; font-size: 14px; line-height: 1; margin-left: -2.8px">█</span>`
  }

  scrollToBottom() {
    setTimeout(() => {
      if (
        (<any>window).$('html, body') &&
        ((<any>window).$('#section-end') &&
          (<any>window).$('#section-end').offset())
      ) {
        ;(<any>window)
          .$('html, body')
          .animate(
            { scrollTop: (<any>window).$('#section-end').offset().top - 60 },
            1000
          )
      }
    }, 300)
  }

  async addBotMessage(message: string) {
    return new Promise(resolve => {
      const i =
        this.bot.push({ message: message, typing: true, from: 'bot' }) - 1
      setTimeout(() => {
        this.bot[i].typing = false
        this.index++
        this.scrollToBottom()
        resolve(i)
      }, 1000)
    })
  }

  async addBotActions(object: any) {
    return new Promise(resolve => {
      const tmpActions = {}
      tmpActions['field'] = object.field
      tmpActions['actions'] = object.actions
      tmpActions['typing'] = false
      tmpActions['from'] = 'bot'
      const i = this.bot.push(tmpActions) - 1
      const sub = this.triggerAction
        .pipe(take(1))
        .subscribe((response: any) => {
          this.bot.splice(response.i, 1)
          this.bot.push({
            message: response.message,
            typing: false,
            from: 'me',
          })
          this.scrollToBottom()
          sub.unsubscribe()
          resolve(response.i)
        })
    })
  }

  async addBotInput(input: any) {
    return new Promise(resolve => {
      const tmpInput = input
      tmpInput['typing'] = false
      tmpInput['input'] = true
      tmpInput['from'] = 'bot'
      const i = this.bot.push(tmpInput) - 1
      const sub = this.triggerAction
        .pipe(take(1))
        .subscribe((response: any) => {
          this.bot.splice(response.i, 1)
          this.bot.push({
            message: response.message,
            typing: false,
            from: 'me',
          })
          this.scrollToBottom()
          sub.unsubscribe()
          resolve(response.i)
        })
    })
  }
}

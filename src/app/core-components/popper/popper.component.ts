import {
  Component,
  Input,
  OnInit,
  Directive,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { createPopper, Placement } from '@popperjs/core'
import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'app-popper',
  templateUrl: './popper.component.html',
  styleUrls: ['./popper.component.css'],
})
export class PopperComponent implements OnInit {
  @Input() targetId: Required<string>
  @Input() tooltipId: Required<string>
  @Input() tooltipText: string = ''
  @Input() disableShowHide: boolean = false

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    let tooltipEl = document.querySelector<any>('#' + this.tooltipId)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        tooltipEl = document.querySelector<any>('#' + this.tooltipId)
        if (tooltipEl) tooltipEl.innerText = this.tooltipText
      }, 100)
    } else {
      tooltipEl = document.querySelector<any>('#' + this.tooltipId)
      if (tooltipEl) tooltipEl.innerText = this.tooltipText
    }
    const targetEl = document.querySelector('#' + this.targetId)

    let popperInstance = null

    function create() {
      popperInstance = createPopper(targetEl, tooltipEl, {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      })
    }

    function destroy() {
      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    }

    function show() {
      tooltipEl.setAttribute('data-show', '')
      create()
    }

    function hide() {
      tooltipEl.removeAttribute('data-show')
      destroy()
    }

    if (this.disableShowHide === false) {
      const showEvents = ['focus', 'mouseenter']
      const hideEvents = ['blur', 'mouseleave']

      showEvents.forEach((event) => {
        targetEl.addEventListener(event, show)
      })

      hideEvents.forEach((event) => {
        targetEl.addEventListener(event, hide)
      })
    }
  }
}

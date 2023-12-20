import { Component } from '@angular/core'
import { WhyUseService } from 'app/shared/constants/home'
import { WindowService } from 'app/shared/services/window.service'

@Component({
  selector: 'why-use',
  templateUrl: './why-use.component.html',
})
export class WhyUseComponent {
  whyUseSection = WhyUseService
  private windowWidth: number

  constructor(private windowService: WindowService) {}

  ngOnInit() {
    this.windowService.getWindowWidth().subscribe((width) => {
      this.windowWidth = width
    })
  }

  isWindowWidthMd(): boolean {
    return this.windowWidth > 768
  }
}

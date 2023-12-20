import { Component } from '@angular/core'
import { HowWorksService } from 'app/shared/constants/home'
import { WindowService } from 'app/shared/services/window.service'

@Component({
  selector: 'how-works',
  templateUrl: './how-works.component.html',
})
export class HowWorksComponent {
  homeWorksSection = HowWorksService
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

import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
})
export class CircleProgressComponent {
  @Input() progress: number = 0
  @Output() progressComplete = new EventEmitter<void>()

  private maxProgress: number = 100

  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 50
    return circumference - (this.progress / this.maxProgress) * circumference
  }

  onTransitionEnd(): void {
    if (this.progress >= this.maxProgress) {
      this.progressComplete.emit()
    }
  }
}

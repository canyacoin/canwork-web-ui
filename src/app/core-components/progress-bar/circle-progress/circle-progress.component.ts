import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
})
export class CircleProgressComponent {
  @Input() progress: number = 0

  private maxProgress: number = 100

  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 50
    return circumference - (this.progress / this.maxProgress) * circumference
  }
}

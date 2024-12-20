import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-view-portfolio',
  templateUrl: './view-portfolio.component.html',
  styleUrls: ['./view-portfolio.component.css'],
})
export class ViewPortfolioComponent {
  @Input() data: any
  @Input() isMyProfile: boolean
  @Output() optionSelected = new EventEmitter<{ option: string; data: any }>()
  isOpen: boolean = false

  dropdownOptions = [
    {
      label: 'Edit',
      code: 'edit',
      icon: 'fi_edit_gray.svg',
    },
    {
      label: 'Delete',
      code: 'delete',
      icon: 'delete.svg',
    },
  ]

  onOptionSelected(event) {
    this.optionSelected.emit(event)
  }

  checkItOut(url): void {
    window.open(url, '_blank')
  }

  open() {
    this.isOpen = true
  }

  close() {
    this.isOpen = false
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close()
    }
  }
}

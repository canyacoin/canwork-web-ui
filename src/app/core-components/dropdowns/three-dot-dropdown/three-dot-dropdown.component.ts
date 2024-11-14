import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core'

@Component({
  selector: 'three-dot-dropdown',
  templateUrl: './three-dot-dropdown.component.html',
  styleUrls: ['./three-dot-dropdown.component.css'],
})
export class ThreeDotDropdownComponent {
  @Input() options = []
  @Input() data: any
  @Output() optionSelected = new EventEmitter<{ option: string; data: any }>()

  isDropdownOpen = false

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const button = event.target as HTMLElement
    if (this.isDropdownOpen && !button?.closest('.dots-button') && !button?.closest('.dropdown-menu')) {
      this.isDropdownOpen = false
    }
  }

  selectOption(option: string): void {
    this.optionSelected.emit({ option, data: this.data })
    this.isDropdownOpen = false
  }
}

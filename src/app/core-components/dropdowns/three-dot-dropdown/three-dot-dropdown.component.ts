import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core'

@Component({
  selector: 'three-dot-dropdown',
  templateUrl: './three-dot-dropdown.component.html',
  styleUrls: ['./three-dot-dropdown.component.css'],
})
export class ThreeDotDropdownComponent {
  @Input() options = []
  @Output() optionSelected = new EventEmitter<string>()

  isDropdownOpen = false

  // Toggle the dropdown visibility
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const button = event.target as HTMLElement
    if (this.isDropdownOpen && !button?.closest('.dots-button') && !button?.closest('.dropdown-menu')) {
      this.isDropdownOpen = false
    }
  }

  // Emit selected option
  selectOption(option: string): void {
    this.optionSelected.emit(option)
    this.isDropdownOpen = false
  }
}

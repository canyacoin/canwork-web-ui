import { Component, Input } from '@angular/core';

@Component({
  selector: 'attachment-button',
  templateUrl: './attachment-button.component.html',
  styleUrls: ['./attachment-button.component.css']
})
export class AttachmentButtonComponent {
  @Input() url!: string
  @Input() name!: string
}

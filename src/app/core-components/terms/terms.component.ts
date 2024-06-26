import { Component, Input } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
})
export class TermsComponent {
  @Input() form: UntypedFormGroup
  constructor() {}
}

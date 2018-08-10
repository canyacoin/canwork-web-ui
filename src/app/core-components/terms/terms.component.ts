import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent {

  @Input() form: FormGroup;

  constructor() { }

}

import { providerTypeArray } from './../../const/providerTypes'
import { Component, OnInit } from '@angular/core'

declare var createCustomFooter: any
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  public providerTypes = providerTypeArray
  constructor() {}
  ngOnInit() {}
}

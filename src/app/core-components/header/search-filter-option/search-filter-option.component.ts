import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'app-search-filter-option',
  templateUrl: './search-filter-option.component.html',
  styleUrls: ['./search-filter-option.component.css'],
})
export class SearchFilterOptionComponent implements OnInit {
  @Input() text: string
  @Input() link: string

  constructor() {}

  ngOnInit() {}
}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'canyalib-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  @Input() label = '';
  @Input() isLoading = false;

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'canyalib-loading-status',
  templateUrl: './loading-status.component.html',
  styleUrls: ['./loading-status.component.scss']
})
export class LoadingStatusComponent implements OnInit {
  @Input() label = 'Loading';
  @Input() isLoading = false;

  constructor() { }

  ngOnInit() {
  }

}

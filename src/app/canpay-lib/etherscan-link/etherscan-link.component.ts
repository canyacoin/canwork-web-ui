import { Component, Input, OnInit } from '@angular/core';

import { environment  } from '@env/environment';

@Component({
  selector: 'canyalib-etherscan-link',
  templateUrl: './etherscan-link.component.html',
  styleUrls: ['./etherscan-link.component.css']
})
export class EtherscanLinkComponent implements OnInit {

  @Input() address: string;



  constructor() { }

  ngOnInit() {

  }

  get url() {
    if (this.address) {
      return `${environment.contracts.etherscan}/address/${this.address}`;
    } else {
      return '';
    }
  }

}

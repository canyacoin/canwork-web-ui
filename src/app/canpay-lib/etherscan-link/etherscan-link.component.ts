import { Component, Input, OnInit } from '@angular/core';

import { EthService } from '../services/eth.service';

@Component({
  selector: 'canyalib-etherscan-link',
  templateUrl: './etherscan-link.component.html',
  styleUrls: ['./etherscan-link.component.css']
})
export class EtherscanLinkComponent implements OnInit {

  @Input() address: string;



  constructor(private ethService: EthService) { }

  ngOnInit() {

  }

  get url() {
    if (this.address) {
      return `http://${this.ethService.configUseTestNet ? 'ropsten.' : ''}etherscan.io/address/${this.address}`;
    } else {
      return '';
    }
  }

}

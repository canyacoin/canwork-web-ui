import { Component, Input, OnInit } from '@angular/core';

import { EthService } from '../../../core-services/eth.service';

@Component({
  selector: 'app-profile-support-me',
  templateUrl: './support-me.component.html',
  styleUrls: ['./support-me.component.css']
})
export class SupportMeComponent implements OnInit {

  @Input() userModel: any;

  constructor(private ethService: EthService) { }

  ngOnInit() { }

  async onBuyACoffee() {
    await this.ethService.buyCoffee(this.userModel.ethAddress, 1);
    (<any>window).$('#thankYou').modal();
  }
}
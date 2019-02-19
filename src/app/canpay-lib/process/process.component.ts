import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

import { CanYaCoinEthService } from '../services/canyacoin-eth.service';

@Component({
  selector: 'canyalib-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements AfterViewInit {
  @Output() success = new EventEmitter();
  @Output() warning = new EventEmitter();
  @Output() start = new EventEmitter();
  @Input() processName;
  @Input() dAppName;
  @Input() recipient;
  @Input() amount = 0;
  @Input() totalTransactions = 0;
  @Input() set error(msg: string) {
    if (!!msg) {
      this.sendingTx = false;
    }
  }

  sendingTx = false;

  constructor(private canyaCoinEthService: CanYaCoinEthService) { }

  async ngAfterViewInit() {
    const ethBal = await this.canyaCoinEthService.getEthBalanceAsync();
    if (Number(ethBal) <= 0) {
      this.warning.emit('You do not have enough gas (ETH) to send this transaction');
    } else if (Number(ethBal) <= 0.02) {
      this.warning.emit('You might not have enough gas (ETH) to send this transaction');
    }
  }

  submit() {
    this.sendingTx = true;
    this.start.emit(true);
  }
}

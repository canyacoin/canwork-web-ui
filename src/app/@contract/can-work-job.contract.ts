import { EthService } from '@service/eth.service';
import { Job } from '@class/job';
import { User } from '@class/user';
import { environment } from '@env/environment';

declare var require: any;

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json');

export class CanWorkJobContract {

  instance: any;
  canYaDecimals = 6;


  constructor(private eth: EthService) {
  }

  connect() {
    this.instance = this.eth.createContractInstance(CanWorkJobContractInterface.abi, environment.contracts.canwork);
    return this;
  }

  async createJob(job: Job, clientAddress: string, providerAddress: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      const txObject = await this.instance.methods.createJob(this.eth.web3js.utils.padRight(job.hexId, 32), clientAddress, providerAddress, job.budgetCan * (10 ** this.canYaDecimals));
      let gas, gasPrice = '';

      try {
        gas = await txObject.estimateGas({ from: clientAddress });
        gasPrice = await this.eth.getDefaultGasPriceGwei();
      } catch (err) {
        reject(err);
      }

      const txOptions = {
        from: clientAddress,
        value: '0x0',
        gasLimit: gas,
        gasPrice: gasPrice,
        data: txObject.encodeABI(),
      };
      txObject.send(txOptions, async (err, txHash) => this.eth.resolveTransaction(err, clientAddress, txHash, resolve, reject, onTxHash));

    });
  }

  async completeJob(job: Job, fromAddr: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      const txObject = await this.instance.methods.completeJob(this.eth.web3js.utils.padRight(job.hexId, 32));
      let gas, gasPrice = '';

      try {
        gas = await txObject.estimateGas({ from: fromAddr });
        gasPrice = await this.eth.getDefaultGasPriceGwei();
      } catch (err) {
        reject(err);
      }

      const txOptions = {
        from: fromAddr,
        value: '0x0',
        gasLimit: gas,
        gasPrice: gasPrice,
        data: txObject.encodeABI(),
      };
      txObject.send(txOptions, async (err, txHash) => this.eth.resolveTransaction(err, fromAddr, txHash, resolve, reject, onTxHash));
    });
  }
}

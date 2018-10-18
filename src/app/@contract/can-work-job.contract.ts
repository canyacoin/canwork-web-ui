import { CanYaCoinEthService, EthService } from '@canyaio/canpay-lib';
import { Job } from '@class/job';
import { User } from '@class/user';
import { environment } from '@env/environment';

declare var require: any

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json')

export class CanWorkJobContract {

  instance: any
  canYaDecimals = 6


  constructor(private eth: EthService) {
  }

  connect() {
    this.instance = this.eth.createContractInstance(CanWorkJobContractInterface.abi, environment.contracts.canwork)
    return this
  }

  async createJob(job: Job, clientAddress: string, providerAddress: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      try {
        const txObject = await this.instance.methods.createJob(this.eth.web3js.utils.padRight(job.hexId, 32), clientAddress, providerAddress, job.budgetCan * (10 ** this.canYaDecimals));
        const gas = await txObject.estimateGas({ from: clientAddress });
        const gasPrice = await this.eth.getDefaultGasPriceGwei();
        const txOptions = {
          from: clientAddress,
          value: '0x0',
          gasLimit: gas,
          gasPrice: gasPrice,
          data: txObject.encodeABI(),
        };

        txObject.send(txOptions, async (err, txHash) => this.eth.resolveTransaction(err, clientAddress, txHash, resolve, reject, onTxHash));
      } catch (err) {
        reject(err);
      }
    });
  }

  async completeJob(job: Job, fromAddr: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      try {
        const txObject = await this.instance.methods.completeJob(this.eth.web3js.utils.padRight(job.hexId, 32));
        const gas = await txObject.estimateGas({ from: fromAddr });
        const gasPrice = await this.eth.getDefaultGasPriceGwei();

        const txOptions = {
          from: fromAddr,
          value: '0x0',
          gasLimit: gas,
          gasPrice: gasPrice,
          data: txObject.encodeABI(),
        };

        txObject.send(txOptions, async (err, txHash) => this.eth.resolveTransaction(err, fromAddr, txHash, resolve, reject, onTxHash));
      } catch (err) {
        reject(err);
      }
    });
  }

}

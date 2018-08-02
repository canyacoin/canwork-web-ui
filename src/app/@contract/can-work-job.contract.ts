import { EthService } from '@canyaio/canpay-lib';
import { Job } from '@class/job';
import { User } from '@class/user';
import { environment } from '@env/environment';

declare var require: any

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json')

export class CanWorkJobContract {

  instance: any

  address: string

  gasPrice: number

  constructor(
    private eth: EthService) {

    this.gasPrice = this.eth.web3js.utils.toWei('8', 'gwei')

  }

  setAddress(address: string) {
    this.instance.options.address = address
    this.instance._address = address
    this.address = address

    return this
  }

  connect() {
    const _contract = new this.eth.web3js.eth.Contract(CanWorkJobContractInterface.abi)

    this.instance = _contract

    this.setAddress(environment.contracts.canwork)

    return this
  }

  async createJob(job: Job, client: User, provider: User) {

    return new Promise(async (resolve, reject) => {

      try {

        const txObject = await this.instance.methods.createJob(this.eth.web3js.utils.padRight(job.hexId, 32), client.ethAddress, provider.ethAddress, job.canInEscrow * (10 ** 6));

        const gas = await txObject.estimateGas()

        const txOptions = {
          from: client.ethAddress,
          value: '0x0',
          gasLimit: gas,
          gasPrice: this.gasPrice,
          data: txObject.encodeABI(),
        }

        const tx = txObject.send(txOptions)

        tx.on('transactionHash', hash => {
          console.log(hash)
        })

        tx.on('error', error => {
          reject(error)
        })

        tx.on('receipt', receipt => {
          resolve(receipt)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  async completeJob(job: Job, fromAddr: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const txObject = await this.instance.methods.completeJob(this.eth.web3js.utils.padRight(job.hexId, 32));

        const txOptions = {
          from: fromAddr,
          value: '0x0',
          gasLimit: 200000,
          gasPrice: this.gasPrice,
          data: txObject.encodeABI(),
        };

        const tx = txObject.send(txOptions);

        tx.on('transactionHash', hash => {
          console.log(hash);
        });
        tx.on('error', error => {
          reject(error);
        });
        tx.on('receipt', receipt => {
          resolve(receipt);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

}

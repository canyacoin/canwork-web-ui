import { EthService } from '@canyaio/canpay-lib';
import { Job } from '@class/job';
import { User } from '@class/user';
import { environment } from '@env/environment';

declare var require: any

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json')

export class CanWorkJobContract {

  instance: any

  address: string

  constructor(
    private eth: EthService) { }

  setAddress(address: string) {
    this.instance.options.address = address
    this.instance._address = address
    this.address = address

    return this
  }

  connect() {
    let _contract = new this.eth.web3js.eth.Contract(CanWorkJobContractInterface.abi)

    this.instance = _contract

    this.setAddress(environment.contracts.canwork)

    return this
  }

  async createJob(job: Job, client: User, provider: User) {

    return new Promise(async (resolve, reject) => {

      try {

        let txObject = await this.instance.methods.createJob(this.eth.web3js.utils.padRight(job.hexId, 32), client.ethAddress, provider.ethAddress, job.canInEscrow * (10 ** 6));

        let gas = await txObject.estimateGas()

        let txOptions = {
          from: client.ethAddress,
          value: '0x0',
          gasLimit: gas,
          gasPrice: 32000000000,
          data: txObject.encodeABI(),
        }

        let tx = txObject.send(txOptions)

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

}

import { EthService } from '@canyaio/canpay-lib';
import { Job } from '@class/job';

declare var require: any

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json')

export class CanWorkJobContract {

  static readonly ADDRESS_PRIVATE: string = '0xff3c41a91a4b8d06dbb9a82db3412df548517e77'

  instance: any

  address: string

  constructor(
    private eth: EthService){}

  setAddress(address: string){
    this.instance.options.address = address
    this.instance._address = address
    this.address = address

    return this
  }

  connect(){
    let _contract = new this.eth.web3js.eth.Contract(CanWorkJobContractInterface.abi)

    this.instance = _contract

    return this
  }

  async createJob(job: Job, clientAddress: string, providerAddress: string, totalCosts: number){

    return new Promise(async (resolve, reject) => {

      try {

        let txObject = await this.instance.methods.createJob(job.id, clientAddress, providerAddress, totalCosts)

        let gas = await txObject.estimateGas()

        let txOptions = {
          from: clientAddress,
          value: '0x0',
          gas: gas,
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

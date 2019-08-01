import { EthService } from '@service/eth.service'
import { Job } from '@class/job'
import { environment } from '@env/environment'

declare var require: any

const CanWorkJobContractInterface = require('@abi/can-work-job.abi.json')

export class CanWorkJobContract {
  instance: any

  constructor(private eth: EthService) {}

  connect() {
    this.instance = this.eth.createContractInstance(
      CanWorkJobContractInterface.abi,
      environment.contracts.canwork
    )
    return this
  }

  async createJob(
    job: Job,
    clientAddress: string,
    providerAddress: string,
    onTxHash: Function
  ) {
    return new Promise(async (resolve, reject) => {
      const txObject = await this.instance.methods.createJob(
        this.eth.web3js.utils.padRight(job.hexId, 64),
        clientAddress,
        providerAddress,
        this.eth.amountToCANTokens(job.budgetCan)
      )
      let gas,
        gasPrice = ''
      try {
        gas = await txObject.estimateGas({ from: clientAddress })
        gasPrice = await this.eth.getDefaultGasPriceGwei()
      } catch (err) {
        reject(err)
      }

      const txOptions = {
        from: clientAddress,
        // Value should be send only for transactions that require sending a value. Here we can ommit it:
        // value: '0x0',
        gasLimit: gas,
        gasPrice: gasPrice,
        data: txObject.encodeABI(),
      }
      txObject.send(txOptions, async (err, txHash) =>
        this.eth.resolveTransaction(
          err,
          clientAddress,
          txHash,
          resolve,
          reject,
          onTxHash
        )
      )
    })
  }

  async completeJob(job: Job, fromAddr: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      const txObject = await this.instance.methods.completeJob(
        this.eth.web3js.utils.padRight(job.hexId, 64)
      )
      let gas,
        gasPrice = ''

      try {
        gas = await txObject.estimateGas({ from: fromAddr })
        gasPrice = await this.eth.getDefaultGasPriceGwei()
      } catch (err) {
        reject(err)
      }

      const txOptions = {
        from: fromAddr,
        // Value should be send only for transactions that require sending a value. Here we can ommit it:
        // value: '0x0',
        gasLimit: gas,
        gasPrice: gasPrice,
        data: txObject.encodeABI(),
      }
      txObject.send(txOptions, async (err, txHash) =>
        this.eth.resolveTransaction(
          err,
          fromAddr,
          txHash,
          resolve,
          reject,
          onTxHash
        )
      )
    })
  }

  async cancelJobByProvider(job: Job, fromAddr: string, onTxHash: Function) {
    return new Promise(async (resolve, reject) => {
      console.log('cancelling job :' + job.hexId)
      const txObject = await this.instance.methods.cancelJobByProvider(
        this.eth.web3js.utils.padRight(job.hexId, 64)
      )
      let gas,
        gasPrice = ''

      try {
        gas = await txObject.estimateGas({ from: fromAddr })
        gasPrice = await this.eth.getDefaultGasPriceGwei()
      } catch (err) {
        reject(err)
      }

      const txOptions = {
        from: fromAddr,
        // Value should be send only for transactions that require sending a value. Here we can ommit it:
        // value: '0x0',
        gasLimit: gas,
        gasPrice: gasPrice,
        data: txObject.encodeABI(),
      }
      console.log(txOptions)
      txObject.send(txOptions, async (err, txHash) =>
        this.eth.resolveTransaction(
          err,
          fromAddr,
          txHash,
          resolve,
          reject,
          onTxHash
        )
      )
    })
  }
}

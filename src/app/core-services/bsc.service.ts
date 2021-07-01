import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

import { environment } from '@env/environment'

const NETWORK_ID = environment.bsc.netId;
const CHAIN_ID = "0x"+NETWORK_ID.toString(16)
const CHAIN_NAME = environment.bsc.chainName
const RPC_URLS = environment.bsc.rpcUrls
const BLOCK_EXPLORER_URLS = environment.bsc.blockExplorerUrls
const CURRENCY = { name: "BNB", symbol: "bnb", decimals: 18 }

import { ethers } from "ethers";
/*
  to support ethers 5.3.1, we needed to add "skipLibCheck" into tsconfig.json compilerOptions
  https://github.com/ethers-io/ethers.js/issues/776
  https://github.com/storybookjs/storybook/issues/9463
*/

export enum WalletApp {
  MetaMask
}

export enum EventType {
  ConnectSuccess = 'ConnectSuccess',
  ConnectFailure = 'ConnectFailure',
  ConnectConfirmationRequired = 'ConnectConfirmationRequired',
  Update = 'Update',
  Disconnect = 'Disconnect',
}

export interface EventDetails {
  address?: string
}

export interface Event {
  type: EventType
  details: EventDetails
  walletApp?: WalletApp  
}


declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class BscService {
  provider = null
  signer = null
  private events: BehaviorSubject<Event | null> = new BehaviorSubject(null)
  events$ = this.events.asObservable()
  

  constructor() { }
  
  async connect(app: any): Promise<string> {
    
    if (!window.ethereum) return 'MetaMask not found'


    if (!this.provider) this.provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    
    if (!this.provider) return 'No Provider'
    
    let network = await this.provider.getNetwork()
    
    if (network.chainId !== NETWORK_ID) {
      await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
              chainId: CHAIN_ID,
              chainName: CHAIN_NAME,
              nativeCurrency: CURRENCY,
              rpcUrls: RPC_URLS,
              blockExplorerUrls: BLOCK_EXPLORER_URLS    
          }]
      });
      
      // update
      network = await this.provider.getNetwork()
      if (network.chainId !== NETWORK_ID) return "Wrong network"

      // todo listen for network change and invalide service status (add connected property)
    }
    
    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // todo try catch this, if no account provider it will give err
    this.signer = await this.provider.getSigner()

    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    
    const address = await this.signer.getAddress();
    // todo save in local storage connection status
    
    this.events.next({
      type: EventType.ConnectSuccess,
      walletApp: WalletApp.MetaMask,
      details: { address },
    })    
      
    return 'connected (debug)' // empty if everything is ok
  }

  async disconnect() {
    // todo
    
  }
}

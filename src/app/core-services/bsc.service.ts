import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { BscValidator } from '@validator/bsc.validator'

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



declare var window: any; // we need to get metamask object from browser window


/*
generic token Human-Readable ABI
https://docs.ethers.io/v5/api/utils/abi/formats/#abi-formats--human-readable-abi
*/
const tokenAbi = [ 
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)",

  // Before we can send an asset to the escrow we must first approve a spend allowance on the asset contract
  // uint is equivalent to uint256
  "function approve(address _spender, uint _value) nonpayable returns (bool)"

];


export enum WalletAppBsc {
  MetaMask
}

export enum EventTypeBsc {
  ConnectSuccess = 'ConnectSuccess',
  ConnectFailure = 'ConnectFailure',
  ConnectConfirmationRequired = 'ConnectConfirmationRequired',
  Update = 'Update',
  Disconnect = 'Disconnect',
  AddressFound = 'AddressFound',
}

export interface EventDetails {
  address?: string
}

export interface EventBsc {
  type: EventTypeBsc
  details?: EventDetails
  walletApp?: WalletAppBsc  
}

@Injectable({
  providedIn: 'root'
})
export class BscService {
  provider = null
  signer = null
  private events: BehaviorSubject<EventBsc | null> = new BehaviorSubject(null)
  events$ = this.events.asObservable()
  

  constructor(
    private userService: UserService,
    private authService: AuthService,  
  ) { 
    const connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (connectedWallet) {
      this.events.next({
        type: EventTypeBsc.AddressFound,
        walletApp: connectedWallet.walletApp,
        details: { address: connectedWallet.address },
      })      
    }
    
    if (!!window.ethereum) window.ethereum.on('networkChanged', (networkId) => {
      if (networkId != environment.bsc.netId) {
        this.disconnect()
        window.location.reload() // it's safer to refresh the page
      }

    })      
    
    if (!!window.ethereum) window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts && accounts.length > 0) {
        const connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
        if (connectedWallet) {
          // update address only if already connected
          let newConnectedWallet = {
            walletApp: connectedWallet.walletApp,
            address: accounts[0],
          }
          localStorage.setItem(
            'connectedWallet',
            JSON.stringify(newConnectedWallet)
          )
          this.events.next({
            type: EventTypeBsc.Update,
            walletApp: newConnectedWallet.walletApp,
            details: { address: accounts[0] },
          })
          window.location.reload() // it's safer to refresh the page
        }
      } else {
        this.disconnect()
      }

    })      
    
  }
  
  async connect(app?: any): Promise<string> {
    // when we'll have multiple apps, we have to save app
    
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

    }
    
    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    try {
      this.signer = await this.provider.getSigner()
    } catch(err) {
      console.log(err)
      return 'Provider error'      
    }

    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    
    const address = await this.signer.getAddress();
    
    const details = { address };
    
    const walletApp = WalletAppBsc.MetaMask;
    
    // save bsc address into user profile on connection success, if changed
    const user = await this.authService.getCurrentUser()
    
    const bscValidator = new BscValidator(this, this.userService);
    
    if (user && user.bscAddress !== address) {
      
      // already has a different bsc address, ask for confirmation
      if (user.bscAddress) {
        this.events.next({
          type: EventTypeBsc.ConnectConfirmationRequired,
          walletApp,
          details,
        })
        return
      }       
      
    }
    
    if (await bscValidator.isUniqueAddress(address, user)) {
      // address unique and valid, update user data
      this.userService.updateUserProperty(user, 'bscAddress', address)
    } else {
      // address already used by another user
      this.events.next({
        type: EventTypeBsc.ConnectFailure,
        walletApp,
        details,
      })
      return
    }
    
    // success
    this.events.next({
      type: EventTypeBsc.ConnectSuccess,
      walletApp,
      details,
    })
    let connectedWallet: Object = {
      walletApp,
      address,
    }
    // update local storage
    localStorage.setItem(
      'connectedWallet',
      JSON.stringify(connectedWallet)
    )
      

    return ''
  }
  
  async getBalances() {
    let connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) await this.connect() // no wallet saved
        
    if (!this.provider) await this.connect() // we need to reconnect
        
    let balances = [];
    
    if (!this.provider) return balances // we weren't able to connect
    
    connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) return balances // we weren't able to save wallet
    const address = connectedWallet.address

    for (let token in environment.bsc.assets) {
      const tokenAddress = environment.bsc.assets[token]
      const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider)
      const name = await contract.name()
      const symbol = await contract.symbol()
      const balance = ethers.utils.formatUnits(await contract.balanceOf(address), CURRENCY.decimals)
      // BEP20 (ERC20) doesn't have frozen tokens
      balances.push({ address: tokenAddress, name, symbol, free: balance})
    }
    return balances
  }
  
  async confirmConnection(address, walletApp) {
    
    const details = { address };
    
    const user = await this.authService.getCurrentUser()

    if (!user) return;
    
    // address unique and valid, update user data (overwrite existig user bscAddress)
    this.userService.updateUserProperty(user, 'bscAddress', address)
    
    // success
    this.events.next({
      type: EventTypeBsc.ConnectSuccess,
      walletApp,
      details,
    })
    let connectedWallet: Object = {
      walletApp,
      address,
    }
    // update local storage
    localStorage.setItem(
      'connectedWallet',
      JSON.stringify(connectedWallet)
    )
    
    
  }  

  disconnect() {
    // forget
    localStorage.removeItem('connectedWallet')
    this.events.next({
      type: EventTypeBsc.Disconnect,
    }) 
    // metamask doesn't support disconnect, if other providers support it, insert here call to provider disconnect method
  }
  
  checkAddress(address) {
    return ethers.utils.isAddress(address)
  }
}

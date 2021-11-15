import WalletConnectProvider from "@walletconnect/web3-provider";

import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { BscValidator } from '@validator/bsc.validator'

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { ToastrService } from 'ngx-toastr'

import { environment } from '@env/environment'

// we need this until we'll have binance service
import { WalletApp } from '@service/binance.service'


const NETWORK_ID = environment.bsc.netId;
const CHAIN_ID = `0x${NETWORK_ID.toString(16)}`
const CHAIN_NAME = environment.bsc.chainName
const RPC_URLS = environment.bsc.rpcUrls
const BLOCK_EXPLORER_URLS = environment.bsc.blockExplorerUrls
const CURRENCY = { name: "BNB", symbol: "bnb", decimals: 18 }
const GAS = { decimals: 8 }
const PANCAKE_OUTPUT_DECIMALS =  environment.bsc.pancake.decimals; // todo verify why is 16 and not 18

import { ethers, providers  } from "ethers";
/*
  to support ethers 5.3.1, we needed to add "skipLibCheck" into tsconfig.json compilerOptions
  https://github.com/ethers-io/ethers.js/issues/776
  https://github.com/storybookjs/storybook/issues/9463
*/



declare var window: any; // we need to get metamask object from browser window




export enum BepChain {
  Binance = 'BEP2',
  SmartChain = 'BEP20'
}


export enum WalletAppBsc {
  MetaMask,
  WalletConnect
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

const pancakeRouterAbi = [
  // converts token value
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"

] 

const escrowAbi = [
  "function deposit (address asset, uint value, bytes32 JOBID) nonpayable",
  "function release (bytes32 JOBID) nonpayable"
];


@Injectable({
  providedIn: 'root'
})
export class BscService {
  provider = null
  signer = null
  private events: BehaviorSubject<EventBsc | null> = new BehaviorSubject(null)
  events$ = this.events.asObservable()
  private connectedWallet = null
  
  

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService,    
  ) {

    // todo move this to a common reusable function and replace everywhere
    const connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (connectedWallet) {
      this.events.next({
        type: EventTypeBsc.AddressFound,
        walletApp: connectedWallet.walletApp,
        details: { address: connectedWallet.address },
      })
      this.connectedWallet = { walletApp: connectedWallet.walletApp, address: connectedWallet.address }
    }
    

    // todo implement network and account change listen also on web3provider from walletconnet or web3modal
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
          this.connectedWallet = newConnectedWallet
          
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
    /*
    todo: when this is currently called without app, it's to try to refresh provider and signer
    we have to handle it also in walletConnect scenario
    */
    
    // when we'll have multiple apps, we have to save app
    let walletApp;
    
    if (app === WalletApp.MetaMask) {
      walletApp = WalletAppBsc.MetaMask;
      
      if (!window.ethereum) return 'MetaMask not found'
      
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any")
      
      
      
    } else  if (app === WalletApp.WalletConnectBsc) {
      /*
      todo review new walletConnect v2 changes
      https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/examples/react-app
      
      */
      walletApp = WalletAppBsc.WalletConnect;
      
      // walletConnect Trust supports only mainNet?
      let walletConnectParams = {
        chainId: environment.bsc.mainNetId,
        rpc: {}
      }
      walletConnectParams.rpc[environment.bsc.mainNetId] = environment.bsc.mainNetRpc;
      
      /* mainNet:
        {
          chainId: 56, // this is the key param and we don't need infuraId
          rpc: {
            56: 'https://bsc-dataseed.binance.org/'
          },
        }      
      */
      let walletConnectProvider = new WalletConnectProvider(walletConnectParams);
      
      if (!walletConnectProvider) return 'No WalletConnect Provider'
      
      await walletConnectProvider.enable();
      
      this.provider = new providers.Web3Provider(
        walletConnectProvider,
        { name:environment.bsc.mainNetChainName, chainId: environment.bsc.mainNetId}
      );  


    } else {
      console.log('Unknow bsc app: '+app);
      
      // todo get app from saved storage to go on
      return 'Unkwonw application'
    }
    

    if (!this.provider) return 'No Provider'

    
    
    let network = await this.provider.getNetwork()
    
    if (network.chainId !== NETWORK_ID) {
      
      try {
            
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
      } catch (err) {
        this.toastr.warning(this.errMsg(err), 'Please check and retry', { timeOut: 2000, })
        return 'Check MetaMask'
      }
      
      // update
      network = await this.provider.getNetwork()
      if (network.chainId !== NETWORK_ID) return "Wrong network"

    }
    
    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    
    try {
    
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    } catch (err) {
      this.toastr.warning(this.errMsg(err), 'Please check and retry', { timeOut: 2000, })
      return 'Check MetaMask'
    }
    
    try {
      this.signer = await this.provider.getSigner()
    } catch(err) {
      console.log(err)
      return 'Provider error'      
    }

    await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
    
    const address = await this.signer.getAddress();
    
    const details = { address };
    
    
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
        return "Verify address"
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
      return "Address in use"
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
    // update service status
    this.connectedWallet = connectedWallet
    
      

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
  
  async getBalance(token) {
    // get single token balance, for not blocking asset selectors
    let connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) await this.connect() // no wallet saved
        
    if (!this.provider) await this.connect() // we need to reconnect
        
    let result = {err: 'error retrieving balance', address: '', name: '', symbol: '', free: "-1", token};
    
    if (!this.provider) return result // we weren't able to connect
    
    connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) return result // we weren't able to save wallet
    const address = connectedWallet.address

    const tokenAddress = environment.bsc.assets[token]
    const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider)
    const name = await contract.name()
    const symbol = await contract.symbol()
    const balance = ethers.utils.formatUnits(await contract.balanceOf(address), CURRENCY.decimals)

    return ({ address: tokenAddress, name, symbol, free: balance, err: '', token})
  }  
  
  async getBusdValue(amountIn, tokenAddress) {
    /*
    Testnet faucet:
    https://testnet.binance.org/faucet-smart
    
    Original one:
    https://www.reddit.com/r/pancakeswap/comments/m1s3ki/pancakeswap_on_bsc_testnet/    
    https://testnet.bscscan.com/address/0xD99D1c33F9fC3444f8101754aBC46c52416550D1#readContract
    https://twitter.com/pancakeswap/status/1369547285160370182  
    
    Good liquidity:
    (from here: https://www.reddit.com/r/pancakeswap/comments/nwykvn/pancakeswap_instances_for_the_bsc_testnet/)
    router: https://testnet.bscscan.com/address/0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3
      i.e. 1000000000000000000, [0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd, 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee]
      ([wbnb, busd]
    ui: https://pancake.kiemtienonline360.com/#/swap
    */    
    
    try {
      const busdAddress = environment.bsc.pancake.busd;
      const pancakeRouterContract = new ethers.Contract(environment.bsc.pancake.router, pancakeRouterAbi, this.provider)
      const amountsOut = await pancakeRouterContract.getAmountsOut(
        ethers.utils.parseUnits(amountIn.toString(), CURRENCY.decimals),
        [tokenAddress, busdAddress]
      );
      const amountOut = ethers.utils.formatUnits(amountsOut[1], PANCAKE_OUTPUT_DECIMALS);
      return amountOut;
    } catch (e) {
      return -1;
    }
    return -1;
  }
  
  async estimateGasApprove(token, allowance) {
    
    try {
      await this.checkSigner()     

      const allowanceUint = ethers.utils.parseUnits(allowance.toString(), CURRENCY.decimals);
      const tokenAddress = environment.bsc.assets[token]
      
      const assetContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
      const gasApprove = await assetContract.estimateGas.approve(environment.bsc.escrow.address, allowanceUint);
      
      return ethers.utils.formatUnits(gasApprove, GAS.decimals);
      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error estimating gas needed to approve', { timeOut: 5000, })

      return "-1";

    }
  }
  
  async approve(token, allowance) {
    let approveResult = { err: '' };
    
    try {
      await this.checkSigner()

      const allowanceUint = ethers.utils.parseUnits(allowance.toString(), CURRENCY.decimals);
      const tokenAddress = environment.bsc.assets[token]
      
      const assetContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
      approveResult = await assetContract.approve(environment.bsc.escrow.address, allowanceUint);

      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error approving', { timeOut: 5000, })
      approveResult.err = this.errMsg(err)

    }
    
    return approveResult
  }  
  
  async estimateGasDeposit(token, amount, jobId, silent) {
    
    try {
      await this.checkSigner()
      
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31)

      const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);


      const amountUint = ethers.utils.parseUnits(amount.toString(), CURRENCY.decimals);      
      const tokenAddress = environment.bsc.assets[token]      
      const escrowContract = new ethers.Contract(environment.bsc.escrow.address, escrowAbi, this.signer);
      const gasDeposit = await escrowContract.estimateGas.deposit(tokenAddress, amountUint, jobIdBytes32);
      
      return ethers.utils.formatUnits(gasDeposit, GAS.decimals);
      
    } catch (err) {
      if (!silent) {
        console.log(err)
        this.toastr.warning(this.errMsg(err), 'Error estimating gas needed to deposit', { timeOut: 5000, })
      }
      return "-1";

    }
  }  
  
  async deposit(token, amount, jobId) {
    let depositResult = { err: '' };
    
    try {
      await this.checkSigner()
      
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31)
      const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);

      const amountUint = ethers.utils.parseUnits(amount.toString(), CURRENCY.decimals);      

      const tokenAddress = environment.bsc.assets[token]
      
      const escrowContract = new ethers.Contract(environment.bsc.escrow.address, escrowAbi, this.signer);

      depositResult = await escrowContract.deposit(tokenAddress, amountUint, jobIdBytes32);

      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error into deposit', { timeOut: 5000, })
      depositResult.err = this.errMsg(err)

    }
    
    return depositResult
  }    
  
  async release(jobId) {
    
    let releaseResult = { err: '' };  
    try {
      await this.checkSigner()
        
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31)
      const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);

      const escrowContract = new ethers.Contract(environment.bsc.escrow.address, escrowAbi, this.signer);

      releaseResult = await escrowContract.release(jobIdBytes32);
      
      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error into release', { timeOut: 5000, })
      releaseResult.err = this.errMsg(err)

    }
    
    return releaseResult
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
    
    // update service status
    this.connectedWallet = connectedWallet
    
    
  }  

  disconnect() {
    // forget
    localStorage.removeItem('connectedWallet')
    
    // update service status
    this.connectedWallet = null
    
    // propagate event
    this.events.next({
      type: EventTypeBsc.Disconnect,
    }) 
    // metamask doesn't support disconnect, if other providers support it, insert here call to provider disconnect method
  }
  
  checkAddress(address) {
    return ethers.utils.isAddress(address)
  }
  
  /*
  todo this should become a generic isBscConnected and
  check if we are connected by metamask or wallet connet (or in the future web3modal, binance wallet ..)
  */
  
  isMetamaskConnected(): boolean {
    if (!this.connectedWallet) return false;
    return this.connectedWallet.walletApp === WalletAppBsc.MetaMask
  }

  getAddress(): string {
    if (!this.connectedWallet) {
      return null
    }
    return this.connectedWallet.address
  }

  errMsg(err) {
    let errMsg = err.message || err.msg || err.code;
    if (err.data && err.data.message) errMsg = err.data.message;
    return errMsg;
  }
  
  async checkSigner() {
    if (!this.provider) this.provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    
    if (!this.signer) this.signer = await this.provider.getSigner()
    
  }
}

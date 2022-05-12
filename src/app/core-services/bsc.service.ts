import WalletConnectProvider from "@walletconnect/web3-provider"
/*
as seen into:
https://github.com/pancakeswap/pancake-frontend/blob/develop/src/utils/web3React.ts
which uses:
https://github.com/NoahZinsmeister/web3-react/blob/v6/packages/walletconnect-connector/src/index.ts
which uses:
https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/packages/ethereum-provider
*/

/*
todo: check if we are affected from this:
"Wallet Connect does not sign the message correctly unless you use their method"
https://github.com/pancakeswap/pancake-frontend/blob/04ec145fea63b9d0a07c30953adf657e51745f80/src/utils/web3React.ts#L45
*/


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
const JOBID_DECIMALS = 0;
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
  walletApp?: WalletApp
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

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
  "function approve(address _spender, uint _value) nonpayable returns (bool)",
  
  // token allowance
  "function allowance(address owner, address spender) external view returns (uint)"
  

];

const pancakeRouterAbi = [
  // converts token value
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
/*
  function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);

*/
  "function WETH() external pure returns (address)"
] 

const escrowAbi = [
  // "function deposit (address asset, uint value, bytes32 JOBID) nonpayable", // old contract
  "function depositBEP20 (address asset, address provider, uint value, uint JOBID, address[] memory swapPath) nonpayable",
/*
    function depositBEP20(address asset, address provider, uint value, uint JOBID, address[] memory swapPath)

*/
  "function depositBNB(address provider, uint JOBID) external payable",


  // "function release (bytes32 JOBID) nonpayable" // old contract
  "function releaseAsClient (uint JOBID) nonpayable"
];

/*
canwork escrow depositBEP20 (address[] memory) vs pancake getAmountsOut (address[] calldata)

Memory is for variables that are scoped to their function (ie a memory variable will only exist within the function it is created in. After that function has run, that variable will be deleted). Memory variables can be manipulated (I.e you can reassign the values as you need).

For functions you only need to specify the location for dynamic data types (like arrays and bytes). Variables created in a function are by default memory.

Calldata is almost the same as memory but you cannot manipulate (change) the variable. It's also a bit more gas efficient.

Use memory if you want to be able to manipulate the values and calldata when you don't.
*/


/*
  todo get uint for jobid for job
  todo add swappath
  mainnet
  https://bscscan.com/address/0xfcd04481c5176abdC00B2B182c2Eb35b7C79125f#code
*/

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
    

     
    
  }
  
  async connect(app?: any): Promise<string> {
    /*
    todo: when this is currently called without app, it tries to refresh provider and signer
    we have to handle it also in walletConnect scenario
    */
    if (!app) {
      if (localStorage.getItem('connectedWallet')) app = JSON.parse(localStorage.getItem('connectedWallet')).walletApp;
      console.log(app)
      if (!app) return 'Invalid config'
    }
    
    // we have multiple apps, we have to save app
    let walletApp, address;
    
    if (app === WalletApp.MetaMask) {
      walletApp = WalletApp.MetaMask; // to save in localStorage
      
      if (!window.ethereum) return 'MetaMask not found'
      
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any")
      
      if (!this.provider) return 'No Provider'
      
      let network = await this.provider.getNetwork()
      console.log(network)
      
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
      
      address = await this.signer.getAddress();
      
      
    // network and account change listen, safe way: if anything change, reload (address) or disconnect (network)
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
      
      
    } else  if (app === WalletApp.WalletConnectBsc) {
      /*
      todo review new walletConnect v2 changes
      https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/examples/react-app
      
      */
      walletApp = WalletApp.WalletConnectBsc;  // to save in localStorage
      
      // walletConnect Trust supports only mainNet

      let walletConnectParams = {
        chainId: environment.bsc.mainNetId,
        rpc: {}
      }
      
      walletConnectParams.rpc[environment.bsc.mainNetId] = environment.bsc.mainNetRpc;

      let walletConnectProvider = new WalletConnectProvider(walletConnectParams)
      if (!walletConnectProvider) return 'No WalletConnect Provider'
      /*
        // disconnect (cleanup) before reconnecting
        // this seems not needed
      
        try {
          walletConnectProvider.disconnect()
          console.log("walletConnectProvider.disconnect ok")
          
          walletConnectProvider = new WalletConnectProvider(walletConnectParams)
          console.log(walletConnectProvider)
        } catch(e) {
          console.log("walletConnectProvider.disconnect error")
          console.log(e)
        }

      */
      
      try {
        // try to enable provider, shows qr, catch errors
        await walletConnectProvider.enable();

        // connect web3Provider
        this.provider = new providers.Web3Provider(
          walletConnectProvider,
          { name: environment.bsc.mainNetChainName, chainId: environment.bsc.mainNetId}
        );


      } catch(err) {
        console.log(err)
        return (err.message || 'Provider error')
        
      }
           
      
      if (!this.provider) return 'No Provider'
      
      let network;
      try {
        network = await this.provider.getNetwork()
      } catch(err) {
        console.log(err)
        walletConnectProvider.disconnect()        
        return ('Please connect to Binance Smart Chain network')
        
      }

      if (network.chainId !== environment.bsc.mainNetId) return "Please connect to Binance Smart Chain network"
      

      await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
      
      try {
        this.signer = await this.provider.getSigner()
      } catch(err) {
        console.log(err)
        return 'Provider error'      
      }
      await new Promise(f => setTimeout(f, 100));  // sleep 100 ms 
      
      address = await this.signer.getAddress();
      

      // attach events to listen for disconnect, net change or account change, safe way, disconnect
      // Subscribe to accounts change
      walletConnectProvider.on("accountsChanged", (accounts) => {

        this.disconnect()
        console.log("walletConnectProvider accountsChanged event: "+ JSON.stringify(accounts));
      });

      // Subscribe to chainId change
      walletConnectProvider.on("chainChanged", (chainId) => {

        this.disconnect()
        console.log("walletConnectProvider chainChanged event: "+ chainId);

      });

      // Subscribe to session disconnection
      walletConnectProvider.on("disconnect", (code, reason) => {

        this.disconnectState()
        console.log(`walletConnectProvider disconnect event, code (${code}), reason (${reason})`);
        
      }); 


    } else {
      console.log('Unknow bsc app: '+app);
      
      // todo get app from saved storage to go on
      return 'Unknown application'
    }
    


    

    

    console.log(address);
    
    const details = { address };
    
    
    // save bsc address into user profile on connection success, if changed
    const user = await this.authService.getCurrentUser()
    
    const bscValidator = new BscValidator(this, this.userService);
    
    if (user && user.bscAddress !== address) {
      console.log('connect bsc address changed');
      
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
  
  async getBnbBalance() {
    let connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) await this.connect() // no wallet saved

    if (!this.provider) await this.connect()
    if (!this.provider) {
      // we weren't able to connect, invoke disconnect function to clean up to inform all components
      this.disconnect()    
      return -1;
    }      

    connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) return -1 // we weren't able to retrieve the saved wallet
    const address = connectedWallet.address
    let decimals = CURRENCY.decimals;
    try {

      const balance = ethers.utils.formatUnits(await this.provider.getBalance(address), decimals)
      
      return balance
      
    } catch(err) {
      console.log(`Error retrieving BNB balance of ${address}: ${this.errMsg(err)}`);
      console.log(err);
    }
    
    
    return -1

  }
  
  async getBalances() {
    let connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) await this.connect() // no wallet saved
        
    if (!this.provider) await this.connect() // we need to reconnect
        
    let balances = [];
    
    if (!this.provider) {
      // we weren't able to connect, invoke disconnect function to clean up to inform all components
      this.disconnect()    
      return [];
    }
    
    connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (!connectedWallet) return balances // we weren't able to retrieve the saved wallet
    const address = connectedWallet.address
    
    // add BNB
    balances.push({
      address: '', 
      name: 'BNB',
      symbol: 'BNB',
      free: await this.getBnbBalance()
    });

    for (let token in environment.bsc.assets) {
      let tokenAddress = 'na';
      try {
        tokenAddress = environment.bsc.assets[token]
        const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider)
        const name = await contract.name()
        const symbol = await contract.symbol()
        let decimals = CURRENCY.decimals;
        if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];
        
        const balance = ethers.utils.formatUnits(await contract.balanceOf(address), decimals)
        // BEP20 (ERC20) doesn't have frozen tokens
        balances.push({ address: tokenAddress, name, symbol, free: balance})
      } catch(err) {
        // make this function fail safe even if some contract is not correct or for another chain
        console.log(`Invalid contract for ${token}: ${tokenAddress}`);
        console.log(err);
      }
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
    let decimals = CURRENCY.decimals;
    if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];
    const balance = ethers.utils.formatUnits(await contract.balanceOf(address), decimals)

    return ({ address: tokenAddress, name, symbol, free: balance, err: '', token})
  }  
  
  async getEscrowAllowance(token) {
    try {
      
      let connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
      if (!connectedWallet) await this.connect() // no wallet saved

      if (!this.provider) await this.connect()
      if (!this.provider) {
        // we weren't able to connect, invoke disconnect function to clean up to inform all components
        this.disconnect()    
        return -1;
      }      

      connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
      if (!connectedWallet) return -1 // we weren't able to retrieve the saved wallet


      const ownerAddress = connectedWallet.address;

      
      const tokenAddress = environment.bsc.assets[token]
      const assetContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
      
      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;
      
      let decimals = CURRENCY.decimals;
      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];


      const allowance = await assetContract.allowance(ownerAddress, escrowAddress);

      
      return ethers.utils.formatUnits(allowance, decimals);
      
      
    
    } catch (e) {
      console.log('getEscrowAllowance error for token '+token+': '+this.errMsg(e)  );
      return -1;
    }    
  }
  
  async getCoingeckoQuotes() {
    let quoteListRaw = [
      'binancecoin',
      'binance-usd' // first two, always
    ]
    
    // retrieve other coins from env
    if (environment.bsc.hasOwnProperty("assetPaths")) for (let asset in environment.bsc.assetPaths) {
      if (environment.bsc.assetPaths.hasOwnProperty(asset)) {
        if (environment.bsc.assetPaths[asset].hasOwnProperty('coingecko')) quoteListRaw.push(environment.bsc.assetPaths[asset].coingecko);       
      }
    }
    // remove duplicates (i.e. binance-usd, that's always required)
    let quoteList = quoteListRaw.filter(function(item, pos) {
        return quoteListRaw.indexOf(item) == pos;
    })
    
    const quotesUrl = `${COINGECKO_API_URL}?ids=${quoteList.toString()}&vs_currencies=usd`
    console.log(quotesUrl);
    
    try {
      const coingeckoResponse = await (await fetch(quotesUrl)).json()
      if (coingeckoResponse && coingeckoResponse.error) throw new Error(coingeckoResponse.error)
      
      console.log(coingeckoResponse);
      
      let result = {}
      let busdValue = 1; // reference value, we'll convert result to this one 
      if (coingeckoResponse.hasOwnProperty('binance-usd')) busdValue = coingeckoResponse['binance-usd'].usd;
      // usd value of binance usd
      
      // map back found values to an useful hash
      for (let quote in coingeckoResponse) {
        if (coingeckoResponse.hasOwnProperty(quote)) {
          // search into env
          if (environment.bsc.hasOwnProperty("assetPaths")) for (let asset in environment.bsc.assetPaths) {
            if (environment.bsc.assetPaths.hasOwnProperty(asset)) {
              if (environment.bsc.assetPaths[asset].coingecko == quote) {
                result[asset] = coingeckoResponse[quote].usd / busdValue;
                break;
              }
            }
          }          
          
        }
      }
      
      console.log(result);  
      return result; // hash of busd values
      

    } catch (err) {
      this.toastr.warning(this.errMsg(err), 'Error retrieving quotes list', { timeOut: 5000, })
      console.log(err)
      console.log(`Quotes list error: ${this.errMsg(err)}`);

      return {};

    }

    
  }

  async getBusdValue(amountIn, token) {
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
      
      let busdAddress = environment.bsc.pancake.busd;

      let tokenAddress;

      let pancakeRouterAddress = environment.bsc.pancake.router;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) {
        busdAddress = environment.bsc.pancake.mainNetBusd;
        pancakeRouterAddress = environment.bsc.pancake.mainNetRouter;
      }
      const pancakeRouterContract = new ethers.Contract(pancakeRouterAddress, pancakeRouterAbi, this.provider)
      let decimals = CURRENCY.decimals;
      if (token == 'BNB') {
        /* 
          let's consider as wBnb to permit busd conversion
          we get official wbnb address from pancake router WETH function
        */
        const wBnbAddress = await pancakeRouterContract.WETH();
        tokenAddress = wBnbAddress; 
        
      } else {

        tokenAddress = environment.bsc.assets[token];
        if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];
        
      }
      
      
      if (tokenAddress.toLowerCase() == busdAddress.toLowerCase()) {
        console.log('busd same token address' );
        
        return amountIn;
      }
      

      /*
      TODO
      perhaps here we should use same path used from escrow (pathAddresses from config)
      */
      const amountsOut = await pancakeRouterContract.getAmountsOut(
        ethers.utils.parseUnits(amountIn.toString(), decimals),
        [tokenAddress, busdAddress]
      );
      const amountOut = ethers.utils.formatUnits(amountsOut[1], PANCAKE_OUTPUT_DECIMALS);
      return amountOut;
    } catch (e) {
      console.log('Busd estimate error: '+this.errMsg(e)  );
      return -1;
    }
    return -1;
  }
  
  async estimateGasApprove(token, allowance) {
    
    try {
      await this.checkSigner() 

      let decimals = CURRENCY.decimals;
      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];
      

      const truncatedAllowance = allowance.toFixed(decimals); // this is already a string
      /*
      this is needed to avoid to have more decimals then supported, and avoid this error:
      "fractional component exceeds decimals"
      */

      const allowanceUint = ethers.utils.parseUnits(truncatedAllowance, decimals);
      const tokenAddress = environment.bsc.assets[token]

      
      const assetContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;
      const gasApprove = await assetContract.estimateGas.approve(escrowAddress, allowanceUint);

      
      return ethers.utils.formatUnits(gasApprove, GAS.decimals);
      
    } catch (err) {
      this.toastr.warning(this.errMsg(err), 'Error estimating gas needed to approve '+token, { timeOut: 5000, })
      console.log(err)
      console.log(`estimateGasApprove ${token} error: ${this.errMsg(err)}`);

      return "-1";

    }
  }
  
  async approve(token, allowance) {
    let approveResult = { err: '' };
    
    try {
      await this.checkSigner()
      
      let decimals = CURRENCY.decimals;
      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];
      
      const truncatedAllowance = allowance.toFixed(decimals); // this is already a string

      const allowanceUint = ethers.utils.parseUnits(truncatedAllowance, decimals);
      const tokenAddress = environment.bsc.assets[token]
      
      const assetContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;
      
      const transaction = await assetContract.approve(escrowAddress, allowanceUint);
      /*
        {
            "hash": "0xaaf44b5e674733871f0314fa02562553ef7b26e6c79e4232d881849aa93a1f9f",
            "type": 0,
            "accessList": null,
            "blockHash": null,
            "blockNumber": null,
            "transactionIndex": null,
            "confirmations": 0,
            "from": "0x606627e26d860A8A9d773b50F4B4F553cfcC6335",
            "gasPrice": {
                "type": "BigNumber",
                "hex": "0x012a05f200"
            },
            "gasLimit": {
                "type": "BigNumber",
                "hex": "0x71ca"
            },
            "to": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            "value": {
                "type": "BigNumber",
                "hex": "0x00"
            },
            "nonce": 425,
            "data": "0x095ea7b3000000000000000000000000fcd04481c5176abdc00b2b182c2eb35b7c79125f000000000000000000000000000000000000000000000000002b8559d087111d",
            "r": "0xa98186258ceab4f82bee3446dfed8cbcdda9f2307b1af876530cca645488e65e",
            "s": "0x44660a5e36022b75a44c03cd93c860783811b6baa44006f6e41f4bfb1ad60c22",
            "v": 148,
            "creates": null,
            "chainId": 56
        }      
      */
      const receipt = await transaction.wait();
      // todo perhaps we can save this receipt or tx number to db  and add a timeout
      
      /*
      {
          "to": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
          "from": "0x606627e26d860A8A9d773b50F4B4F553cfcC6335",
          "contractAddress": null,
          "transactionIndex": 79,
          "gasUsed": {
              "type": "BigNumber",
              "hex": "0x71ca"
          },
          "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000020000000000000000020000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000002000020000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000400000000000000000000000000000010000000000000000000000000000000000008000000001000000000000000",
          "blockHash": "0xc022400e0009e6b05f160ed8e7dc65aac7cea96a5e2337caf5625c2ea2a29934",
          "transactionHash": "0x2fe8fb21a56438da52c9e1d110c63e6c599b793107c30fbea3e2619956fa7fda",
          "logs": [
              {
                  "transactionIndex": 79,
                  "blockNumber": 16938016,
                  "transactionHash": "0x2fe8fb21a56438da52c9e1d110c63e6c599b793107c30fbea3e2619956fa7fda",
                  "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                  "topics": [
                      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                      "0x000000000000000000000000606627e26d860a8a9d773b50f4b4f553cfcc6335",
                      "0x000000000000000000000000fcd04481c5176abdc00b2b182c2eb35b7c79125f"
                  ],
                  "data": "0x000000000000000000000000000000000000000000000000002b7f80759e2c1a",
                  "logIndex": 227,
                  "blockHash": "0xc022400e0009e6b05f160ed8e7dc65aac7cea96a5e2337caf5625c2ea2a29934"
              }
          ],
          "blockNumber": 16938016,
          "confirmations": 4,
          "cumulativeGasUsed": {
              "type": "BigNumber",
              "hex": "0x8f64de"
          },
          "status": 1,
          "byzantium": true,
          "events": [
              {
                  "transactionIndex": 79,
                  "blockNumber": 16938016,
                  "transactionHash": "0x2fe8fb21a56438da52c9e1d110c63e6c599b793107c30fbea3e2619956fa7fda",
                  "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
                  "topics": [
                      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                      "0x000000000000000000000000606627e26d860a8a9d773b50f4b4f553cfcc6335",
                      "0x000000000000000000000000fcd04481c5176abdc00b2b182c2eb35b7c79125f"
                  ],
                  "data": "0x000000000000000000000000000000000000000000000000002b7f80759e2c1a",
                  "logIndex": 227,
                  "blockHash": "0xc022400e0009e6b05f160ed8e7dc65aac7cea96a5e2337caf5625c2ea2a29934"
              }
          ]
      }      
      */
      
      // success, nothing to add to result
      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error approving '+token, { timeOut: 5000, })
      approveResult.err = this.errMsg(err)
      console.log(`approve ${token} error: ${this.errMsg(err)}`);
      

    }
    
    return approveResult
  }  
  
  //async estimateGasDeposit(token, amount, jobId, silent) {
  async estimateGasDeposit(token, providerAddress, amount, jobId, silent) {
    console.log('estimateGasDeposit', token, providerAddress, amount, jobId, silent); // debug
    try {
      await this.checkSigner()
      
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31)

      //const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);
      const jobIdBigint = this.hexToBigint(strippedJobId); // this is already a string

      let decimals = CURRENCY.decimals;
      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];

      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];

      const truncatedAmount = amount.toFixed(decimals); // this is already a string

      const amountUint = ethers.utils.parseUnits(truncatedAmount, decimals);
      const jobIdUint = ethers.utils.parseUnits(jobIdBigint, JOBID_DECIMALS);

      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;

      
      const escrowContract = new ethers.Contract(escrowAddress, escrowAbi, this.signer);

      let pathAssets = [token, 'BUSD'];  // default

      let gasDeposit;
      if (token == 'BNB') {
        /*
        value is passed as an override
        https://docs.ethers.io/v5/api/contract/contract/#contract-estimateGas        
        */
        gasDeposit = await escrowContract.estimateGas.depositBNB(providerAddress, jobIdUint, {value: amountUint});
        console.log('gasDeposit '+token+': '+ ethers.utils.formatUnits(gasDeposit, 0));
      } else {
      
        const tokenAddress = environment.bsc.assets[token]

        let path = [tokenAddress, environment.bsc.pancake.busd]; // default
        /* 
        todo verify how to handle BUSD, cause path should be at least lenght 2
        https://github.com/merlin-the-best/merlin-contract/blob/master/PancakeRouter.sol#L311      
        */
        // unless we have an explicit path mapped into config:
        if (environment.bsc.hasOwnProperty("assetPaths") && environment.bsc.assetPaths.hasOwnProperty(token)) {
          path = this.splitConfig(environment.bsc.assetPaths[token].pathAddresses);
          pathAssets = this.splitConfig(environment.bsc.assetPaths[token].pathAssets);
        }
        
        gasDeposit = await escrowContract.estimateGas.depositBEP20(tokenAddress, providerAddress, amountUint, jobIdUint, path);
        console.log('gasDeposit bep20 '+token+': '+ ethers.utils.formatUnits(gasDeposit, 0));
      
      }
      
      return { gasDeposit: ethers.utils.formatUnits(gasDeposit, GAS.decimals), pathAssets}
      
    } catch (err) {
      console.log(`estimateGasDeposit ${token} error: ${this.errMsg(err)}`);
      if (!silent) {
        console.log(err)
        this.toastr.warning(this.errMsg(err), 'Error estimating gas needed to deposit '+token, { timeOut: 5000, })
      }
      return { gasDeposit: "-1"};

    }
  }  
  
  async deposit(token, providerAddress, amount, jobId) {
    console.log('deposit', token, providerAddress, amount, jobId); // debug
    
    let depositResult = { err: '' };
    
    try {
      await this.checkSigner()
      
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31)
      

      
      let decimals = CURRENCY.decimals;
      if (environment.bsc.assetsDecimals && environment.bsc.assetsDecimals[token]) decimals = environment.bsc.assetsDecimals[token];

      //const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);
      const jobIdBigint = this.hexToBigint(strippedJobId); // this is already a string
      
      //const jobIdUint = this.hexToBigint(strippedJobId);
      const jobIdUint = ethers.utils.parseUnits(jobIdBigint, JOBID_DECIMALS);      

      
      const truncatedAmount = amount.toFixed(decimals); // this is already a string      
      const amountUint = ethers.utils.parseUnits(truncatedAmount, decimals); 

      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;
      
      
      const escrowContract = new ethers.Contract(escrowAddress, escrowAbi, this.signer);
      
      let transaction;

      if (token == 'BNB') {
        /*
        value is passed as an override    
        */
        /*
        we have to increase default gas estimated to avoid out of gas
        empirically let's mutiply it
        */
        const GAS_MULTIPLY_FACTOR = 2;
        
        let estimatedGasDeposit = parseInt(ethers.utils.formatUnits( (await escrowContract.estimateGas.depositBNB(providerAddress, jobIdUint, {value: amountUint}) ), 0) );
        let suggestedGasDeposit = estimatedGasDeposit * GAS_MULTIPLY_FACTOR;
        console.log('deposit estimatedGasDeposit '+token+': '+ estimatedGasDeposit + ', suggestedGasDeposit: '+suggestedGasDeposit);
        
        
        transaction = await escrowContract.depositBNB(providerAddress, jobIdUint, {value: amountUint, gasLimit: suggestedGasDeposit});
      
      } else {

        const tokenAddress = environment.bsc.assets[token]

        let path = [tokenAddress, environment.bsc.pancake.busd]; // default
        // unless we have an explicit path mapped into config:
        if (environment.bsc.hasOwnProperty("assetPaths") && environment.bsc.assetPaths.hasOwnProperty("token")) {
          path = this.splitConfig(environment.bsc.assetPaths[token].pathAddresses);        
        }

        transaction = await escrowContract.depositBEP20(tokenAddress, providerAddress, amountUint, jobIdUint, path);
      
      }
      // wait for transaction confirm
      const receipt = await transaction.wait();
      // todo perhaps we can save this receipt or tx number to db and add a timeout

      // success, nothing to add to result

      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error into deposit '+token, { timeOut: 5000, })
      depositResult.err = this.errMsg(err)
      console.log(`deposit ${token} error: ${this.errMsg(err)}`);

    }
    
    return depositResult
  }    
  
  async release(jobId) {
    
    let releaseResult = { err: '' };  
    try {
      await this.checkSigner()
        
      let strippedJobId = jobId.replace(/-/g, "");
      if (strippedJobId.length >= 32) strippedJobId = strippedJobId.substr(0, 31);
      
      //const jobIdBytes32 = ethers.utils.formatBytes32String(strippedJobId);
      const jobIdBigint = this.hexToBigint(strippedJobId); // this is already a string
      
      
      //const jobIdUint = this.hexToBigint(strippedJobId);
      const jobIdUint = ethers.utils.parseUnits(jobIdBigint, JOBID_DECIMALS);      
    
      let escrowAddress = environment.bsc.escrow.address;
      if (this.getCurrentApp() === WalletApp.WalletConnectBsc) escrowAddress = environment.bsc.escrow.mainNetAddress;
    

      const escrowContract = new ethers.Contract(escrowAddress, escrowAbi, this.signer);

      const transaction = await escrowContract.releaseAsClient(jobIdUint);
      
      // wait for transaction confirm
      const receipt = await transaction.wait();
      // todo perhaps we can save this receipt or tx number to db and add a timeout

      // success, nothing to add to result
      
      
    } catch (err) {
      console.log(err)
      this.toastr.warning(this.errMsg(err), 'Error into release ', { timeOut: 5000, })
      releaseResult.err = this.errMsg(err)
      console.log(`release ${jobId} error: ${this.errMsg(err)}`);

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

  getCurrentApp() {
    let app = null;
    if (localStorage.getItem('connectedWallet')) app = JSON.parse(localStorage.getItem('connectedWallet')).walletApp;
    return app;
  }

  disconnect() {
    let app = null;
    if (localStorage.getItem('connectedWallet')) app = JSON.parse(localStorage.getItem('connectedWallet')).walletApp;
    if (app === WalletApp.WalletConnectBsc) {
        
        
      try {
        
        let walletConnectParams = {
          chainId: environment.bsc.mainNetId,
          rpc: {}
        }
        walletConnectParams.rpc[environment.bsc.mainNetId] = environment.bsc.mainNetRpc;
        let walletConnectProvider = new WalletConnectProvider(walletConnectParams)
        if (walletConnectProvider) {

  
          walletConnectProvider.disconnect()
          console.log('WalletConnectBsc disconnect ok')
        }
      
      } catch (e) {
        console.log('cannot create walletConnectProvider instance')
        console.log(e)
        
      }
      
    }
    
    // metamask doesn't support disconnect in current status, if other providers support it like walletConnect, insert here call to provider disconnect method
  
  
    this.disconnectState();
    
  
  }
  
  disconnectState() {
    // forget
    localStorage.removeItem('connectedWallet')
    
    // update service status
    this.connectedWallet = null
    
    // propagate event
    this.events.next({
      type: EventTypeBsc.Disconnect,
    }) 
    
  }
  
  checkAddress(address) {
    return ethers.utils.isAddress(address)
  }
  
  
  async isBscConnected() {
    if (!this.connectedWallet) return false; // not connected
    
    // connected, check if address is changed    
    const user = await this.authService.getCurrentUser()
    if (user && user.bscAddress !== this.connectedWallet.address) {
      console.log('isBscConnected address changed')
      return false;
    }
    
    
    
    return true;    
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
  
  
  /*
    helper function to use uint jobid
  */
  hexToBigint(s) {

    function add(xI, yI) {
        let c = 0, r = [];
        let x = xI.split('').map(Number);
        let y = yI.split('').map(Number);
        while(x.length || y.length) {
            let s = (x.pop() || 0) + (y.pop() || 0) + c;
            r.unshift(s < 10 ? s : s - 10); 
            c = s < 10 ? 0 : 1;
        }
        if(c) r.unshift(c);
        return r.join('');
    }

    let dec = '0';
    s.split('').forEach(function(chr) {
        let n = parseInt(chr, 16);
        for(let t = 8; t; t >>= 1) {
            dec = add(dec, dec);
            if(n & t) dec = add(dec, '1');
        }
    });
    return dec;

  }
  
  splitConfig(str) {
    // extract array from config properties and trim values to avoid ens error
    return str.split(",").map(s => s.trim())
    
  }
  

  
}

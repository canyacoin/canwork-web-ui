import { Injectable } from '@angular/core';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class BscService {

  constructor() { }
  
  async connect(app: any): Promise<void> {
    if (!window.ethereum) return console.log("MetaMask not found");
    console.log("MetaMask found");
    
    // todo inject ethers, get web3 provider

    return;
  }  
}

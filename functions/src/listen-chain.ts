/*
no dependency on web3 libs (this is segregated to an external chain monitor service)
*/


import { GenerateGuid } from './generate.uid'

import { bep20TxProcess } from './bep20-process'

const SUPPORTED_METHODS = ['depositBEP20', 'depositBNB'];


/*
how to test this function:
https://firebase.google.com/docs/functions/local-shell#invoke_https_functions
  send POST request with form data and authorization 
  listenToChainUpdates({method:'post',url:'/',headers:{authorization:env.chainmonitor.authkey}}).form( {method: '..', data: {}, .. })
 */

export async function listenToChainUpdates(request, response, db, env) {
  /*
  expected method POST
  expected path /
  expected body:
  {
    hash, (tx hash)
    from, (sender address)
    address, (escrow address)
    method, (smart contract method) supported: ['depositBEP20', 'depositBNB']
    data (smart contract data):
    { // example for depositBEP20 method
      asset: token address,
      provider: provider address,
      value: big int amount,
      JOBID: big int job id ,
      swapPath: address array
    }  
    { // example for depositBNB method
      provider: provider address,
      JOBID: big int job id ,
    }      
  }
  + headers.authorization
  */  
  if (request.method !== 'POST') {
    return response
      .status(405)
      .type('application/json')
      .send({ message: 'Method Not Allowed' })
  }
  if (request.path !== '/') {
    return response
      .status(405)
      .type('application/json')
      .send({ message: 'Path Not Allowed' })
  }
  if (
    !request.headers.authorization ||
    !env.chainmonitor ||
    !env.chainmonitor.authkey ||
    request.headers.authorization !== env.chainmonitor.authkey
  ) {
    return response.status(403).send('Unauthorized')
  }  

  const body = request.body;
  // check mandatory params
  if (
    !body.hasOwnProperty('hash') ||
    !body.hasOwnProperty('from') ||
    !body.hasOwnProperty('address') ||
    !body.hasOwnProperty('method') ||
    !body.hasOwnProperty('data')      
  ) {
    console.log('Missing params');
    console.log(body);
  
    return response.status(405).send('Invalid')
    
  }
  
  const smartMethod = body.method;
  
  // now check parameter method specific and method
  if (SUPPORTED_METHODS.indexOf(smartMethod) === -1) {
    console.log('Invalid method');
    console.log(body);
  
    return response.status(405).send('Not valid')
    
  }
  
  // now check method and handle specific mandatory params and actions
  const smartData = body.data;
  
  if (smartMethod === 'depositBEP20') {
    // deposit to escrow from client
  
    if (
      !smartData.hasOwnProperty('asset') ||
      !smartData.hasOwnProperty('provider') ||
      !smartData.hasOwnProperty('value') ||
      !smartData.hasOwnProperty('JOBID') ||
      !smartData.hasOwnProperty('swapPath')      
    ) {
      console.log('Missing smart contract data');
      console.log(smartData);
    
      return response.status(405).send('Missing data')
      
    }


    // evertyhing is good, create record
    const monitorCollection = db.collection('bep20-txs');
    
    
    // generate back uuid from bigint jobId (reverse generate.uid)
    
    const jobIdBigInt = smartData.JOBID;
    
    const jobIdHex = bigint2hexUuid(jobIdBigInt);
    
    // add back stripped minus    
    const jobId = `${jobIdHex.substr(0,8)}-${jobIdHex.substr(8,4)}-${jobIdHex.substr(12,4)}-${jobIdHex.substr(16,4)}-${jobIdHex.substr(20,12)}`;
    
    const amount = smartData.value; // big int string
    const escrowAddress = body.address; // the to of transaction (interacted address)
    const tokenAddress = smartData.asset; // the asset sent to escrow
    let token = 'token'; // safe default    
    Object.keys(env.chainmonitor.bsctokens).forEach((tokenName) => {
      const address = env.chainmonitor.bsctokens[tokenName]; 
      if (address.toLowerCase() === tokenAddress.toLowerCase()) token = tokenName; // map address to token name
    });

    const providerAddress = smartData.provider; // the provider address
    const hash = body.hash; // transaction hash
    const from = body.from;
    const to = body.address; // transaction to
    const action = 'deposit';
    
    const transaction = {
      id: GenerateGuid(),
      timestamp: Date.now(),
      jobId,
      // userId,  // (firestore id) this is not mandatory for bep20-monitor
      // providerId, // (firestore id) this is not mandatory for bep20-monitor
      amount,
      escrowAddress,
      token,
      tokenAddress,
      providerAddress,
      hash,
      from,
      to,
      action,
      status: 'created' // later it will become 'processed' or 'checked' (if already valid) or 'error'
      //backend will add processedTimestamp
    }    
    
    /* 
    only logged in userId can create this tx, this is security rule:
    
    // bep20 monitor old rule
    match /bep20-txs/{transactionId} {
       allow read: if isAdmin();
       allow create: if request.auth.uid == request.resource.data.userId;
       allow update: if isAdmin();
       allow delete: if isAdmin();
    }

    // bep20 monitor new rule (not added for now, cause frontend doesn't create records anymore
    // Added ALSO POSSIBILITY FOR ADMIN (firestore function) TO CREATE THIS RECORD
    match /bep20-txs/{transactionId} {
       allow read: if isAdmin();
       allow create: if request.auth.uid == request.resource.data.userId;
       allow update: if isAdmin();
       allow delete: if isAdmin();
    }
          
    */
    await monitorCollection.doc(transaction.id).set(transaction);
    
    
    // invoke processing function (refactored from bep20-monitor and made
    // a shared function, to process it instantly
    // otherwise it will caught up from periodic schedule
    await bep20TxProcess(db, transaction);
    
    console.log(`Created and processed tx ${transaction.id}, job ${jobId}`);          
    
    
  } else if (smartMethod === 'depositBNB') {
    // deposit to escrow from client
  
    if (
      !smartData.hasOwnProperty('provider') ||
      !smartData.hasOwnProperty('JOBID')
    ) {
      console.log('Missing smart contract data');
      console.log(smartData);
    
      return response.status(405).send('Missing data')
      
    } 
    const monitorCollection = db.collection('bep20-txs');

    const jobIdBigInt = smartData.JOBID;
    const jobIdHex = bigint2hexUuid(jobIdBigInt);
    const jobId = `${jobIdHex.substr(0,8)}-${jobIdHex.substr(8,4)}-${jobIdHex.substr(12,4)}-${jobIdHex.substr(16,4)}-${jobIdHex.substr(20,12)}`;
    
    const amount = 0; // todo add to data passed into body from chain monitor, this is not mandatory
    const escrowAddress = body.address; // the to of transaction (interacted address)
    const tokenAddress = 'BNB'; // the asset sent to escrow
    const token = 'BNB'; // static  
    const providerAddress = smartData.provider; // the provider address
    const hash = body.hash; // transaction hash
    const from = body.from;
    const to = body.address; // transaction to
    const action = 'deposit';
    
    const transaction = {
      id: GenerateGuid(),
      timestamp: Date.now(),
      jobId,
      // userId,  // (firestore id) this is not mandatory for bep20-monitor
      // providerId, // (firestore id) this is not mandatory for bep20-monitor
      amount,
      escrowAddress,
      token,
      tokenAddress,
      providerAddress,
      hash,
      from,
      to,
      action,
      status: 'created' // later it will become 'processed' or 'checked' (if already valid) or 'error'
      //backend will add processedTimestamp
    }    
    

    await monitorCollection.doc(transaction.id).set(transaction);

    await bep20TxProcess(db, transaction);
    
    console.log(`Created and processed tx ${transaction.id}, job ${jobId}`);        
  
  } else {
    console.log('Method not implemented');
    console.log(body);
    return response.status(405).send('Not implemented')
    
  }

  // final response
  return response
    .status(200)
    .type('application/json')
    .send({ status: 'ok' })
}

/* helpers */
function bigint2hexUuid(str){ // .toString(16) only works up to 2^53
    const dec = str.toString().split('');
    const sum = [];
    const hex = [];
    let i, s;
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('').padStart(32, '0')
}
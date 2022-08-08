export function bep20TxMonitor(db) {
  return async () => {
  
    console.log(`bep20TxMonitor start`); // debug
    
    /*
    frontend provides these info:
    
    let transaction = {
      id: GenerateGuid(),
      timestamp: Date.now(),
      jobId,
      userId,
      providerId,
      amount,
      escrowAddress,
      token,
      tokenAddress,
      providerAddress,
      hash,
      from,
      to,
      action,
      status: 'created' 
      // later it will become here 'processed' (if some action was needed)
                                or 'checked' (if already valid) 
                                or 'error' (we'll add errorMessage)
      // here we will add processedTimestamp
    }    
    
    */
    
    const txsCollection = db.collection('bep20-txs');
    
    
    const txsCollectionSearch = txsCollection.where('status', '==', 'created');
    const txsSnapshot = await txsCollectionSearch.get();  
    
    let processed = 0;
    
    if (!txsSnapshot.empty) {
      
      txsSnapshot.forEach((doc) => {
        const tx = doc.data();
        
        let newStatus = 'unknown'; // if we can't update this, something went really wrong
        let errorMessage = '';
        
        try {
          // check if it's an action we support
          if (tx.action == 'deposit') {
            /*
            check if tx is confirmed on chain
            */
            
            
            /*
            deposit action, job should be in state ...
            */
            
            
            
          
          } else {
          
            errorMessage = `Unsupported action ${tx.action}`;
            console.log(`Error tx ${tx.id}: ${errorMessage}`);
          
          }
          
          
        } catch (err) {
          errorMessage = err.toString();
          console.log(`Error tx ${tx.id}: ${errorMessage}`);
          console.log(err);
        }
        
        /* update values */
        tx.processedTimestamp = Date.now();
        tx.status = newStatus;
        if (errorMessage) tx.errorMessage = errorMessage;
        
        /* save into firestore */
        txsCollection.doc(tx.id).set(tx);
        
        processed++;
      });
    }

    console.log(`Processed ${processed} bep20 txs`); // debug

    return null;
  }
}

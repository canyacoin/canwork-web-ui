import { bep20TxProcess } from './bep20-process'


export function bep20TxMonitor(db) {
  return async () => {
  
    const txsCollection = db.collection('bep20-txs');    
    
    const txsCollectionSearch = txsCollection.where('status', '==', 'created');
    const txsSnapshot = await txsCollectionSearch.get();  
    
    let processed = 0;
    
    if (!txsSnapshot.empty) {
      
      for (const doc of txsSnapshot.docs) {
      
        const tx = doc.data();
        
        await bep20TxProcess(db, tx);
        
        processed++;
      }
    }

    if (processed > 0) console.log(`Processed ${processed} bep20 txs`);

    return null;
  }
}

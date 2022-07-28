export function bep20TxMonitor(db) {
  return async () => {
  
    console.log(`bep20TxMonitor start`); // debug
    
    const txsCollection = db.collection('bep20-txs');
    const txsSnapshot = await txsCollection.get();  
    if (!txsSnapshot.empty) {
      let processed = 0;
      txsSnapshot.forEach((doc) => {
        const obj = doc.data();
        processed++;
      });
      console.log(`Processed ${processed} bep20 txs`);
    }

    return null;
  }
}

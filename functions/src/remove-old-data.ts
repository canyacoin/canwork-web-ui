import {
  Firestore,
  DocumentReference,
  QuerySnapshot,
} from '@google-cloud/firestore'

function getRefsFromSnapshot(snap: QuerySnapshot): DocumentReference[] {
  return snap.docs.reduce((acc, { ref }) => {
    acc.push(ref)
    return acc
  }, [])
}

const delta = 365 * 24 * 60 * 60 * 1000
export async function prepareJobRefs(
  db: Firestore,
  collection: string,
  timestamp = Date.now() - delta,
  limit = 500
) {
  const jobsSnap = await db
    .collection(collection)
    .where('createAt', '<', timestamp)
    .limit(limit)
    .get()

  return getRefsFromSnapshot(jobsSnap)
}

export function removeRefs(db: Firestore, refs: DocumentReference[]) {
  const batch = db.batch()
  refs.forEach(ref => batch.delete(ref))
  return batch.commit()
}

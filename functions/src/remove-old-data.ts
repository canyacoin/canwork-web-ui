import {
  Firestore,
  DocumentReference,
  QuerySnapshot,
} from '@google-cloud/firestore'
import { EventContext } from 'firebase-functions'
import { storage } from 'firebase-admin'

export const BATCH_LIMIT = 500

export function getRefsFromSnapshot(snap: QuerySnapshot): DocumentReference[] {
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
  limit = BATCH_LIMIT
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

export async function removePublicJobBids(
  db: Firestore,
  snap: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { jobId } = context.params
  const bidsSnap = await db
    .collection('public-jobs')
    .doc(jobId)
    .collection('bids')
    .limit(BATCH_LIMIT)
    .get()

  const refs = getRefsFromSnapshot(bidsSnap)
  if (refs.length) {
    await removeRefs(db, refs)
    // recursive remove bids
    removePublicJobBids(db, snap, context)
  }
}

export function removeJobAttachments(
  storage: storage.Storage,
  _snap: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { jobId } = context.params
  const bucket = storage.bucket()
  return bucket.deleteFiles({ prefix: `uploads/jobs/${jobId}` })
}

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

const delta = 12 * 30 * 24 * 60 * 60 * 1000
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

export function batchRemoveRefs(db: Firestore, refs: DocumentReference[]) {
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
    await batchRemoveRefs(db, refs)
    // recursive remove bids
    removePublicJobBids(db, snap, context)
  }
}

export async function removePublicJobInvites(
  db: Firestore,
  snap: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { jobId } = context.params
  const bidsSnap = await db
    .collection('public-jobs')
    .doc(jobId)
    .collection('invites')
    .limit(BATCH_LIMIT)
    .get()

  const refs = getRefsFromSnapshot(bidsSnap)
  if (refs.length) {
    await batchRemoveRefs(db, refs)
    // recursive remove invites
    removePublicJobInvites(db, snap, context)
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

export async function removeJobs(
  db: Firestore,
  _snap: FirebaseFirestore.DocumentSnapshot,
  _context: EventContext
) {
  // remove jobs
  const jobRefs = await prepareJobRefs(db, 'jobs')
  if (jobRefs.length) {
    batchRemoveRefs(db, jobRefs)
  }

  // remove public jobs
  const publicJobRefs = await prepareJobRefs(db, 'public-jobs')
  if (publicJobRefs.length) {
    batchRemoveRefs(db, publicJobRefs)
  }
}

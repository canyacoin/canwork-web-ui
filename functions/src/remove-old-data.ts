import {
  Firestore,
  DocumentReference,
  QuerySnapshot,
} from '@google-cloud/firestore'
import { EventContext } from 'firebase-functions'
import { storage } from 'firebase-admin'

export const DEFAULT_LIMIT = 500

// prod delta 12 months
// const DEFAULT_DELTA = 12 * 30 * 24 * 60 * 60 * 1000

// test delta 4 months
const DEFAULT_DELTA = 4 * 30 * 24 * 60 * 60 * 1000

const jobsOpts = {
  delta: DEFAULT_DELTA,
  limit: DEFAULT_LIMIT,
}

export function getRefsFromSnapshot(snap: QuerySnapshot): DocumentReference[] {
  return snap.docs.reduce((acc, { ref }) => {
    acc.push(ref)
    return acc
  }, [])
}

export async function prepareJobRefs(
  db: Firestore,
  collection: string,
  opts = jobsOpts
) {
  const { delta, limit } = Object.assign({}, jobsOpts, opts)
  const timestamp = Date.now() - delta

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

export function removePublicJobBids(db: Firestore, limit = DEFAULT_LIMIT) {
  return async function fn(
    snap: FirebaseFirestore.DocumentSnapshot,
    context: EventContext
  ) {
    const { jobId } = context.params
    const bidsSnap = await db
      .collection('public-jobs')
      .doc(jobId)
      .collection('bids')
      .limit(limit)
      .get()

    const refs = getRefsFromSnapshot(bidsSnap)
    if (refs.length) {
      await batchRemoveRefs(db, refs)
      // recursive remove bids
      fn(snap, context)
    }
  }
}

export function removePublicJobInvites(db: Firestore) {
  return async function fn(
    snap: FirebaseFirestore.DocumentSnapshot,
    context: EventContext
  ) {
    const { jobId } = context.params
    const bidsSnap = await db
      .collection('public-jobs')
      .doc(jobId)
      .collection('invites')
      .limit(DEFAULT_LIMIT)
      .get()

    const refs = getRefsFromSnapshot(bidsSnap)
    if (refs.length) {
      await batchRemoveRefs(db, refs)
      // recursive remove invites
      fn(snap, context)
    }
  }
}

export function removeJobAttachments(storage: storage.Storage) {
  return (_snap: FirebaseFirestore.DocumentSnapshot, context: EventContext) => {
    const { jobId } = context.params
    const bucket = storage.bucket()
    return bucket.deleteFiles({ prefix: `uploads/jobs/${jobId}` })
  }
}

export function removeJobs(db: Firestore, opts = jobsOpts) {
  return async () => {
    // remove jobs
    const jobRefs = await prepareJobRefs(db, 'jobs', opts)
    if (jobRefs.length) {
      batchRemoveRefs(db, jobRefs)
    }
  }
}

export function removePublicJobs(db: Firestore, opts = jobsOpts) {
  return async () => {
    // remove public jobs
    const publicJobRefs = await prepareJobRefs(db, 'public-jobs', opts)
    if (publicJobRefs.length) {
      batchRemoveRefs(db, publicJobRefs)
    }
  }
}

const removeChatMessageOpts = { delta: DEFAULT_DELTA, limit: DEFAULT_LIMIT }
export function removeChatMessages(
  db: Firestore,
  opts = removeChatMessageOpts
) {
  return async (
    _snap: FirebaseFirestore.DocumentSnapshot,
    _context: EventContext
  ) => {
    const { delta, limit } = Object.assign({}, removeChatMessageOpts, opts)
    const timestamp = Date.now() - delta

    const messageSnap = await db
      .collectionGroup('messages')
      .where('timestamp', '<', timestamp)
      .limit(limit)
      .get()

    const refs = getRefsFromSnapshot(messageSnap)
    return batchRemoveRefs(db, refs)
  }
}

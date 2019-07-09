import { EventContext } from 'firebase-functions'
import { storage, firestore } from 'firebase-admin'

export const DEFAULT_LIMIT = 500

// prod delta 12 months
// const DEFAULT_DELTA = 12 * 30 * 24 * 60 * 60 * 1000

// test delta 4 months
const DEFAULT_DELTA = 4 * 30 * 24 * 60 * 60 * 1000

const jobsOpts = {
  delta: DEFAULT_DELTA,
  limit: DEFAULT_LIMIT,
}

export function getRefsFromSnapshot(
  snap: firestore.QuerySnapshot
): firestore.DocumentReference[] {
  return snap.docs.reduce((acc, { ref }) => {
    acc.push(ref)
    return acc
  }, [])
}

export async function prepareJobRefs(
  db: firestore.Firestore,
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

export function batchRemoveRefs(
  db: firestore.Firestore,
  refs: firestore.DocumentReference[]
) {
  const batch = db.batch()
  refs.forEach(ref => batch.delete(ref))
  return batch.commit()
}

export function removePublicJobBids(
  db: firestore.Firestore,
  limit = DEFAULT_LIMIT
) {
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
      return fn(snap, context)
    }
    return null
  }
}

export function removePublicJobInvites(db: firestore.Firestore) {
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
      return fn(snap, context)
    }
    return null
  }
}

export function removeJobAttachments(s: storage.Storage) {
  return (_snap: FirebaseFirestore.DocumentSnapshot, context: EventContext) => {
    const { jobId } = context.params
    const bucket = s.bucket()
    return bucket.deleteFiles({ prefix: `uploads/jobs/${jobId}` })
  }
}

export function removeJobs(db: firestore.Firestore, opts = jobsOpts) {
  return async () => {
    // remove jobs
    const jobRefs = await prepareJobRefs(db, 'jobs', opts)
    if (jobRefs.length) {
      return batchRemoveRefs(db, jobRefs)
    }
    return null
  }
}

export function removePublicJobs(db: firestore.Firestore, opts = jobsOpts) {
  return async () => {
    // remove public jobs
    const publicJobRefs = await prepareJobRefs(db, 'public-jobs', opts)
    if (publicJobRefs.length) {
      return batchRemoveRefs(db, publicJobRefs)
    }
    return null
  }
}

const removeTransactionsOpts = { delta: DEFAULT_DELTA, limit: DEFAULT_LIMIT }
export function removeTransactions(
  db: firestore.Firestore,
  opts = removeTransactionsOpts
) {
  return async () => {
    const { delta, limit } = Object.assign({}, removeTransactionsOpts, opts)
    const timestamp = Date.now() - delta

    const snap = await db
      .collection('transactions')
      .where('timestamp', '<', timestamp)
      .limit(limit)
      .get()

    const refs = getRefsFromSnapshot(snap)
    return batchRemoveRefs(db, refs)
  }
}

// remove chats channels & messages
const removeChatMessageOpts = { delta: DEFAULT_DELTA, limit: DEFAULT_LIMIT }
export function removeChatMessages(
  db: firestore.Firestore,
  opts = removeChatMessageOpts
) {
  return async () => {
    const { delta, limit } = Object.assign({}, removeChatMessageOpts, opts)
    const timestamp = Date.now() - delta
    const rePath = /^chats\/.+\/channels\/.+\/messages\//

    const snap = await db
      .collectionGroup('messages')
      .where('timestamp', '<', timestamp)
      .limit(limit)
      .get()

    const refs = getRefsFromSnapshot(snap).filter(ref => rePath.test(ref.path))
    return batchRemoveRefs(db, refs)
  }
}

const removeChatChannelsOpts = { delta: DEFAULT_DELTA, limit: DEFAULT_LIMIT }
export function removeChatChannels(
  db: firestore.Firestore,
  opts = removeChatChannelsOpts
) {
  return async () => {
    const { delta, limit } = Object.assign({}, removeChatChannelsOpts, opts)
    const timestamp = Date.now() - delta
    const rePath = /^chats\/.+\/channels\//

    const snap = await db
      .collectionGroup('channels')
      .where('timestamp', '<', timestamp)
      .limit(limit)
      .get()

    const refs = getRefsFromSnapshot(snap).filter(ref => rePath.test(ref.path))
    return batchRemoveRefs(db, refs)
  }
}

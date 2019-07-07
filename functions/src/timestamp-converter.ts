import { firestore } from 'firebase-admin'
import { getRefsFromSnapshot } from './remove-old-data'

const LIMIT = 100
const COLLECTIONS = ['transactions']
const SUBCOLLECTIONS = [
  // chats/channels
  'channels',
  // chats/channels/messages
  'messages',
  // public-jobs/bids
  'bids',
  // public-jobs/invites
  'invites',
  // viewed-users/viewed
  'viewed',
  // who/user
  'user',
]
export async function convert(
  db: firestore.Firestore,
  name: string,
  isSubcollection = false
) {
  const query = isSubcollection ? db.collectionGroup(name) : db.collection(name)
  const snap = await query
    .select('timestamp')
    .where('timestamp', '>', '')
    .limit(LIMIT)
    .get()

  const count = snap.size
  if (count === 0) {
    return count
  }

  const refs = getRefsFromSnapshot(snap)

  return db.runTransaction(async t => {
    return t.getAll(...refs).then(snap => {
      snap.forEach(item => {
        t.update(item.ref, { timestamp: parseInt(item.get('timestamp')) })
      })
      return count
    })
  })
}

const JOBS_COLLECTIONS = ['jobs', 'public-jobs']
export async function convertJobs(
  db: firestore.Firestore,
  name: string,
  createdAt = Date.now()
) {
  const snap = await db
    .collection(name)
    .select('createdAt')
    .where('createdAt', '<', createdAt)
    .orderBy('createdAt', 'asc')
    .limit(LIMIT)
    .get()

  const count = snap.size
  if (count === 0) {
    return [count, 0]
  }

  const refs = getRefsFromSnapshot(snap)

  return db.runTransaction(async t => {
    return t.getAll(...refs).then(snap => {
      let createdAt = 0
      snap.forEach(item => {
        // save cursor
        const c = item.get('createdAt')
        if (c > createdAt) {
          createdAt = c
        }

        let actionLog = item.get('actionLog')
        if (Array.isArray(actionLog)) {
          actionLog = actionLog.map(log => {
            if (log.timestamp) {
              log.timestamp = parseInt(log.timestamp)
            }
            return log
          })
          t.update(item.ref, { actionLog })
        }
      })
      return [count, createdAt]
    })
  })
}

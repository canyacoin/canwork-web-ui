import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'

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

export function converter(db: firestore.Firestore) {
  return (req: functions.Request, resp: functions.Response) => {
    if (req.method !== 'GET') {
      return resp.status(405).send('Method Not Allowed')
    }

    const { name } = req.params
    if (!name) {
      return resp.status(400).send('Missing sub/collection `name`')
    }

    const responseJSON = resp.json.bind(resp)

    if (SUBCOLLECTIONS.indexOf(name) !== -1) {
      return convert(db, name, true).then(responseJSON)
    }

    if (COLLECTIONS.indexOf(name) !== 1) {
      return convert(db, name, false).then(responseJSON)
    }

    if (JOBS_COLLECTIONS.indexOf(name) !== 1) {
      const { createdAt } = req.params
      return convertJobs(db, name, parseInt(createdAt)).then(responseJSON)
    }

    return resp.status(404).send('Sub/Collection not found')
  }
}

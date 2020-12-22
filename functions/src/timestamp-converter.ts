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
    return t.getAll(...refs).then(snapshot => {
      snapshot.forEach(item => {
        t.update(item.ref, { timestamp: parseInt(item.get('timestamp')) })
      })
      return count
    })
  })
}

const JOB_COLLECTIONS = ['jobs', 'public-jobs']
export async function convertJobs(
  db: firestore.Firestore,
  name: string,
  createAt = 0
) {
  const snap = await db
    .collection(name)
    .select('createAt')
    .where('createAt', '>', createAt)
    .orderBy('createAt', 'asc')
    .limit(LIMIT)
    .get()

  const count = snap.size
  if (count === 0) {
    return [count, 0]
  }

  const refs = getRefsFromSnapshot(snap)

  return db.runTransaction(async t => {
    return t.getAll(...refs).then(snapshot => {
      let created = createAt
      snapshot.forEach(item => {
        // save cursor
        const c = item.get('createAt')
        if (c > created) {
          created = c
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
      return [count, created]
    })
  })
}

function client(
  subcollections: string[],
  collections: string[],
  job_collections: string[]
) {
  const logEl = document.getElementById('log')
  const log = (...s: any[]) => {
    logEl.innerText += s.join(' ') + '\n'
  }
  const run = (name: string) => {
    return fetch('?name=' + name)
      .then(resp => resp.json())
      .then((count: number) => {
        if (count) {
          log('converted +', count, ' items of sub/collection', name)
          return run(name)
        } else {
          log('sub/collection', name, 'converted')
        }
      })
  }

  const runJobs = (name: string, createAt: number) => {
    return fetch('?name=' + name + '&createAt=' + createAt)
      .then(resp => resp.json())
      .then(([count, created]) => {
        if (count) {
          log('converted +', count, ' items of collection', name)
          return runJobs(name, created)
        } else {
          log('collection', name, 'converted')
        }
      })
  }

  let promise = Promise.resolve()
  promise = subcollections.reduce((p, name) => p.then(() => run(name)), promise)
  promise = collections.reduce((p, name) => p.then(() => run(name)), promise)
  promise = job_collections.reduce(
    (p, name) => p.then(() => runJobs(name, 0)),
    promise
  )

  // DONE
  return promise.then(() => {
    log('DONE!')
  })
}

export function timestampConverter(db: firestore.Firestore) {
  return async (req: functions.Request, resp: functions.Response) => {
    if (req.method !== 'GET') {
      resp.status(405).send('Method Not Allowed')
    }

    const { name }: { name?: string } = req.query
    if (!name) {
      const html = `<h1>Progress</h1>
<pre id="log"></pre>
<script>
(${client.toString()})(
  ${JSON.stringify(SUBCOLLECTIONS)},
  ${JSON.stringify(COLLECTIONS)},
  ${JSON.stringify(JOB_COLLECTIONS)}
)
</script>
`
      resp.status(200).send(html)
      return
    }

    const responseJSON = resp.json.bind(resp)

    if (SUBCOLLECTIONS.indexOf(name) !== -1) {
      await convert(db, name, true).then(responseJSON)
      return
    }

    if (COLLECTIONS.indexOf(name) !== -1) {
      await convert(db, name, false).then(responseJSON)
      return
    }

    if (JOB_COLLECTIONS.indexOf(name) !== -1) {
      let { createAt }: { createAt?: any } = req.query
      createAt = createAt ? parseInt(createAt) : 0
      await convertJobs(db, name, createAt).then(responseJSON)
      return
    }

    resp.status(404).send('Sub/Collection not found')
  }
}

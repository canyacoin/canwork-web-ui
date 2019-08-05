import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as csvStringify from 'csv-stringify'

export const exportUsers = (db: firestore.Firestore) => (
  _req: functions.Request,
  resp: functions.Response
) => {
  const output = []
  db.collection('users')
    .orderBy('type')
    .stream()
    .on('data', (snap: firestore.QueryDocumentSnapshot) => {
      const { name, email, type } = snap.data()
      output.push([name, email, type])
    })
    .on('end', () => {
      csvStringify(output, (err, data) => {
        if (err) {
          resp.status(500).send(err)
        } else {
          resp.status(200).send(data)
        }
      })
    })
}

import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import csvStringify from 'csv-stringify'
import sendgrid from '@sendgrid/mail'
import { MailData } from '@sendgrid/helpers/classes/mail'
import { AttachmentData } from '@sendgrid/helpers/classes/attachment'

async function fetch(db: firestore.Firestore, limit: number, offset?: number) {
  const output = []
  let query = db
    .collection('users')
    .select('name', 'email', 'type')
    .orderBy('type')
    .limit(limit)

  if (offset) {
    query = query.offset(offset)
  }

  const snap = await query.get()
  snap.forEach(result => {
    const { name, email, type } = result.data()
    output.push([name, email, type])
  })

  return output
}

export const exportUsers = (
  db: firestore.Firestore,
  sendGridApiKey: string
) => async (_req: functions.Request, resp: functions.Response) => {
  let limit = 1000
  let offset = 0
  let results = []

  while (true) {
    const chunk = await fetch(db, limit, offset)
    results = results.concat(chunk)
    if (chunk.length !== limit) {
      break
    }
    offset += limit
  }

  // csv
  csvStringify(results, (err, data) => {
    if (err) {
      resp.status(500).send(err)
    } else {
      const content = Buffer.from(data).toString('base64')
      const attach: AttachmentData = {
        type: 'text/csv',
        content: content,
        filename: 'canwork-users.csv',
        disposition: 'attachment',
      }
      const sendData: MailData = {
        to: 'devex.soft@gmail.com',
        from: 'support@canya.com',
        subject: 'CanWork export users',
        text: 'export users',
        attachments: [attach],
      }
      sendgrid.setApiKey(sendGridApiKey)
      sendgrid
        .send(sendData)
        .then(() => {
          resp.status(200).send('ok')
        })
        .catch(sendgridError => {
          console.log(sendgridError)
          resp.status(500).send(sendgridError)
        })
    }
  })
}

import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import csvStringify from 'csv-stringify/lib/sync'
import sendgrid from '@sendgrid/mail'
import { MailData } from '@sendgrid/helpers/classes/mail'
import { AttachmentData } from '@sendgrid/helpers/classes/attachment'

const fields = ['name', 'email', 'type', 'whitelisted']
async function fetch(db: firestore.Firestore, limit: number, offset?: number) {
  const output = []
  let query = db
    .collection('users')
    .select(...fields)
    .orderBy('type')
    .limit(limit)

  if (offset) {
    query = query.offset(offset)
  }

  const snap = await query.get()
  snap.forEach(result => {
    output.push(result.data())
  })

  return output
}

export const exportUsers = (
  db: firestore.Firestore,
  sendGridApiKey: string
) => async (_req: functions.Request, resp: functions.Response) => {
  const limit = 1000
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
  const csv = csvStringify(results, {
    header: true,
    columns: fields,
  })
  const content = Buffer.from(csv).toString('base64')
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
  try {
    await sendgrid.send(sendData)
    resp.status(200).send('ok')
  } catch (e) {
    console.log(e)
    resp.status(500).send(e)
  }
}

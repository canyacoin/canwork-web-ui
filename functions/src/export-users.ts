import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import csvStringify from 'csv-stringify'
import sendgrid from '@sendgrid/mail'
import { MailData } from '@sendgrid/helpers/classes/mail'
import { AttachmentData } from '@sendgrid/helpers/classes/attachment'

export const exportUsers = (
  db: firestore.Firestore,
  sendGridApiKey: string
) => (_req: functions.Request, resp: functions.Response) => {
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
    })
}

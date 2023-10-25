const SIMULATION = true
const MAX_UPDATES = 0

/*
HOW TO USE:

PAY ATTENTION!!!
SELECT THE FIREBASE ENV TO USE: firebase use ..
COPY CONFIG INTO THIS FOLDER: firebase functions:config:get > .runtimeconfig.json
CONFIGURE SIMULATION AND MAX_UPDATES FIELDS
RUN: node forceUserUpdate

*/

const admin = require('../functions/node_modules/firebase-admin')
const functions = require('../functions/node_modules/firebase-functions')
const env = functions.config()

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.fbadmin.project_id,
    clientEmail: env.fbadmin.client_email,
    privateKey: env.fbadmin.private_key.replace(/\\n/g, '\n'), // until https://github.com/firebase/firebase-tools/issues/371 is fixed
  }),
  databaseURL: env.fbadmin.database_url,
  storageBucket: env.fbadmin.storage_bucket,
})

const db = admin.firestore()

let updated = 0
let processed = 0

const fieldsToUpdate = {
  compressedAvatarUrl: 'new',
}

db.collection('users')
  .get()
  .then(async function (querySnapshot) {
    for (let i = 0; i < querySnapshot.docs.length; i++) {
      processed++
      let doc = querySnapshot.docs[i]
      let slug = doc.get('slug')
      let path = doc.ref.path
      let docUpdated = false
      if (!SIMULATION) {
        if (updated < MAX_UPDATES) {
          // double check
          doc.ref.update(fieldsToUpdate)
          updated++
          docUpdated = true
        }
      }
      console.log(
        `Processed n. ${processed}, "${slug}", path "${path}", updated: ${docUpdated}`
      )
    }

    console.log(`PROCESSED: ${processed}, UPDATED: ${updated}`)
  })

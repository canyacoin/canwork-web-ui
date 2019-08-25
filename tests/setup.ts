import * as fs from 'fs'

export const auth = {
  anonym: null,
  bob: { uid: 'bob' },
  alice: { uid: 'alice' },
}

export const rules = fs.readFileSync('firestore.rules', 'utf8')

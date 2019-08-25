import * as fs from 'fs'

export const auth = {
  anonym: null,
  bob: { uid: 'bob' },
  alice: { uid: 'alice' },
  john: { uid: 'john' },
}

export const rules = fs.readFileSync('firestore.rules', 'utf8')

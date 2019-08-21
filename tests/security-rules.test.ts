import { setup, teardown } from './helpers'
import * as fs from 'fs'

const mockData = {
  'users/alice': {
    name: 'Alice',
    email: 'alice@gmail.com',
  },
  'users/bob': {
    name: 'Bob',
    email: 'bob@gmail.com',
  },
  'projects/testId': {
    members: ['bob'],
  },
}
const rules = fs.readFileSync('firestore.rules', 'utf8')

describe('Project rules', () => {
  afterAll(async () => {
    await teardown()
  })

  test('allow Bob to read self profile', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(db.doc('users/bob').get()).toAllow()
  })

  test('allow Bob to update self profile', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(db.doc('users/bob').update({ name: 'Bob' })).toAllow()
  })

  test('deny Bob to update Alice profile', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(db.doc('users/alice').update({ name: 'Bob' })).toDeny()
  })

  test('deny Bob to set self profile as admin ', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(db.doc('users/bob').update({ isAdmin: true })).toDeny()
  })

  test('deny Bob to set Alice profile as admin ', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(db.doc('users/alice').update({ isAdmin: true })).toDeny()
  })
})

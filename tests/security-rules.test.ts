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

  // reviews
  'reviews/1': {
    revieweeId: 'alice',
    reviewerId: 'bob',
  },
}
const rules = fs.readFileSync('firestore.rules', 'utf8')

describe('Test `users` collection rules', () => {
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

describe('Test `reviews` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  test('deny Alice to update Bob review', async () => {
    const db = await setup({ uid: 'alice' }, mockData, rules)

    await expect(
      db.doc('reviews/1').update({ massage: 'Good job Alice', rating: 5 })
    ).toDeny()
  })

  test('allow Bob to update self review', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(
      db.doc('reviews/1').update({ message: 'Thank you Alice' })
    ).toAllow()
  })

  test('deny Bob to create a review with fake `reviewerId` field', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(
      db
        .doc('reviews/2')
        .set({ reviewerId: 'alice', message: 'Thank you Alice' })
    ).toDeny()
  })

  test('allow Bob to create a review ', async () => {
    const db = await setup({ uid: 'bob' }, mockData, rules)

    await expect(
      db.doc('reviews/2').set({ reviewerId: 'bob', message: 'Thank you Alice' })
    ).toAllow()
  })
})

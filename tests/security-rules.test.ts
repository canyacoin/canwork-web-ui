import { setup, teardown } from './helpers'
import * as fs from 'fs'

const auth = {
  anonym: null,
  bob: { uid: 'bob' },
  alice: { uid: 'alice' },
}

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

  // portfolio
  'portfolio/alice/work/1': {
    description: 'text description',
    title: 'Alice title',
  },
  'portfolio/bob/work/1': {
    description: 'text description',
    title: 'Bob portfolio',
  },
}
const rules = fs.readFileSync('firestore.rules', 'utf8')

describe('Test `users` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  test('allow Bob to read self profile', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('users/bob').get()).toAllow()
  })

  test('allow Bob to update self profile', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('users/bob').update({ name: 'Bob' })).toAllow()
  })

  test('deny Bob to update Alice profile', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('users/alice').update({ name: 'Bob' })).toDeny()
  })

  test('deny Bob to set self profile as admin ', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('users/bob').update({ isAdmin: true })).toDeny()
  })

  test('deny Bob to set Alice profile as admin ', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('users/alice').update({ isAdmin: true })).toDeny()
  })
})

describe('Test `reviews` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  test('deny Alice to update Bob review', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(
      db.doc('reviews/1').update({ massage: 'Good job Alice', rating: 5 })
    ).toDeny()
  })

  test('allow Bob to update self review', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(
      db.doc('reviews/1').update({ message: 'Thank you Alice' })
    ).toAllow()
  })

  test('deny Bob to create a review with fake `reviewerId` field', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(
      db
        .doc('reviews/2')
        .set({ reviewerId: 'alice', message: 'Thank you Alice' })
    ).toDeny()
  })

  test('allow Bob to create a review ', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(
      db.doc('reviews/2').set({ reviewerId: 'bob', message: 'Thank you Alice' })
    ).toAllow()
  })
})

describe('Test `portfolio` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })
  // deny tests for Anonym
  test('deny Anonym to create a portfolio', async () => {
    const db = await setup(auth.anonym, mockData, rules)

    await expect(
      db.doc('portfolio/alice/work/1').set({ description: 'description' })
    ).toDeny()
  })

  test('deny Anonym to update a portfolio', async () => {
    const db = await setup(auth.anonym, mockData, rules)

    await expect(
      db.doc('portfolio/alice/work/1').update({ description: 'description' })
    ).toDeny()
  })

  test('deny Anonym to delete a portfolio', async () => {
    const db = await setup(auth.anonym, mockData, rules)

    await expect(db.doc('portfolio/alice/work/1').delete()).toDeny()
  })

  // deny tests for Bob
  test('deny Bob to create a portfolio with fake `userId`', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(
      db.doc('portfolio/alice/work/1').set({ description: 'description' })
    ).toDeny()
  })

  test('deny Bob to update Alice portfolio', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(
      db.doc('portfolio/alice/work/1').update({ description: 'description' })
    ).toDeny()
  })

  test('deny Bob to delete Alice portfolio', async () => {
    const db = await setup(auth.bob, mockData, rules)

    await expect(db.doc('portfolio/alice/work/1').delete()).toDeny()
  })

  // allow tests
  test('allow Alice to create a portfolio', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(
      db.doc('portfolio/alice/work/100').set({ description: 'description' })
    ).toAllow()
  })

  test('allow Alice to update a portfolio', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(
      db
        .doc('portfolio/alice/work/1')
        .update({ description: 'change description' })
    ).toAllow()
  })

  test('allow Alice to delete a portfolio', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(db.doc('portfolio/alice/work/1').delete()).toAllow()
  })

  test('allow Alice to read self portfolio', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(db.doc('portfolio/alice/work/1').get()).toAllow()
  })

  test('allow Alice to read Bob portfolio', async () => {
    const db = await setup(auth.alice, mockData, rules)

    await expect(db.doc('portfolio/bob/work/1').get()).toAllow()
  })

  test('allow Anonym to read a portfolio', async () => {
    const db = await setup(auth.anonym, mockData, rules)

    await expect(db.doc('portfolio/bob/work/1').get()).toAllow()
  })
})

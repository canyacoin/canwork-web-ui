import * as fs from 'fs'

import { setup, teardown, allow, deny } from './helpers'

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

  const path = 'users/alice'
  const data = {
    'users/alice': { name: 'Alice', email: 'alice@gmail.com' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ name: 'Alice', email: 'alice@gmail.com' })
    .update({ name: 'Alice', email: 'alice@hotmail.com' })
    .deny()
    .delete()
    .update({ isAdmin: true }, 'as Admin')

  deny(rules, path, auth.bob, data)
    .create({ name: 'Alice', email: 'alice@gmail.com' })
    .update({ name: 'Alice', email: 'alice@hotmail.com' })
    .delete()
    .allow()
    .read()

  deny(rules, path, auth.anonym, data)
    .create({ name: 'Alice', email: 'alice@gmail.com' })
    .update({ name: 'Alice', email: 'alice@hotmail.com' })
    .delete()
    .allow()
    .read()
})

describe('Test `reviews` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })
  const path = 'reviews/1'
  const data = {
    'reviews/1': {
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 4,
    },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({
      reviewerId: 'alice',
      revieweeId: 'bob',
    })
    .update({
      reviewerId: 'alice',
      revieweeId: 'bob',
    })
    .deny()
    .delete()

  deny(rules, path, auth.bob, data, 'none own review')
    .create(
      {
        reviewerId: 'alice',
        revieweeId: 'bob',
        massage: 'Good job Bob',
        rating: 5,
      },
      'with fake "reviewerId"'
    )
    .update({ rating: 5 })
    .delete()
    .allow()
    .read()

  deny(rules, path, auth.anonym, data)
    .create({
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 5,
    })
    .update({
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 5,
    })
    .delete()
    .allow()
    .read()
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

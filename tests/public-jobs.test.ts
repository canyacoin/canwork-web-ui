import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `public-jobs` collection rules (visibility public)', () => {
  const path = 'public-jobs/1'
  const data = {
    [path]: {
      clientId: 'alice',
      budget: 100,
      visibility: 'public',
    },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { clientId: 'alice', providerId: 'bob', budget: 50 } })
    .update({ data: { budget: 30 } })
    .deny()
    .delete()
    .runTests()

  allow({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .deny()
    .create()
    .update()
    .delete()
    .runTests()
})

describe('Test `public-jobs` collection rules (visibility invite)', () => {
  const path = 'public-jobs/1'
  const data = {
    [path]: {
      clientId: 'alice',
      budget: 100,
      visibility: 'invite',
    },
    'public-jobs/1/invites/bob': {
      providerId: 'bob',
    },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({
      data: { clientId: 'alice', providerId: 'bob', budget: 50 },
      id: '2',
    })
    .update({ data: { budget: 150 } })
    .deny()
    .delete()
    .runTests()

  allow({ name: 'Bob tests (invited user)', rules, path, auth: auth.bob, data })
    .read()
    .deny()
    .update()
    .delete()
    .runTests()

  deny({
    name: 'John tests (not invited user)',
    rules,
    path,
    auth: auth.john,
    data,
  })
    .read()
    .update()
    .delete()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .update()
    .delete()
    .runTests()
})

describe('Test `invites` subcollection rules', () => {
  const path = 'public-jobs/1/invites/bob'
  const data = {
    'public-jobs/1': {
      clientId: 'alice',
      budget: 100,
      visibility: 'invite',
    },
    [path]: {
      providerId: 'bob',
    },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { providerId: 'bob' } })
    .update({ data: { providerId: 'bob' } })
    .deny()
    .delete()
    .runTests()

  allow({ name: 'Bob tests (invited user)', rules, path, auth: auth.bob, data })
    .read()
    .deny()
    .create({ id: 'alice' })
    .update()
    .delete()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .create()
    .update()
    .delete()
    .runTests()
})

describe('Test `bids` subcollection rules', () => {
  const path = 'public-jobs/1/bids/bob'
  const data = {
    'public-jobs/1': {
      clientId: 'alice',
      budget: 100,
      visibility: 'invite',
    },
    'public-jobs/1/invites/bob': {
      providerId: 'bob',
    },
  }
  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .deny()
    .create()
    .update()
    .delete()
    .runTests()

  allow({ name: 'Bob tests', rules, path, auth: auth.bob, data })
    .read()
    .create({ data: { budget: 300, providerId: 'bob' } })
    .update({ data: { budget: 500 } })
    .deny()
    .delete()
    .runTests()

  deny({ name: 'John tests', rules, path, auth: auth.john, data })
    .read()
    .create()
    .update()
    .delete()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .create()
    .update()
    .delete()
    .runTests()
})

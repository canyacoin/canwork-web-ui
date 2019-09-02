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
    .runTests()

  allow({ name: 'Bob tests (invited user)', rules, path, auth: auth.bob, data })
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .runTests()
})

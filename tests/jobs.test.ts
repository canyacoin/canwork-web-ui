import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `jobs` collection rules', () => {
  const path = 'jobs/1'
  const data = {
    [path]: { clientId: 'alice', providerId: 'bob', budget: 100 },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { clientId: 'alice', providerId: 'bob', budget: 50 } })
    .update({ data: { budget: 30 } })
    .deny()
    .delete()
    .runTests()

  allow({
    name: 'Bob tests (common job)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .read()
    .create({ data: { clientId: 'bob', providerId: 'alice', budget: 1 } })
    .update()
    .deny()
    .delete()
    .runTests()

  deny({
    name: 'John tests (non common job)',
    rules,
    path,
    auth: auth.john,
    data,
  })
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

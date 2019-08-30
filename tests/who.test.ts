import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `who` collection rules', () => {
  const path = 'who/bob/user/alice'
  const data = {
    [path]: { name: 'Alice', address: 'alice' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { name: 'Alice', address: 'alice' } })
    .update({ data: { name: 'Alice', address: 'alice' } })
    .deny()
    .create({
      data: { name: 'Bob', address: 'bob' },
      suffix: 'with fake address',
    })
    .update({
      data: { name: 'Bob', address: 'bob' },
      suffix: 'with fake address',
    })
    .delete()
    .runTests()

  deny({
    name: 'Bob tests (non own user subcollection)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .create({ data: {}, suffix: 'already exists user subcollection' })
    .update({ data: { name: 'Bob' } })
    .delete()
    .allow()
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .create()
    .update()
    .delete()
    .allow()
    .read()
    .runTests()
})

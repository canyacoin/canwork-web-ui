import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `who` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  const path = 'who/bob/user/alice'
  const data = {
    [path]: { name: 'Alice', address: 'alice' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ name: 'Alice', address: 'alice' })
    .update({ name: 'Alice', address: 'alice' })
    .deny({ data: {} })
    .create({ name: 'Bob', address: 'bob' }, 'with fake address')
    .update({ name: 'Bob', address: 'bob' }, 'with fake address')
    .delete()

  deny(rules, path, auth.bob, data, 'non own user subcollection')
    .create({}, 'already exists user subcollection')
    .update({ name: 'Bob' })
    .delete()
    .allow()
    .read()

  deny(rules, path, auth.anonym, data)
    .create()
    .update()
    .delete()
    .allow()
    .read()
})

import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

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

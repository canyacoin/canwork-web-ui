import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `users` collection rules', () => {
  const path = 'users/alice'
  const data = {
    [path]: { name: 'Alice', email: 'alice@gmail.com' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { name: 'Alice', email: 'alice@gmail.com' } })
    .update({ data: { name: 'Alice', email: 'alice@hotmail.com' } })
    .deny()
    .delete()
    .update({ data: { isAdmin: true }, suffix: 'as Admin' })
    .runTests()

  deny({ name: 'Bob tests', rules, path, auth: auth.bob, data })
    .create({ data: { name: 'Alice', email: 'alice@gmail.com' } })
    .update({ data: { name: 'Alice', email: 'alice@hotmail.com' } })
    .delete()
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .create({ data: { name: 'Alice', email: 'alice@gmail.com' } })
    .update({ data: { name: 'Alice', email: 'alice@hotmail.com' } })
    .delete()
    .read()
    .runTests()
})

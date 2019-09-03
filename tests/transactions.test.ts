import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `transactions` collection rules', () => {
  const path = 'transactions/1'
  const data = {
    [path]: { id: 'xxx-xx-xxxx', senderId: 'alice', jobId: 'job1' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { id: 'xxx-xx-xxxx', senderId: 'alice', jobId: 'job1' } })
    .update({ data: { success: true } })
    .deny()
    .delete()
    .runTests()

  deny({
    name: 'Bob tests (non own transaction)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .create({ data: {}, suffix: 'already exists transaction' })
    .update()
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

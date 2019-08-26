import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `transactions` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  const path = 'transactions/1'
  const data = {
    [path]: { id: 'xxx-xx-xxxx', senderId: 'alice', jobId: 'job1' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ id: 'xxx-xx-xxxx', senderId: 'alice', jobId: 'job1' })
    .update({ success: true })
    .deny()
    .delete()

  deny(rules, path, auth.bob, data, 'non own transaction')
    .create({}, 'already exists transaction')
    .update()
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

import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `channels` subcollection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  const path = 'chats/alice/channels/alice-bob'
  const data = {
    [path]: { address: 'alice', title: 'Alice channel' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ address: 'alice', title: 'Alice channel' })
    .update({ address: 'alice', title: 'Alice channel changed' })
    .deny()
    .delete()

  allow(rules, path, auth.bob, data, 'joint channel subcollection')
    .read()
    .create()
    .update()
    .deny()
    .delete()

  deny(rules, path, auth.anonym, data)
    .read()
    .create()
    .update()
    .delete()
})

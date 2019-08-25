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

  allow(rules, path, auth.bob, data, 'common channel')
    .read()
    .create()
    .update()
    .deny()
    .delete()

  deny(rules, path, auth.john, data, 'non common channel')
    .read()
    .create()
    .update()
    .delete()

  deny(rules, path, auth.anonym, data)
    .read()
    .create()
    .update()
    .delete()
})

describe('Test `messages` subcollection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  const path = 'chats/alice/channels/alice-bob/messages/1'
  const data = {
    [path]: { message: 'Hello Bob!' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ message: 'How are you?' })
    .update({ message: 'Are you there?' })
    .deny()
    .delete()

  allow(rules, path, auth.bob, data, 'common channel')
    .read()
    .create({ message: 'Hi Alice!' })
    .update({ message: 'Have a nice day!' })
    .deny()
    .delete()

  deny(rules, path, auth.john, data, 'non common channel')
    .read()
    .create()
    .update()
    .delete()

  deny(rules, path, auth.anonym, data)
    .read()
    .create()
    .update()
    .delete()
})

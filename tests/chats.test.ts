import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `channels` subcollection rules', () => {
  const path = 'chats/alice/channels'
  const data = {}

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .runTests()

  deny({ name: 'Bob tests', rules, path, auth: auth.bob, data })
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .runTests()
})

describe('Test `channels` subcollection rules', () => {
  const path = 'chats/alice/channels/alice-bob'
  const data = {
    [path]: { address: 'alice', title: 'Alice channel' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { address: 'alice', title: 'Alice channel' } })
    .update({ data: { address: 'alice', title: 'Alice channel changed' } })
    .deny()
    .delete()
    .runTests()

  allow({
    name: 'Bob tests (common channel)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .read()
    .create()
    .update()
    .deny()
    .delete()
    .runTests()

  deny({
    name: 'John tests (non common channel)',
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

describe('Test `messages` subcollection rules', () => {
  const path = 'chats/alice/channels/alice-bob/messages/1'
  const data = {
    [path]: { message: 'Hello Bob!' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { message: 'How are you?' } })
    .update({ data: { message: 'Are you there?' } })
    .deny()
    .delete()
    .runTests()

  allow({
    name: 'Bob tests (common channel)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .read()
    .create({ data: { message: 'Hi Alice!' } })
    .update({ data: { message: 'Have a nice day!' } })
    .deny()
    .delete()
    .runTests()

  deny({
    name: 'John tests (non common channel)',
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

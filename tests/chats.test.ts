import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `channels` subcollection rules', () => {
  const path = 'chats/alice/channels'
  const data = {}

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .runTest()

  deny({ name: 'Bob tests', rules, path, auth: auth.bob, data })
    .read()
    .runTest()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .runTest()
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
    .runTest()

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
    .runTest()

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
    .runTest()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .create()
    .update()
    .delete()
    .runTest()
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
    .runTest()

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
    .runTest()

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
    .runTest()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .read()
    .create()
    .update()
    .delete()
    .runTest()
})

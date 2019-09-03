import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `portfolio` collection rules', () => {
  const path = 'portfolio/alice/work/1'
  const data = {
    [path]: {
      description: 'text description',
      title: 'Alice title',
    },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .update({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .delete()
    .runTests()

  deny({
    name: 'Bob tests (non own portfolio)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .create({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .update({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .delete()
    .allow()
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .create({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .update({
      data: {
        description: 'text description',
        title: 'Alice title',
      },
    })
    .delete()
    .allow()
    .read()
    .runTests()
})

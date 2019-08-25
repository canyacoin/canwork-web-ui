import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `portfolio` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })
  const path = 'portfolio/alice/work/1'
  const data = {
    'portfolio/alice/work/1': {
      description: 'text description',
      title: 'Alice title',
    },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({
      description: 'text description',
      title: 'Alice title',
    })
    .update({
      description: 'text description',
      title: 'Alice title',
    })
    .delete()

  deny(rules, path, auth.bob, data, 'non own portfolio')
    .create({
      description: 'text description',
      title: 'Alice title',
    })
    .update({
      description: 'text description',
      title: 'Alice title',
    })
    .delete()
    .allow()
    .read()

  deny(rules, path, auth.anonym, data)
    .create({
      description: 'text description',
      title: 'Alice title',
    })
    .update({
      description: 'text description',
      title: 'Alice title',
    })
    .delete()
    .allow()
    .read()
})

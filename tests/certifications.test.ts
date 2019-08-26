import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `certifications` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })

  const path = 'users/alice/certifications/1'
  const data = {
    [path]: { id: 'xxx-xx-xxxx', university: 'MIT' },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({ id: 'yyy-yy-yyyy', university: 'Oxford' })
    .update({ university: 'MIT' })
    .delete()

  deny(rules, path, auth.bob, data)
    .create()
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

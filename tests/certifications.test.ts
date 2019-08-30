import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `certifications` collection rules', () => {
  const path = 'users/alice/certifications/1'
  const data = {
    [path]: { id: 'xxx-xx-xxxx', university: 'MIT' },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({ data: { id: 'yyy-yy-yyyy', university: 'Oxford' } })
    .update({ data: { university: 'MIT' } })
    .delete()
    .runTests()

  deny({ name: 'Bob tests', rules, path, auth: auth.bob, data })
    .create()
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

import { setup, teardown } from './helpers'

const mockData = {
  'users/jeffd23': {
    roles: {
      admin: true,
    },
  },
  'projects/testId': {
    members: ['bob'],
  },
}

describe('Project rules', () => {
  afterAll(async () => {
    await teardown()
  })

  test('deny a user that does NOT have the admin role', async () => {
    const db = await setup({ uid: null }, mockData)

    // Allow rules in place for this collection
    const projRef = db.doc('projects/testId')
    await expect(projRef.get()).toDeny()
  })

  test('allow a user with the admin role', async () => {
    const db = await setup({ uid: 'jeffd23' }, mockData)

    const projRef = db.doc('projects/testId')
    await expect(projRef.get()).toAllow()
  })

  test('deny a user if they are NOT in the Access Control List', async () => {
    const db = await setup({ uid: 'frank' }, mockData)

    const projRef = db.doc('projects/testId')
    await expect(projRef.get()).toDeny()
  })

  test('allow a user if they are in the Access Control List', async () => {
    const db = await setup({ uid: 'bob' }, mockData)

    const projRef = db.doc('projects/testId')
    await expect(projRef.get()).toAllow()
  })
})

import 'jest'
import * as firebase from '@firebase/testing'
import * as types from './types'

export const setup = async (auth, data, rules: string) => {
  const projectId = `rules-spec-${Date.now()}`
  const app = await firebase.initializeTestApp({
    projectId,
    auth,
  })

  const db = app.firestore()

  // Write mock documents before rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key)
      await ref.set(data[key])
    }
  }

  // Apply rules
  await firebase.loadFirestoreRules({
    projectId,
    rules,
  })

  return db
}

export const teardown = async () => {
  Promise.all(firebase.apps().map(app => app.delete()))
}

expect.extend({
  async toAllow(x) {
    let pass = false
    try {
      await firebase.assertSucceeds(x)
      pass = true
    } catch (err) {}

    return {
      pass,
      message: () =>
        'Expected Firebase operation to be allowed, but it was denied',
    }
  },
})

expect.extend({
  async toDeny(x) {
    let pass = false
    try {
      await firebase.assertFails(x)
      pass = true
    } catch (err) {}
    return {
      pass,
      message: () =>
        'Expected Firebase operation to be denied, but it was allowed',
    }
  },
})

export const testCases = (testCases: types.TestCases) => {
  testCases.cases.forEach(tCase => {
    describe(tCase.describe, () => {
      afterAll(async () => {
        await teardown()
      })

      // tests
      tCase.tests.forEach(t => {
        const name = (t.auth ? t.auth.uid : 'anonym').toUpperCase()
        const allow = {
          read: t.allow.indexOf('read') > -1,
          create: t.allow.indexOf('create') > -1,
          update: t.allow.indexOf('update') > -1,
          delete: t.allow.indexOf('delete') > -1,
        }
        const op = (isAllow: boolean) => (isAllow ? 'allow' : 'deny')

        // read
        test(`${op(allow.read)} ${name} to read "${t.path}"`, async () => {
          const db = await setup(t.auth, tCase.data, tCase.rules)
          const matcher = expect(db.doc(t.path).get())
          await (allow.read ? matcher.toAllow : matcher.toDeny)()
        })

        // create
        test(`${op(allow.create)} ${name} to create "${t.path}"`, async () => {
          const db = await setup(t.auth, tCase.data, tCase.rules)
          const matcher = expect(db.doc(t.path).set({}))
          await (allow.create ? matcher.toAllow : matcher.toDeny)()
        })

        // update
        test(`${op(allow.update)} ${name} to update "${t.path}"`, async () => {
          const db = await setup(t.auth, tCase.data, tCase.rules)
          const matcher = expect(db.doc(t.path).update({}))
          await (allow.update ? matcher.toAllow : matcher.toDeny)()
        })

        // update
        test(`${op(allow.delete)} ${name} to delete "${t.path}"`, async () => {
          const db = await setup(t.auth, tCase.data, tCase.rules)
          const matcher = expect(db.doc(t.path).delete())
          await (allow.delete ? matcher.toAllow : matcher.toDeny)()
        })
      })
    })
  })
}

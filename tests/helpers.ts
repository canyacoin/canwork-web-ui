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

export interface Context {
  read(title?: string): Context
  create(data: firebase.firestore.DocumentData, title?: string): Context
  update(data: firebase.firestore.UpdateData, title?: string): Context
  delete(title?: string): Context
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export abstract class AbstractContext implements Context {
  constructor(
    readonly isAllow: boolean,
    readonly rules: string,
    readonly path: string,
    readonly auth: types.Auth,
    readonly data: any
  ) {}

  private async expect<T>(value: T) {
    const m = expect(value)
    return await (this.isAllow ? m.toAllow() : m.toDeny())
  }

  title(action: string, suffix?: string) {
    suffix = suffix ? suffix : ''
    const name = capitalize(this.auth ? this.auth.uid : 'anonym')
    return `${this.isAllow ? 'allow' : 'deny'} ${name} to ${action} "${
      this.path
    }" ${suffix}`.trim()
  }

  read(title?: string): Context {
    test(this.title('read', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).get())
    })

    return this
  }

  create(data: firebase.firestore.DocumentData, title?: string): Context {
    test(this.title('create', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).set(data))
    })

    return this
  }

  update(data: firebase.firestore.DocumentData, title?: string): Context {
    test(this.title('update', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).update(data))
    })

    return this
  }

  delete(title?: string): Context {
    test(this.title('delete', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).delete())
    })

    return this
  }
}

export class AllowContext extends AbstractContext {
  constructor(
    readonly rules: string,
    readonly path: string,
    readonly auth: types.Auth,
    readonly data: any
  ) {
    super(true, rules, path, auth, data)
  }
}

export class DenyContext extends AbstractContext {
  constructor(
    readonly rules: string,
    readonly path: string,
    readonly auth: types.Auth,
    readonly data: any
  ) {
    super(false, rules, path, auth, data)
  }
}

// helpers
export const allow = (
  rules: string,
  path: string,
  auth: types.Auth,
  data: any
) => new AllowContext(rules, path, auth, data)

export const deny = (
  rules: string,
  path: string,
  auth: types.Auth,
  data: any
) => new DenyContext(rules, path, auth, data)

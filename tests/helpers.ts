import 'jest'
import * as firebase from '@firebase/testing'
import { Auth, IAllowDeny, IAllowDenyOptions } from './types'

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

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export abstract class AllowDeny implements IAllowDeny {
  constructor(
    readonly isAllow: boolean,
    readonly rules: string,
    readonly path: string,
    readonly auth: Auth,
    readonly data: any,
    readonly suffix?: string
  ) {}

  private async expect<T>(value: T) {
    const m = expect(value)
    return await (this.isAllow ? m.toAllow() : m.toDeny())
  }

  title(action: string, suffix?: string) {
    suffix = suffix || this.suffix || ''
    const name = capitalize(this.auth ? this.auth.uid : 'anonym')
    return `${this.isAllow ? 'allow' : 'deny'} ${name} to ${action} "${
      this.path
    }" ${suffix}`.trim()
  }

  read(title?: string) {
    test(this.title('read', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).get())
    })

    return this
  }

  create(data?: firebase.firestore.DocumentData, title?: string) {
    test(this.title('create', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).set(data || {}))
    })

    return this
  }

  update(data?: firebase.firestore.DocumentData, title?: string) {
    test(this.title('update', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).update(data || {}))
    })

    return this
  }

  delete(title?: string) {
    test(this.title('delete', title), async () => {
      const db = await setup(this.auth, this.data, this.rules)
      await this.expect(db.doc(this.path).delete())
    })

    return this
  }
}

export class Allow extends AllowDeny {
  constructor(
    readonly rules: string,
    readonly path: string,
    readonly auth: Auth,
    readonly data: any,
    readonly suffix?: string
  ) {
    super(true, rules, path, auth, data, suffix)
  }

  deny(opts?: Partial<IAllowDenyOptions>) {
    const { rules, path, auth, data, suffix } = {
      rules: this.rules,
      path: this.path,
      auth: this.auth,
      data: this.data,
      suffix: this.suffix,
      ...opts,
    }
    return new Deny(rules, path, auth, data, suffix)
  }
}

export class Deny extends AllowDeny {
  constructor(
    readonly rules: string,
    readonly path: string,
    readonly auth: Auth,
    readonly data: any,
    readonly suffix?: string
  ) {
    super(false, rules, path, auth, data, suffix)
  }

  allow(opts?: Partial<IAllowDenyOptions>) {
    const { rules, path, auth, data, suffix } = {
      rules: this.rules,
      path: this.path,
      auth: this.auth,
      data: this.data,
      suffix: this.suffix,
      ...opts,
    }
    return new Allow(rules, path, auth, data, suffix)
  }
}

// helpers
export const allow = (
  rules: string,
  path: string,
  auth: Auth,
  data: any,
  suffix?: string
) => new Allow(rules, path, auth, data, suffix)

export const deny = (
  rules: string,
  path: string,
  auth: Auth,
  data: any,
  suffix?: string
) => new Deny(rules, path, auth, data, suffix)

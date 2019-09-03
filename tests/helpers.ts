import 'jest'
import * as firebase from '@firebase/testing'
import {
  ReadOptions,
  CreateOptions,
  UpdateOptions,
  Row,
  Table,
  Actions,
  AllowDenyTable,
  AllowTable,
  DenyTable,
  Auth,
  TableFn,
  DescribeContext,
  TestFactoryContext,
} from './types'

export const setup = async (
  rules: string,
  auth: Auth,
  data?: Record<string, firebase.firestore.DocumentData>
) => {
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

const uid = () =>
  Math.random()
    .toString()
    .slice(2)

export function isCollection(path: string) {
  return path.split('/').length % 2 !== 0
}

export function createTestName(
  userName: string,
  isAllow: boolean,
  action: Actions,
  path: string,
  suffix?: string
) {
  return `${
    isAllow ? 'allow' : 'deny'
  } ${userName} to ${action} "${path}" ${suffix || ''}`.trim()
}

export function testFactory(context: TestFactoryContext) {
  return ({ isAllow, action, options = {} }: Row) => {
    const name = createTestName(
      capitalize(context.auth ? context.auth.uid : 'anonym'),
      isAllow,
      action,
      context.path,
      options && options.suffix
    )

    test(
      name,
      async () => {
        const db = await context.db
        const { path } = context
        let p
        switch (action) {
          case Actions.Read:
            if (isCollection(path)) {
              const ref = db.collection(path)
              const where = (options as ReadOptions).where
              if (where) {
                p = where.reduce((ref, item) => ref.where(...item), ref).get()
              } else {
                p = ref.get()
              }
            } else {
              p = db.doc(path).get()
            }
            break

          case Actions.Create:
            {
              const { data = {}, id } = options as Partial<CreateOptions>
              const ref = id ? db.doc(path).parent.doc(id) : db.doc(path)
              p = ref.set(data)
            }
            break

          case Actions.Update:
            {
              const { data = {} } = options as Partial<UpdateOptions>
              p = db.doc(path).update(data)
            }
            break

          case Actions.Delete:
            p = db.doc(path).delete()
        }
        const m = expect(p)
        return await (isAllow ? m.toAllow : m.toDeny)()
      },
      context.timeout
    )
  }
}

export function describeFn(context: DescribeContext, tableFn: TableFn) {
  const db = setup(context.rules, context.auth, context.data)
  const testFn = testFactory({
    db,
    path: context.path,
    auth: context.auth,
    timeout: context.timeout,
  })
  afterAll(async () => (await db).app.delete())
  describe.each(tableFn({ allow: new ATable(), deny: new DTable() }))(
    context.name,
    testFn
  )
}

export class ADTable implements AllowDenyTable {
  constructor(readonly isAllow: boolean, private _table: Table = []) {}

  read(options?: Partial<ReadOptions>) {
    this._table.push({ isAllow: this.isAllow, action: Actions.Read, options })
    return this
  }

  create(options?: Partial<CreateOptions>) {
    this._table.push({ isAllow: this.isAllow, action: Actions.Create, options })
    return this
  }

  update(options?: Partial<UpdateOptions>) {
    this._table.push({ isAllow: this.isAllow, action: Actions.Update, options })
    return this
  }

  delete(options?: Partial<UpdateOptions>) {
    this._table.push({ isAllow: this.isAllow, action: Actions.Delete, options })
    return this
  }

  table() {
    return this._table
  }
}

export class ATable extends ADTable implements AllowDenyTable, AllowTable {
  constructor(table: Table = []) {
    super(true, table)
  }
  deny() {
    return new DTable(this.table())
  }
}

export class DTable extends ADTable implements AllowDenyTable, DenyTable {
  constructor(table: Table = []) {
    super(false, table)
  }
  allow() {
    return new ATable(this.table())
  }
}

export class Allow extends ATable {
  constructor(readonly context: DescribeContext, table: Table = []) {
    super(table)
  }

  deny() {
    return new Deny(this.context, this.table())
  }

  runTests(debug: boolean = false) {
    if (debug) {
      console.log('Table', this.table())
    }
    describeFn(this.context, () => this.table())
  }
}

export class Deny extends DTable {
  constructor(readonly context: DescribeContext, table: Table = []) {
    super(table)
  }

  allow() {
    return new Allow(this.context, this.table())
  }

  runTests(debug: boolean = false) {
    if (debug) {
      console.log('Table', this.table())
    }
    describeFn(this.context, () => this.table())
  }
}

export const allow = (context: DescribeContext) => new Allow(context)
export const deny = (context: DescribeContext) => new Deny(context)

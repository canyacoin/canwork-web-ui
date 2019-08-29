import 'jest'
import * as firebase from '@firebase/testing'
import { CreateOptions, UpdateOptions, Context, Row, Actions } from './types'

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
  } ${userName} to ${action} "${path}" ${suffix}`.trim()
}

export function testFactory(context: Context) {
  return ({ isAllow, action, options }: Row) => {
    const name = createTestName(
      capitalize(context.auth ? context.auth.uid : 'anonym'),
      isAllow,
      action,
      context.path,
      options.suffix
    )

    test(
      name,
      async () => {
        const db = await context.db
        const { path } = context
        let p
        switch (action) {
          case Actions.Read:
            p = (isCollection(path) ? db.collection(path) : db.doc(path)).get()
            break

          case Actions.Create:
            {
              const { data = {}, id = uid() } = options as Partial<
                CreateOptions
              >
              const ref = db.doc(path).parent.doc(id)
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
            db.doc(path).delete()
        }
        const m = expect(p)
        return (isAllow ? m.toAllow : m.toDeny)()
      },
      context.timeout
    )
  }
}

export function factory(context: Context) {
  const testFn = testFactory(context)
  return { allow, deny, testFn }
}
// const actionsFactory = (
//   isAllow: boolean,
//   db: firebase.firestore.Firestore,
//   params: AllowDenyParams
// ): AllowDenyActions => {
//   const _expect = async <T>(value: T) => {
//     const m = expect(value)
//     return await (isAllow ? m.toAllow() : m.toDeny())
//   }

//   const title = (action: string, suffix?: string, path = params.path) => {
//     suffix = suffix || this.suffix || ''
//     const name = capitalize(params.auth ? params.auth.uid : 'anonym')
//     return `${
//       this.isAllow ? 'allow' : 'deny'
//     } ${name} to ${action} "${path}" ${suffix}`.trim()
//   }

//   return {
//     read({ suffix } = {}) {
//       test(title('read', suffix), async () => {
//         const ref =
//           params.path.split('/').length % 2 == 0
//             ? db.doc(params.path)
//             : db.collection(params.path)
//         resolve(await _expect(ref.get()))
//       })

//       let resolve
//       return new Promise(r => {
//         resolve = r
//       })
//     },

//     create({ data = {}, id = uid(), suffix } = {}) {
//       const ref = db.doc(params.path).parent.doc(id)
//       test(title('create', suffix, ref.path), async () => {
//         resolve(await _expect(ref.set(data)))
//       })

//       let resolve
//       return new Promise(r => {
//         resolve = r
//       })
//     },

//     update({ data = {}, suffix } = {}) {
//       test(title('update', suffix), async () => {
//         resolve(await _expect(db.doc(params.path).update(data)))
//       })

//       let resolve
//       return new Promise(r => {
//         resolve = r
//       })
//     },

//     delete({ suffix } = {}) {
//       test(title('delete', suffix), async () => {
//         resolve(await _expect(db.doc(params.path).delete()))
//       })

//       let resolve
//       return new Promise(r => {
//         resolve = r
//       })
//     },
//   }
// }

// // helpers
// export const allow = async (params: AllowDenyParams) => {
//   const db = await setup(params.auth, params.data, params.rules)
//   return actionsFactory(true, db, params)
// }

// export const deny = async (params: AllowDenyParams) => {
//   const db = await setup(params.auth, params.data, params.rules)
//   return actionsFactory(false, db, params)
// }

// export const allowDeny = (
//   db: firebase.firestore.Firestore,
//   params: AllowDenyParams
// ) => {
//   return {
//     allow: actionsFactory(true, db, params),
//     deny: actionsFactory(false, db, params),
//   }
// }

// export const testFactory = (
//   db: firebase.firestore.Firestore,
//   params: AllowDenyParams
// ) => {
//   const { allow, deny } = allowDeny(db, params)
//   return ({
//     isAllow,
//     op,
//     opts,
//   }: {
//     isAllow: boolean
//     op: 'read' | 'create' | 'update' | 'delete'
//     opts?: Partial<ReadOptions | CreateOptions | UpdateOptions | DeleteOptions>
//   }) => {
//     const actions = isAllow ? allow : deny
//     switch (op) {
//       case 'read':
//         actions.read(opts)
//         break
//       case 'create':
//         actions.create(opts)
//         break
//       case 'update':
//         actions.update(opts)
//         break
//       case 'delete':
//         actions.delete(opts)
//         break
//     }
//   }
// }

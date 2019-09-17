import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import { WhereFilterOp, OrderByDirection } from '@google-cloud/firestore'
import { omit } from 'ramda'

const privateFields: Record<string, string[]> = {
  users: ['email', 'phone', 'work'],
  who: ['email', 'phone', 'work'],
}

function excludeFields(
  collectionName: string,
  obj: firestore.DocumentData
): firestore.DocumentData {
  const fields = privateFields[collectionName]

  return omit(fields, obj)
}
function collectionName(path: string) {
  return path.split('/')[0]
}

export interface GetParams {
  path: string
}
export function get(db: firestore.Firestore) {
  return async ({ path }: GetParams) => {
    const snap = await db.doc(path).get()
    const data = snap.data()

    return excludeFields(collectionName(path), data)
  }
}

export type WhereItem = [string | firestore.FieldPath, WhereFilterOp, any]
export type OrderBy = [string | firestore.FieldPath, OrderByDirection]
export interface SelectParams {
  path: string
  select?: string[]
  where?: WhereItem[]
  limit?: number
  offset?: number
  orderBy?: OrderBy
}

export function select(db: firestore.Firestore) {
  return async ({
    path,
    select,
    where,
    limit,
    offset,
    orderBy,
  }: SelectParams) => {
    const ref = db.collection(path)
    let query: firestore.Query | firestore.CollectionReference = ref
    if (where) {
      query = where.reduce((acc, args) => acc.where(...args), ref)
    }

    if (select) {
      query = query.select(...select)
    }

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.offset(offset)
    }

    if (orderBy) {
      query = query.orderBy(...orderBy)
    }

    const name = collectionName(path)
    const snap = await query.get()

    return snap.docs.map(item => excludeFields(name, item))
  }
}

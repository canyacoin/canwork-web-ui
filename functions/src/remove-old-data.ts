import { Firestore, DocumentReference } from '@google-cloud/firestore'

const delta = 365 * 24 * 60 * 60 * 1000
export async function prepareData(
  db: Firestore,
  limit = 500,
  timestamp = Date.now() - delta
) {
  const jobsSnap = await db
    .collection('jobs')
    .where('createAt', '<', timestamp)
    .limit(limit)
    .get()
}

export function removeOldData(db: Firestore, refs: DocumentReference[]) {
  const batch = db.batch()
  refs.forEach(ref => batch.delete(ref))
  return batch.commit()
}

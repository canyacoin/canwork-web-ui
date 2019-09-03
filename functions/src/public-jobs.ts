import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'

export function publicJobExists(db: firestore.Firestore) {
  return async ({ slug = '' }: { slug: string }) => {
    if (!slug) {
      if (!(typeof slug === 'string') || slug.length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'The function must be called with one arguments "slug" '
        )
      }
    }
    const jobs = await db
      .collection('public-jobs')
      .where('slug', '>=', slug)
      .limit(1)
      .get()
    return !jobs.empty
  }
}

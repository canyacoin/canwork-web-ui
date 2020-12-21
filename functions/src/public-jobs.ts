import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'

export function getPublicJobIdBySlug(db: firestore.Firestore) {
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
      .where('slug', '==', slug)
      .limit(1)
      .get()
    return jobs.empty ? null : jobs.docs[0].id
  }
}

export function publicJobExists(db: firestore.Firestore) {
  return async (data: { slug: string }) =>
    (await getPublicJobIdBySlug(db)(data)) !== null
}

export function moveInvitesToJob(db: firestore.Firestore) {
  return async (req: functions.Request, resp: functions.Response) => {
    if (req.method !== 'GET') {
      resp.status(405).send('Method Not Allowed')
      return
    }

    try {
      const snap = await db
        .collection('public-jobs')
        .where('visibility', '==', 'invite')
        .get()

      snap.forEach(async docSnap => {
        if (docSnap.get('invites')) {
          return
        }
        const ref = docSnap.ref
        await db.runTransaction(async tx => {
          const jobSnap = await tx.get(ref)
          const invitesSnap = await db
            .collection(`public-jobs/${jobSnap.id}/invites`)
            .get()

          const invites = invitesSnap.docs.map(inviteSnap => inviteSnap.id)
          await tx.update(ref, { invites })
          return
        })
      })
    } catch (e) {
      resp.status(500).send(e)
      return
    }

    resp.status(200).send('ok')
    return
  }
}

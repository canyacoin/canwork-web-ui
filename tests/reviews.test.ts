import { teardown, allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `reviews` collection rules', () => {
  afterAll(async () => {
    await teardown()
  })
  const path = 'reviews/1'
  const data = {
    'reviews/1': {
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 4,
    },
  }

  allow(rules, path, auth.alice, data)
    .read()
    .create({
      reviewerId: 'alice',
      revieweeId: 'bob',
    })
    .update({
      reviewerId: 'alice',
      revieweeId: 'bob',
    })
    .deny()
    .delete()

  deny(rules, path, auth.bob, data, 'non own review')
    .create(
      {
        reviewerId: 'alice',
        revieweeId: 'bob',
        massage: 'Good job Bob',
        rating: 5,
      },
      'with fake "reviewerId"'
    )
    .update({ rating: 5 })
    .delete()
    .allow()
    .read()

  deny(rules, path, auth.anonym, data)
    .create({
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 5,
    })
    .update({
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 5,
    })
    .delete()
    .allow()
    .read()
})

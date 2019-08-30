import { allow, deny } from './helpers'
import { auth, rules } from './setup'

describe('Test `reviews` collection rules', () => {
  const path = 'reviews/1'
  const data = {
    [path]: {
      reviewerId: 'alice',
      revieweeId: 'bob',
      massage: 'Good job Bob',
      rating: 4,
    },
  }

  allow({ name: 'Alice tests', rules, path, auth: auth.alice, data })
    .read()
    .create({
      data: {
        reviewerId: 'alice',
        revieweeId: 'bob',
      },
    })
    .update({
      data: {
        reviewerId: 'alice',
        revieweeId: 'bob',
      },
    })
    .deny()
    .delete()
    .runTests()

  deny({
    name: 'Bob tests (non own review)',
    rules,
    path,
    auth: auth.bob,
    data,
  })
    .create({
      data: {
        reviewerId: 'alice',
        revieweeId: 'bob',
        massage: 'Good job Bob',
        rating: 5,
      },
      suffix: 'with fake "reviewerId"',
    })
    .update({ data: { rating: 5 } })
    .delete()
    .allow()
    .read()
    .runTests()

  deny({ name: 'Anonym tests', rules, path, auth: auth.anonym, data })
    .create({
      data: {
        reviewerId: 'alice',
        revieweeId: 'bob',
        massage: 'Good job Bob',
        rating: 5,
      },
    })
    .update({
      data: {
        reviewerId: 'alice',
        revieweeId: 'bob',
        massage: 'Good job Bob',
        rating: 5,
      },
    })
    .delete()
    .allow()
    .read()
    .runTests()
})

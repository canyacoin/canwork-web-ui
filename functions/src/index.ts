import algoliasearch from 'algoliasearch'
import * as doT from 'dot'

// import * as exphbs from 'express-handlebars';
/*
 * Firebase functions to maintain a full text search on Algolia
 * for users who are of type 'Provider' only
 *
 * See ../README.md for setup instructions
 *
 * Basic Check list:
 * 1) Algolia Account created
 * 2) Algolia Index created
 * 3) ENV Variables for: algolia.appid, algolia.apikey, algolia.providerindex
 * 4) These functions are deployed
 *
 */
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as jobEmailfactory from './job-state-email-notification-factory'
import {
  removePublicJobBids,
  removeJobAttachments,
  removePublicJobInvites,
  removeJobs,
  removePublicJobs,
  removeChatMessages,
  removeChatChannels,
  removeTransactions,
} from './remove-old-data'
import { bep20TxMonitor } from './bep20-monitor'
import { listenToChainUpdates } from './listen-chain'

import { timestampConverter } from './timestamp-converter'
import { exportUsers } from './export-users'
import {
  publicJobExists,
  getPublicJobIdBySlug,
  moveInvitesToJob,
} from './public-jobs'

import { firestoreGet, firestoreSelect } from './firestore'

const faker = require('faker')
const fs = require('fs')
const path = require('path')
const Chance = require('chance')
const cors = require('cors')({ origin: true })
const env = functions.config()
// Firebase connectivity
// Should work like this, see: https://github.com/firebase/firebase-admin-node/issues/224
// const app = admin.initializeApp(functions.config().firebase);

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.fbadmin.project_id,
    clientEmail: env.fbadmin.client_email,
    privateKey: env.fbadmin.private_key.replace(/\\n/g, '\n'), // until https://github.com/firebase/firebase-tools/issues/371 is fixed
  }),
  databaseURL: env.fbadmin.database_url,
  storageBucket: env.fbadmin.storage_bucket,
})

const db = admin.firestore()
db.settings({ timestampsInSnapshots: true })

// Algolia client, see also: https://www.npmjs.com/package/algoliasearch
const algoliaClient = algoliasearch(env.algolia.appid, env.algolia.apikey)
const algoliaSearchIndex = algoliaClient.initIndex(env.algolia.providerindex)
const sendgridApiKey = env.sendgrid.apikey
const chance = new Chance()

const serviceConfig = getFirebaseInstance(env.fbadmin.project_id)

const welcomeEmailTemplateHTML = doT.template(
  fs.readFileSync(
    path.join(__dirname, '../src/templates', 'email-welcome.html'),
    'utf8'
  )
)

const approvedProviderTemplateHTML = doT.template(
  fs.readFileSync(
    path.join(__dirname, '../src/templates', 'email-approved-provider.html'),
    'utf8'
  )
)

exports.canyaSupportNotification = functions.https.onRequest(
  async (request, response) => {
    cors(request, response, async () => {
      if (request.method !== 'POST') {
        return response
          .status(405)
          .type('application/json')
          .send({ message: 'Method Not Allowed', supportedMethods: 'POST' })
      }

      const emailAddress: string = request.body.emailAddress
      const message: string = request.body.message
      const subject: string = request.body.subject

      try {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(sendgridApiKey)
        const msg = {
          to: emailAddress,
          from: 'support@canwork.io',
          subject: subject,
          text: message,
        }
        const r = await sgMail.send(msg)
        console.log('+ email response was', r)
        return response
          .status(201)
          .type('application/json')
          .send({ message: 'Provider was notified', email: emailAddress })
      } catch (error) {
        console.log(error)
        return response
          .status(404)
          .type('application/json')
          .send({ message: `Email not sent` })
      }
    })
  }
)

exports.sendEmail = functions.https.onRequest(async (request, response) => {
  // TODO: move to express middleware
  if (
    !request.headers.authorization ||
    request.headers.authorization !== env.dev.authkey
  ) {
    return response.status(403).send('Unauthorized')
  }

  console.log('+ serviceConfig', serviceConfig)

  const html = welcomeEmailTemplateHTML({
    name: 'CanWork',
    uri: serviceConfig.uri,
  })

  // const app = admin.app();
  // console.log('+ firebase project:', app.options.projectId);

  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(sendgridApiKey)
  const msg = {
    to: 'chrisy@canwork.io',
    from: 'support@canwork.io',
    subject: 'Welcome to CanWork',
    text: 'text version of content here',
    html: html,
  }
  const r = await sgMail.send(msg)

  return response
    .status(201)
    .type('application/json')
    .send({ r })
})

/*
  Send an email notification based on job status change.
  Passed in the json body via HTTP POST:
  {
     "jobAction": "<ActionType>",   // From the enum used in the UI for job states
     "jobId": "xxxx"                // the job collection id to operate on
  }

  And a status is returned, 201 (created) for success
 */
exports.jobStateEmailNotification = functions.https.onRequest(
  (request, response) => {
    cors(request, response, async () => {
      if (request.method !== 'POST') {
        return response
          .status(405)
          .type('application/json')
          .send({ message: 'Method Not Allowed', supportedMethods: 'POST' })
      }
      console.log('+ jobStateEmailNotification')
      if (
        !request.headers.authorization ||
        (!request.headers.authorization.toString().startsWith('Bearer ') &&
          !request.headers.authorization.toString().startsWith('Internal '))
      ) {
        console.error(
          'No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>'
        )
        return response
          .status(403)
          .type('application/json')
          .send({
            message: 'Unauthorized, missing or incorrect authorization header',
          })
      }

      const jobAction: string = request.body['jobAction']
      const jobId: string = request.body['jobId']

      if (!jobAction || !jobId) {
        console.error('! bad request body parameters', request.body)
        return response
          .status(422)
          .type('application/json')
          .send({
            message:
              'Unprocessable entity, missing or invalid parameters in request body',
          })
      }
      console.log(
        `+ notification request for jobId: ${jobId} with jobAction: ${jobAction}`
      )

      if (request.headers.authorization.toString().startsWith('Bearer ')) {
        const bearerToken = request.headers.authorization
          .toString()
          .split('Bearer ')[1]
        console.log(
          '+ checking id token: ',
          `${bearerToken.substr(0, 5)}.....${bearerToken.substr(
            bearerToken.length - 5
          )}`
        )

        await app
          .auth()
          .verifyIdToken(bearerToken)
          .catch(error => {
            console.error('! unable to verify token: ', error)
            return response
              .status(403)
              .type('application/json')
              .send({
                message: 'Forbidden, invalid or expired authorization header',
              })
          })
      }

      if (request.headers.authorization.toString().startsWith('Internal ')) {
        const internalToken = request.headers.authorization
          .toString()
          .split('Internal ')[1]
        console.log(
          '+ checking internal token: ',
          `${internalToken.substr(0, 5)}.....${internalToken.substr(
            internalToken.length - 5
          )}`
        )

        if (internalToken !== env.internal.authkey) {
          console.error('! unable to verify token')
          return response
            .status(403)
            .type('application/json')
            .send({
              message: 'Forbidden, invalid or expired authorization header',
            })
        }
      }

      const jobStateEmailer = jobEmailfactory.notificationEmail(jobAction)

      if (jobStateEmailer === undefined) {
        return response
          .status(501)
          .type('application/json')
          .send({
            message: `There is no AEmailNotification class for type ${jobAction}`,
          })
      }

      try {
        await jobStateEmailer.interpolateTemplates(db, jobId)
      } catch (error) {
        console.error('! unable to interpolateTemplates(): ', error)
        return response
          .status(500)
          .type('application/json')
          .send({ message: error })
      }

      jobStateEmailer.deliver(sendgridApiKey, serviceConfig.uri)
      return response
        .status(201)
        .type('application/json')
        .send({ message: 'ok' })
    })
  }
)

/**
 * Listen for public-job creations and create slug field
 * Add createAt updateAt field
 */
exports.createSlugWhenJobCreated = functions.firestore
  .document('public-jobs/{jobId}')
  .onCreate(async snap => {
    const data = snap.data()
    const jobId = snap.id
    const slug = data.slug
    const timestamp = Date.now()

    await db.doc(`public-jobs/${jobId}`).update({
      createAt: timestamp,
      updateAt: timestamp,
    })

    !slug &&
      createSlugIfNotExist(
        'public-jobs',
        jobId,
        joinString(data.information.title)
      ).catch(err => console.error(err))
  })

// update updateAt
exports.updatepublicJobTimeStamp = functions.firestore
  .document('public-jobs/{jobId}')
  .onUpdate(async snap => {
    const timestamp = Date.now()
    const beforeData = snap.before.data()

    if (!beforeData.updateAt || timestamp - beforeData.updateAt > 3000) {
      await db
        .doc(`public-jobs/${snap.after.id}`)
        .update({ updateAt: timestamp })
    }
  })

/**
 * create timestamp when job created
 */
exports.createTimestampWhenJobCreated = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async snap => {
    const timestamp = Date.now()

    await db.doc(`jobs/${snap.id}`).update({
      createAt: timestamp,
      updateAt: timestamp,
    })
  })

/**
 * update timestamp when job updated
 */
exports.updateJobTimeStamp = functions.firestore
  .document('jobs/{jobId}')
  .onUpdate(async snap => {
    const timestamp = Date.now()
    const beforeData = snap.before.data()

    if (!beforeData.updateAt || timestamp - beforeData.updateAt > 3000) {
      await db.doc(`jobs/${snap.after.id}`).update({ updateAt: timestamp })
    }
  })

/*
 * Listen for user creations and created an associated algolia record
 * Also send a welcome email, and flag their user object: welcomeEmailSent: true
 */
exports.indexProviderData = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const objectId = snap.id

    !data.slug &&
      createSlugIfNotExist(
        'users',
        objectId,
        joinString(data.name)
      ).catch(err => console.error(err))

    const workData = buildWorkData(objectId)

    // TODO: When firestore supports case insensitive queries, we won't need this redundant field
    console.log('+ eth addy', data.ethAddress)
    if (data.ethAddress && data.ethAddress !== data.ethAddress.toUpperCase()) {
      console.log(
        '+ updating eth address for fast lookup: ',
        data.ethAddress.toUpperCase()
      )
      await db
        .collection('users')
        .doc(objectId)
        .update({ ethAddressLookup: data.ethAddress.toUpperCase() })
    }

    if (shouldSkipIndexing(data)) return null

    // this makes sure that ALL hourly rate is treated as a float.
    const hourlyRateNumber = parseFloat(data.hourlyRate)
    data.hourlyRate = hourlyRateNumber
    return algoliaSearchIndex.addObject({
      objectID: objectId,
      ...data,
      workData,
    })
  })

/*
 * Listen for user modifications and update the associated algolia record
 * Note: algolia client does not support update, so we delete old, and create new instead
 */
exports.updateIndexProviderData = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (snap, context) => {
    const beforeData = snap.before.data()
    const afterData = snap.after.data()

    const objectId = snap.after.id

    if (!beforeData.name && afterData.name) {
      createSlugIfNotExist('users', objectId, afterData.name).catch(err =>
        console.error(err)
      )
    }

    console.log('+ looking for admin privileges')
    if (afterData.isAdmin) {
      console.log(
        '+ setting user claim to admin for userId: ${objectId} and email: ' +
          afterData.email
      )
      // The new custom claims will propagate to the user's ID token the
      // next time a new one is issued.
      try {
        await admin.auth().setCustomUserClaims(objectId, { admin: true })
      } catch (error) {
        console.log('! unable to set admin claim:', error)
      }
    } else {
      console.log('+ non admin user being updated')
    }

    // Check if the user was just white listed, and send email
    const userHasBeenWhitelisted =
      !beforeData.whitelisted && afterData.whitelisted
    const userIsWhitelistedButEmailIsNotSent =
      afterData.whitelisted && !afterData.sentApprovedEmail
    if (userHasBeenWhitelisted) {
      notifyAdminOnNewUser(afterData)
    }
    if (userHasBeenWhitelisted || userIsWhitelistedButEmailIsNotSent) {
      console.log('+ sending a accepted provider email...')

      const user = afterData
      const html = approvedProviderTemplateHTML({ name: user.name })

      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(sendgridApiKey)
      sgMail.setSubstitutionWrappers('{{', '}}')
      sgMail.send(
        {
          to: user.email,
          from: 'support@canwork.io',
          subject: `You have been approved as a CanWork provider!`,
          html: html,
          substitutions: {
            title: `Congratulations, ${user.name}. 🎉🎊🎉`,
            returnLinkText: `Edit my profile`,
            returnLinkUrl: `https://app.canwork.io/profile/edit`,
          },
          templateId: '4fc71b33-e493-4e60-bf5f-d94721419db5',
        },
        async (error, result) => {
          if (error) {
            console.error('! error sending message:', error.response.body)
          }
          await db
            .collection('users')
            .doc(objectId)
            .update({ sentApprovedEmail: true })
        }
      )
    }

    if (
      afterData.welcomeEmailSent &&
      afterData.welcomeEmailSent === false &&
      afterData.testUser !== true
    ) {
      console.log('+ sending a user email...')

      const html = welcomeEmailTemplateHTML({
        name: afterData.name,
        uri: serviceConfig.uri,
      })

      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(sendgridApiKey)
      const msg = {
        to: afterData.email,
        from: 'support@canwork.io',
        subject: 'Welcome to CanWork',
        html: html,
      }
      const r = await sgMail.send(msg)
      console.log('+ email response was', r)
      await db
        .collection('users')
        .doc(objectId)
        .update({ welcomeEmailSent: true })
    }

    if (shouldSkipIndexing(afterData)) return null

    console.log('+ remove index record for update operation...', objectId)
    await algoliaSearchIndex.deleteObject(objectId)
    console.log('+ deleted...', objectId)

    const workData = buildWorkData(objectId)
    // this makes sure that ALL hourly rate is treated as a float.
    const hourlyRateNumber = parseFloat(afterData.hourlyRate)
    afterData.hourlyRate = hourlyRateNumber
    console.log(afterData)
    return algoliaSearchIndex.addObject({
      objectID: objectId,
      ...afterData,
      workData,
    })
  })

function notifyAdminOnNewUser(user) {
  console.log('+ sending a new provider email to admin...')

  const text = `
  Link to profile: https://canwork.io/profile/${user.slug}
  <br>
  Email address: ${user.email}
  <br>
  Referred by: ${user.referredBy}
  `
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(sendgridApiKey)
  console.log('+ first chars: ', sendgridApiKey.substring(0, 5))
  sgMail.setSubstitutionWrappers('{{', '}}')
  const senderAddress = 'support@canwork.io'
  const senderName = 'CanWork Support'

  sgMail.send(
    {
      to: 'support@canwork.io',
      from: {
        name: senderName,
        email: senderAddress,
      },
      subject: `New Provider`,
      html: text,
    },
    async error => {
      if (error) {
        console.error('! error sending message:', error.response.body)
      }
    }
  )
}

/*
 * Listen for profile (work array) modifications and update the users collection tag set
 * This in turn should trigger an Algolia update, because it will trigger 'updateIndexProviderData' to execute
 */
exports.updateUserSkillsTagData = functions.firestore
  .document('portfolio/{userId}/work/{workId}')
  .onUpdate(async (snap, context) => {
    const skillsTagData = []
    const workDataSnapshot = await db
      .collection(`portfolio/${context.params.userId}/work`)
      .get()
    workDataSnapshot.forEach(doc => {
      for (const tag of doc.data().tags) {
        skillsTagData.push(tag)
      }
    })

    const workSkillTags = Array.from(new Set(skillsTagData.sort()))

    return db
      .collection(`users/`)
      .doc(context.params.userId)
      .update({ workSkillTags })
  })

/*
 * Listen for user deletions and remove the associated algolia record
 */
exports.removeIndexProviderData = functions.firestore
  .document('users/{userId}')
  .onDelete((snap, context) => {
    const objectId = snap.id
    return algoliaSearchIndex.deleteObject(objectId)
  })

/*
 * Make sure this user record belongs to a provider
 */
function shouldSkipIndexing(user: any) {
  if (user && user.type) {
    return (
      user.type.toLowerCase() !== 'provider' ||
      (!user.whitelisted && user.state !== 'Done')
    )
  } else {
    return true
  }
}

/*
 * Build up the providers work data from the related portfolio collection
 */
async function buildWorkData(userID: string) {
  const workData = []
  const workDataSnapshot = await db.collection(`portfolio/${userID}/work`).get()
  workDataSnapshot.forEach(doc => {
    workData.push({
      title: doc.data().title,
      desc: doc.data().description,
      tags: doc.data().tags,
    })
  })
  return workData
}

/*
 * Firebase function to remove seeded providers (users + provider data)
 */
exports.deleteAllProviders = functions.https.onRequest(
  async (request, response) => {
    // TODO: move to express middleware
    if (
      !request.headers.authorization ||
      request.headers.authorization !== env.dev.authkey
    ) {
      return response.status(403).send('Unauthorized')
    }

    let deletedUsers = 0
    const userDataSnapshot = await db
      .collection(`users`)
      .where('testUser', '==', true)
      .get()
    userDataSnapshot.forEach(async doc => {
      console.log('+ deleting user: ', doc.data().objectId)
      try {
        await admin.auth().deleteUser(doc.data().objectId)
      } catch (e) {
        console.log('+ unable to delete auth user', e)
      }
      try {
        await db
          .collection('portfolio')
          .doc(doc.data().objectId)
          .delete()
      } catch (e) {
        console.log('+ unable to delete portfolio user', e)
      }
      try {
        await db
          .collection('users')
          .doc(doc.data().objectId)
          .delete()
      } catch (e) {
        console.log('+ unable to delete user', e)
      }
      deletedUsers++
    })

    return response
      .status(202)
      .type('application/json')
      .send({ deletedUsers })
  }
)

/*
 * Firebase function to seed providers (users + provider data)
 */
exports.seedProviders = functions.https.onRequest(async (request, response) => {
  // TODO: move to express middleware
  if (
    !request.headers.authorization ||
    request.headers.authorization !== env.dev.authkey
  ) {
    return response.status(403).send('Unauthorized')
  }

  const qty = request.query.qty || 1

  const users = []
  for (let i = 0; i < qty; i++) {
    let newUser

    try {
      newUser = await admin.auth().createUser({
        email: chance.email(),
        emailVerified: true,
        password: chance.word({ length: 16 }),
        displayName: chance.name(),
        photoURL: faker.image.avatar(),
        disabled: false,
      })
      users.push({ name: newUser.displayName, email: newUser.email })
    } catch (error) {
      console.error('! unable to create auth user record', error)
    }

    // // Insert into user table
    let userRecord
    try {
      userRecord = {
        objectId: newUser.uid,
        '@content': 'http://schema.org',
        '@type': 'Person',
        type: 'Provider',
        address: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        work: newUser.email,
        bscAddress: '0xc4e40e873f11510870ed55ebc316e3ed17753b22',
        avatar: { uri: newUser.photoURL },
        bio: chance.sentence({ words: Math.floor(Math.random() * 30 + 1) }),
        category: getCategories()[Math.floor(Math.random() * 6)].toUpperCase(),
        colors: [],
        description: chance.paragraph({
          sentences: Math.floor(Math.random() * 4 + 1),
        }),
        hourlyRate: chance.integer({ min: 1, max: 250 }),
        phone: chance.phone({ mobile: true }),
        timestamp: chance.timestamp(),
        title: chance.profession(),
        timezone: chance.timezone().utc[0],
        state: 'Done',
        skillTags: getRandomTags(6),
        testUser: true,
        verified: false,
      }
      console.log('+ add user record: ', userRecord)
      await db
        .collection('users')
        .doc(newUser.uid)
        .set(userRecord)
    } catch (error) {
      console.error('! unable to create user record', error)
      return response.status(500)
    }

    // Insert into portfolio with work items
    //let workRecords = [];

    for (let index = 0; index < Math.floor(Math.random() * 5 + 1); index++) {
      const work = {
        title: chance.word(),
        description: chance.sentence({ words: 5 }),
        image: faker.image.image(),
        link: chance.url({ protocol: 'https' }),
        state: 'Done',
        timestamp: chance.timestamp(),
        tags: getRandomTags(6),
      }
      try {
        await db
          .collection('portfolio')
          .doc(newUser.uid)
          .collection('work')
          .add(work)
      } catch (error) {
        console.error('! unable to create portfolio work records', error)
        return response.status(500)
      }
    }
  }
  return response
    .status(201)
    .type('application/json')
    .send(users)
})

/*
 * Firebase function to seed skill tag data (invoke with HTTP GET)
 */
exports.seedSkillTagsData = functions.https.onRequest(
  async (request, response) => {
    // TODO: move to express middleware
    if (
      !request.headers.authorization ||
      request.headers.authorization !== env.dev.authkey
    ) {
      return response.status(403).send('Unauthorized')
    }

    let tags: string[]

    tags = Array.from(new Set(getTags())).sort()

    for (const tag of tags) {
      await db.collection('skill-tags').add({ tag })
    }

    return response
      .status(201)
      .type('application/json')
      .send({ 'loaded-tags': tags.length })
  }
)

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomTags(max: number): string[] {
  const array = getTags()
  let currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array.slice(0, randomIntFromInterval(0, max))
}

function getFirebaseInstance(projectId: string) {
  // Set this up from: ../.firebaserc
  const instances = [
    {
      projectId: 'canwork-staging',
      uri: 'https://canwork-staging.web.app/',
      environment: 'staging',
    },
    {
      projectId: 'can-work-io',
      uri: 'https://app.canwork.io',
      environment: 'prod',
    },
  ]

  for (const project of instances) {
    if (project.projectId === projectId) {
      return project
    }
  }
  return instances[0]
}

// Later we can get these direct from a google spreadsheet or something central
function getTags(): string[] {
  return [
    'Customer Service',
    'Customer Support',
    'Transcription',
    'Virtual Assistant',
    'Translator - Japanese',
    'Translator - Chinese Mandarin',
    'Translator - English',
    'Translator - French',
    'Translator - Spanish',
    'Translator - Korean',
    'Community Management',
    'Tech Support',
    'Phone Support',
    'Web Research',
    'Customer Service Representative',
    'Data Entry',
    'Data Mining',
    'Data',
    'Sales Management',
    'HR',
    'Project Management',
    'Content Creators',
    'Blog Writing',
    'Editing',
    'Proof Reading',
    'Resume Writing',
    'Voice Acting',
    'Creative Writing',
    'Writing',
    'Copywriting',
    'Whitepaper',
    'Content',
    'Ghost Writing',
    'Technical Writing',
    'Grants',
    'Translation',
    'Lead Generation',
    'Assistant',
    'Data Scraping',
    'Social Media',
    'Social Media Marketing',
    'Email Marketing',
    'Social Media Manager',
    'EDM',
    'SEO',
    'SEM',
    'Marketing Strategy',
    'Business',
    'Accounting',
    'BA',
    'Business Analysis',
    'Investment Researching',
    'Business Modelling',
    'Tax',
    'Financial Reporting',
    'Bookkeeping',
    'Financial Planning',
    'CFO',
    'Token Sale',
    'ICO',
    'Software',
    'Software Development',
    'DApps',
    'Blockchain',
    'Game Development',
    'ecommerce',
    'Web Development',
    'Wordpress',
    'AI',
    'Bots',
    'Databases',
    'Security',
    'Information Security Analyst',
    'Design',
    'Creative',
    'Logo',
    'Graphic Design',
    'Illustration',
    'UI',
    'UX',
    'UI / UX',
    'Publication',
    'Onepager',
    'Formatting',
    'Whitepaper',
    'Brochure',
    'Print Design',
    'Animation',
    'Flat Animation',
    '3D Animation',
    'Stop Motion Animation',
    'Photo Editors',
    'Web Design',
    'Print',
    'Packaging',
    'Industrial Design',
    'Mobile',
    'Full Website',
    'Landing Page',
    'Business Card',
    'Poster',
    'Layout Design',
    'Interaction Design',
    '3D',
    'Flat',
    'Pixel Art',
    'UX Research',
    'Wireframes',
    'Brand Strategy',
    'CRM Consultancy',
    'Ebooks',
    'Squarespace',
    'Smart Contracts',
    'Business Development',
    'Research',
    'Consultant',
    'Writing',
    'Facebook',
    'Instagram',
    'Twitter',
    'Telegram',
    'Back - End Development',
    'Front - End Development',
    'Full Stack Development',
    'Software Engineer',
    'Sales Consultant',
    'Android',
    'iOS',
    'C++',
    'C#',
    'C',
    'Java',
    'Javascript',
    'HTML',
    'CSS',
    'Ethereum',
    'Node.js',
    'React',
    'Angular',
    'PHP',
    'Solidity',
    'jQuery',
    'Firebase',
    'Ruby on Rails',
    'Python',
    'Rust',
    'Ethereum',
    'Bitcoin',
    'Neo',
    'Swift',
    'XCode',
    'Objective-C',
    'Swift',
    'Elixir',
    'Go',
    'Golang',
    'Dart',
    'Traditional Media',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe Indesign',
    'Sketchbook',
    'Solid Works',
    'VR Gravity',
    'Sketch',
    'Adobe XD',
    'Axura',
    'Balsamiq',
    'Invision',
    'Zeplin',
    'Mockflow',
    'Innovation Studio',
    'Figma',
    'Web Flow',
    'Flinto',
    'Dyno Mapper',
    'Omnigraffle',
    'Power Mapper',
    'Smart Draw',
    'JustInMind',
    'UXPin',
    'Fluid UI',
    'Pidoco',
    'Adobe After Effects',
    'Adobe Animate',
    'Autodesk Maya',
    'Blender',
    '3DS Max',
    'Source Movie Maker',
    'Stop Motion Pro Eclipse',
    'Dragon Frame',
    'Harmony',
    'SynFig Studio',
    'AnimatorHD',
    'StopMotion Studio',
    'qStudio',
    'Aurora3d',
    'ZBrush',
    'Modo',
    'Cinema 4D',
    'Hiundini',
    'Modo',
    'IKITMovie',
    'Wix',
    '4Square',
    'Affinity Designer',
    'Impact Arden Software',
    'Esko Cape System',
    'MYOB',
    'Inuit Quickbooks',
    'Xero',
    'Token Books',
    'Facebook',
    'Instagram',
    'Pinterest',
    'MailChimp',
    'ActiveCampaign',
    'Hootsuite',
    'SalesForce',
    'Marketo',
    'ZenDesk',
    'Hubstpot',
    'Microsoft Word',
    'Microsoft Excel',
    'Microsoft Power Point',
    'Data Mining',
    'Data Analytics',
    'Desk.com',
    'ZenDesk',
    'Non Fiction',
    'Fiction',
    "API's",
    'Microservices',
  ]
}

function getCategories(): string[] {
  return [
    'Content Creators',
    'Designers & Creatives',
    'Marketing & SEO',
    'Software developers',
    'Virtual assistants',
  ]
}

// ignore that case: update manually in firebase console and happen to conflict with the exist one
async function createSlugIfNotExist(
  collectionPath: string,
  id: string,
  expectedSlug: string
) {
  let flag: boolean = true
  let slug: string = joinString(expectedSlug)

  while (flag) {
    slug += `-${Math.floor(Math.random() * 1000)}`
    const result = await db
      .collection(collectionPath)
      .where('slug', '==', slug)
      .get()
    flag = !!result.size
  }
  await db.doc(`${collectionPath}/${id}`).update({ slug })
}

function joinString(str: string = ''): string {
  return str
    .toLocaleLowerCase()
    .split(' ')
    .join('-')
}

/*
 * cloud https function to init slug of users collection & jobs collection
 */
exports.initSlug = functions.https.onRequest(async (request, response) => {
  const usersnaps = await db.collection('users').get()
  const jobsnaps = await db.collection('public-jobs').get()

  usersnaps.forEach(async doc => {
    const data = doc.data()
    !data.slug &&
      createSlugIfNotExist(
        'users',
        doc.id,
        joinString(doc.data().name)
      ).catch(err => console.error(err))
  })
  jobsnaps.forEach(async doc => {
    const data = doc.data()
    !data.slug &&
      createSlugIfNotExist(
        'public-jobs',
        doc.id,
        joinString(doc.data().information.title)
      ).catch(err => console.error(err))
  })

  return response
    .status(200)
    .type('application/json')
    .send({
      status: 0,
      msg: `init all slug succ!`,
    })
})

/*
 * cloud https function to delete all slug
 */
exports.delSlug = functions.https.onRequest(async (request, response) => {
  const usersnaps = await db.collection('users').get()
  const jobsnaps = await db.collection('public-jobs').get()

  usersnaps.forEach(async doc => {
    const data = doc.data()
    data.slug && (await db.doc(`users/${doc.id}`).update({ slug: '' }))
  })
  jobsnaps.forEach(async doc => {
    const data = doc.data()
    data.slug && (await db.doc(`public-jobs/${doc.id}`).update({ slug: '' }))
  })

  return response
    .status(200)
    .type('application/json')
    .send({
      status: 0,
      msg: `del all slug succ!`,
    })
})

/*
 * cloud https function to set "verified" field of users to "false" for those that don't have this field
 */
exports.initVerifiedUserField = functions.https.onRequest(
  async (request, response) => {
    const limit = 100
    let total = 0
    let last = null
    let users = await db
      .collection('users')
      .orderBy('slug')
      .limit(limit)
      .get()

    while (users.docs.length > 0) {
      await Promise.all(
        users.docs.map(async doc => {
          const user = doc.data()
          !user.verified &&
            (await db.doc(`users/${doc.id}`).update({ verified: false }))
        })
      )
      total += users.docs.length
      last = users.docs[users.docs.length - 1]
      users = await db
        .collection('users')
        .orderBy('slug')
        .startAfter(last)
        .limit(limit)
        .get()
    }

    return response
      .status(200)
      .type('application/json')
      .send({
        status: 0,
        msg: `Created "verified" field for all ${total} users!`,
      })
  }
)

/*
 * remove old data
 */

// remove jobs
exports.removeJobs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(removeJobs(db))

// remove public-jobs
exports.removePublicJobs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(removePublicJobs(db))

// remove chat messages
exports.removeChatMessages = functions.pubsub
  .schedule('every 1 hours')
  .onRun(removeChatMessages(db))

// remove chat channels
exports.removeChatChannels = functions.pubsub
  .schedule('every 1 hours')
  .onRun(removeChatChannels(db))

// remove transactions
exports.removeTransactions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(removeTransactions(db))

// triggers
// remove job attachments
exports.removeJobAttachments = functions.firestore
  .document('jobs/{jobId}')
  .onDelete(removeJobAttachments(app.storage()))

// remove public job bids
exports.removePublicJobBids = functions.firestore
  .document('public-jobs/{jobId}')
  .onDelete(removePublicJobBids(db))

// remove public job invites
exports.removePublicJobInvites = functions.firestore
  .document('public-jobs/{jobId}')
  .onDelete(removePublicJobInvites(db))

// timestamp converter
exports.timestampConverter = functions.https.onRequest(timestampConverter(db))

// export users
exports.exportUsers = functions.https.onRequest(exportUsers(db, sendgridApiKey))

// functions for `public-jobs` collection
exports.publicJobExists = functions.https.onCall(publicJobExists(db))
exports.getPublicJobIdBySlug = functions.https.onCall(getPublicJobIdBySlug(db))

exports.moveInvitesToJob = functions.https.onRequest(moveInvitesToJob(db))

// firestore funcs
exports.firestoreGet = functions.https.onCall(firestoreGet(db))
exports.firestoreSelect = functions.https.onCall(firestoreSelect(db))

// bep20 tx monitor
exports.bep20TxMonitor = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(bep20TxMonitor(db))
  
// listen to chain monitor updates and save into bep20 tx monitor table
// and process instantly using same (todo refactor to common) functions from scheduled bep20 tx monitor
// with some tweak (no token and no amount, we have to calculate it)
// using same table, if first invocation fails, scheduled process will retry up to succes
exports.listenToChainUpdates = functions.https.onRequest(
  async (request, response) => {
    cors(request, response, async () => {
      await listenToChainUpdates(request, response, db, env)
    })
  }
)

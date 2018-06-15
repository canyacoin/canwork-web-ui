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
import * as algoliasearch from 'algoliasearch';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Firebase connectivity
admin.initializeApp();
const db = admin.firestore();
const env = functions.config();

// Algolia client, see also: https://www.npmjs.com/package/algoliasearch
const algoliaClient = algoliasearch(env.algolia.appid, env.algolia.apikey);
const algoliaSearchIndex = algoliaClient.initIndex(env.algolia.providerindex);

/*
 * Listen for user creations and created an associated algolia record
 */
exports.indexProviderData = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const objectId = snap.id;

    if (shouldSkipIndexing(data.type))
      return;

    const workData = buildWorkData(objectId);

    return algoliaSearchIndex.addObject({
      objectID: objectId,
      ...data,
      workData
    });

  });

/*
 * Listen for user modifications and update the associated algolia record
 * Note: algolia client does not support update, so we delete old, and create new instead
 */
exports.updateIndexProviderData = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (snap, context) => {
    const data = snap.after.data();
    const objectId = snap.after.id;


    console.log('+ remove item for update...', objectId);
    await algoliaSearchIndex.deleteObject(objectId);
    console.log('+ deleted...', objectId);

    if (shouldSkipIndexing(data.type))
      return;

    const workData = buildWorkData(objectId);

    return algoliaSearchIndex.addObject({
      objectID: objectId,
      ...data,
      workData
    });
  });

/*
 * Listen for user deletions and remove the associated algolia record
 */
exports.removeIndexProviderData = functions.firestore
  .document('users/{userId}')
  .onDelete((snap, context) => {
    const objectId = snap.id;
    return algoliaSearchIndex.deleteObject(objectId);
  });

/*
 * Listen for profile (work array) modifications and update the users collection tag set
 * This in turn should trigger an Algolia update, because it will trigger 'updateIndexProviderData' to execute
 */
exports.updateUserSkillsTagData = functions.firestore
  .document('portfolio/{userId}/work/{workId}')
  .onWrite(async (snap, context) => {
    const objectId = snap.after.id;

    const skillsTagData = [];
    const workDataSnapshot = await db.collection(`portfolio/${context.params.userId}/work`).get();
    workDataSnapshot.forEach(doc => {
      for (const tag of doc.data().tags) {
        skillsTagData.push(tag);
      }
    });

    const workSkillTags = Array.from(new Set(skillsTagData.sort()));

    return db.collection(`users/`)
      .doc(context.params.userId)
      .update({ workSkillTags });
  });

/*
 * Make sure this user record belongs to a provider
 */
function shouldSkipIndexing(userType: string) {
  return (userType === undefined || userType.toLowerCase() !== 'provider');
}

/*
 * Build up the providers work data from the related portfolio collection
 */
async function buildWorkData(userID: string) {
  const workData = [];
  const workDataSnapshot = await db.collection(`portfolio/${userID}/work`).get();
  workDataSnapshot.forEach(doc => {
    workData.push({
      title: doc.data().title,
      desc: doc.data().description,
      tags: doc.data().tags
    });
  })
  return workData;
}

/*
 * Firebase functions to seed skill tag data (invoke with HTTP GET)
 */
exports.seedSkillTagsData = functions.https.onRequest(async (request, response) => {
  let tags: string[];

  tags = Array.from(new Set(getTags())).sort();

  for (const tag of tags) {
    await db.collection('skill-tags').add({ tag });
  }

  return response.status(201)
    .type('application/json')
    .send({ 'loaded-tags': tags.length })
});

// Later we can get these direct from a google spreadsheet or something central
function getTags(): string[] {
  return [
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
  ];
}
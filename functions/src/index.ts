import * as algoliasearch from 'algoliasearch';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const env = functions.config();

const algoliaClient = algoliasearch(env.algolia.appid, env.algolia.apikey);
const algoliaSearchIndex = algoliaClient.initIndex(env.algolia.providerindex);

exports.indexProviderData = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const objectId = snap.id;

    return algoliaSearchIndex.addObject({
      objectId,
      ...data
    });

  });

exports.removeIndexProviderData = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const objectId = snap.id;
    return algoliaSearchIndex.deleteObject(objectId);
  });


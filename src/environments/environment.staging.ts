export const environment = {
  production: false,
  blogFeedUrl: 'https://feed.rssunify.com/5a9322f94d907/rss.xml',
  firebase: {
    apiKey: 'AIzaSyCBkE8UV7x60XzZp-KrX-KYIz7lOdNd9Po',
    authDomain: 'staging-can-work.firebaseapp.com',
    databaseURL: 'https://staging-can-work.firebaseio.com',
    projectId: 'staging-can-work',
    storageBucket: 'staging-can-work.appspot.com',
    messagingSenderId: '320531765618'
  },
  algolia: {
    indexName: 'staging_provider_index',
    appId: 'UMAFX8JMPW',
    apiKey: 'c39e82c3bfe42e665da7e7ab1d79d9d7'
  },
   contracts: {
    useTestNet: true,
    canYaCoin: '0x38d89a3bd248f238fc467cd8a45c548a5b70659e',
    canwork: '0xae713a4428e61bfedacde3480b8699cef2940930'
  },
  backendURI: 'https://us-central1-staging-can-work.cloudfunctions.net'
};

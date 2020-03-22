import algoliasearch from 'algoliasearch'
import { environment } from '../../src/environments/environment'


let args = process.argv.slice(2)
if (args.length !== 1) {
  console.log('No argument provided. Use help to know available commands.')
  process.exit();
}
const action = args[0]

switch (action) {
  case 'help':
    console.log('Avalaible commands:')
    console.log('  help - this message')
    console.log('  listIndexes - list Algolia Indexes')
    console.log('  indexgetSettings - main index get setting')
    console.log('  createReplicaIndex - create and set orderered replica index')
  break
  case 'listIndexes':
    listIndexes()
  break
  case 'indexExist':
    indexgetSettings()
  break
  case 'createReplicaIndex':
    createReplicaIndex()
  break    
  default:
    console.log('Unknown command. Use help to know available commands.')
  break
}

function createReplicaIndex() {
  // https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/how-to/sort-by-attribute/
  console.log(environment.algolia);
  const algoliaClient = algoliasearch(environment.algolia.appId, environment.algolia.apiKey)
  const index = algoliaClient.initIndex(environment.algolia.indexName);
  index.setSettings({
    replicas: [
      'staging_provider_ratingaverage_desc'
    ]
  }).then(() => {
    /*  
    const replicaIndex = client.initIndex('staging_provider_ratingaverage_desc');
    replicaIndex.setSettings({
      ranking: [
        "desc(rating.average)",
        "typo",
        "geo",
        "words",
        "filters",
        "proximity",
        "attribute",
        "exact",
        "custom"
      ]
    }).then(() => {
    });
    */
  });

}


function indexgetSettings() {
  console.log(environment.algolia);
  const algoliaClient = algoliasearch(environment.algolia.appId, environment.algolia.apiKey)
  const index = algoliaClient.initIndex(environment.algolia.indexName);
  index.getSettings().then(settings => {
    console.log(settings);
  });
}

function listIndexes() {
  console.log(environment.algolia);
  const algoliaClient = algoliasearch(environment.algolia.appId, environment.algolia.apiKey)
  algoliaClient.listIndexes().then(({ items }) => {
    console.log(items);
  });
}
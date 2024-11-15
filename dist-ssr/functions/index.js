const functions = require('firebase-functions')

const universalMain = require(__dirname + '/server/main')
exports.ssr = functions
  .runWith({
    memory: '512MB', // default is 256

    /*
todo use only live

example_
// Get Firebase project id from `FIREBASE_CONFIG` environment variable
const envProjectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;

exports.ssr = functions
    .runWith({
      // Keep 5 instances warm for this latency-critical function
      // in production only. Default to 0 for test projects.
      minInstances: envProjectId === "my-production-project" ? '512MB' : '256MB',
    })
    .https.onRequest((req, res) => {
      // render some html
    });

*/

    //minInstances: 1,
    /*
    https://firebase.google.com/docs/functions/manage-functions?gen=1st#reduce_the_number_of_cold_starts
    
    If Cloud Functions for Firebase scales your app above your minInstances setting, you'll experience a cold start for each instance above that threshold.
    Cold starts have the most severe effect on apps with spiky traffic. If your app has spiky traffic and you set a minInstances value high enough that cold starts are reduced on each traffic increase, you'll see significantly reduced latency. For apps with constant traffic, cold starts are not likely to severely affect performance.    

    Note: A minimum number of instances kept running incur billing costs at idle rates.
    Typically, to keep one idle function instance warm costs less than $6.00 a month.
    The Firebase CLI provides a cost estimate at deployment time for functions with reserved minimum instances.
    Refer to Cloud Functions Pricing to calculate costs.
    
    todo configure to use only live
    */
  })
  .https.onRequest(universalMain.app())

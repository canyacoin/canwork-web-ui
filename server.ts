import { enableProdMode, ValueProvider, FactoryProvider } from '@angular/core'

import 'zone.js/node'

/*

domino strategy

ReferenceError: Window is not defined
Working with SSR, you probably already encountered this error if you use any window-dependent library.

You can easily fake window using domino. Just install it

npm install -D domino
*/
const domino = require('domino')

;(global as any).WebSocket = require('ws')
;(global as any).XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

enableProdMode()

const distFolder = join(process.cwd(), 'browser')
//const distFolder = join(process.cwd(), 'dist-ssr/functions/browser')

const template = readFileSync(join(distFolder, 'index.html')).toString()
const win = domino.createWindow(template.toString())

win.process = process // protobufjs fix to confirm node env: https://github.com/protobufjs/protobuf.js/blob/master/src/util/minimal.js#L55
/*
Protobufjs: Error not supported at Root.loadSync
util.isNode = Boolean(
   util.global.process && 
   util.global.process.versions &&  
   util.global.process.versions.node
);
this function gives false but it should not. Taking a look into the utility function, we can see what is happening

util.global = typeof window !== "undefined" && window || 
              typeof global !== "undefined" && global || 
              typeof self   !== "undefined" && self   || 
              this;
If window is defined, then this function returns it and the isNode function relies on it
to check if the environment is node or not!
Knowing this, the fix is super easy: we just need to define process in the window object              
*/

global['window'] = win
/*
global['self'] = win
global['IDBIndex'] = win.IDBIndex
global['getComputedStyle'] = win.getComputedStyle;
*/
global['document'] = win.document

global['navigator'] = win.navigator

/*

ReferenceError: componentHandler is not defined
This is also from FirebaseUI but, at this point, the fix is quite straightforward. Simply add this to your server.ts and you will be good to go

*/
global['componentHandler'] = {
  register: () => {},
}

import { APP_BASE_HREF } from '@angular/common'
import { ngExpressEngine } from '@nguniversal/express-engine'
import * as express from 'express'
import { AppServerModule } from './src/main.server'
const compression = require('compression')
const cacheManager = require('cache-manager')

// firestore
const functions = require('firebase-functions')

const firebaseAdmin = require('firebase-admin')
const firebaseRef = firebaseAdmin.initializeApp()
const expressSession = require('express-session')
const FirebaseStore = require('connect-session-firebase')(expressSession)

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const memoryCache = cacheManager.caching({
    store: 'memory',
    max: 50,
    ttl: 60 * 60 /* 1 hour in seconds*/,
  })

  const server = express()

  server.use(compression({ level: 8 })) // gzip compression

  //const distFolder = join(process.cwd(), 'dist-ssr/can-work/browser')
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index'

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine(
    'html',
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  )

  server.set('view engine', 'html')
  server.set('views', distFolder)

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  )

  // lazy load login only on browser
  server.get('/login', function (req, res) {
    //res.sendFile(join(distFolder, 'browser', 'index.html'));
    res.sendFile(join(distFolder, 'index.html'))
  })

  // All regular routes use the Universal engine
  server.get(
    '*',
    (req, res, next) => {
      // A middleware to check if cached response exists
      console.log('Looking for route in cache: ' + req.originalUrl)
      // try to get the requested url from cache
      memoryCache
        .get(req.originalUrl)
        .then((cachedHtml) => {
          if (cachedHtml) {
            console.log(
              'Page found in cache, rendering from cache : ' + req.originalUrl
            )
            // Cached page exists. Send it.
            res.send(cachedHtml)
          } else {
            // Cached page does not exist.
            // Render a response using the Angular express engine
            next()
          }
        })
        .catch((error) => {
          // if we have an error render using angular univesal
          console.error('memoryCache.get error: ', error)
          next()
        })
    },

    (req, res) => {
      console.log(
        `No cache found, rendering using universal engine: ` + req.originalUrl
      )

      res.render(
        indexHtml,
        {
          req,
          providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
        },
        (err: Error, html: string) => {
          // After angular universal express engine renders the page
          // we cache it so the next requests for this route will be
          // served faster using the middleware defined earlier
          console.log(
            'Page rendered for the first time , caching url: ' + req.originalUrl
          )
          // Cache the rendered `html` for this request url to
          // use for subsequent requests
          // Cache the rendered page and set the cache to be
          // eviced after 300s (5 minutes)
          memoryCache
            .set(req.originalUrl, html, 300)
            .catch((err) => console.log('Could not cache the request', err))

          res.send(html)
        }
      )
    }
  )

  return server
}

function run(): void {
  const port = process.env['PORT'] || 4000

  // Start up the Node server
  const server = app()
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`)
  })
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire
const mainModule = __non_webpack_require__.main
const moduleFilename = (mainModule && mainModule.filename) || ''
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run()
}

export * from './src/main.server'

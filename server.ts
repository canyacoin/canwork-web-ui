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
;(global as any).XMLHttpRequest = require('xhr2')
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const distFolder = join(process.cwd(), 'dist-ssr/functions/browser')

const template = readFileSync(join(distFolder, 'index.html')).toString()
const win = domino.createWindow(template.toString())
global['window'] = win
global['document'] = win.document
global['self'] = win
global['IDBIndex'] = win.IDBIndex
global['document'] = win.document
global['navigator'] = win.navigator
global['getComputedStyle'] = win.getComputedStyle

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

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express()
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

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    })
  })

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

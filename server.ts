import 'zone.js/dist/zone-node';
import 'reflect-metadata';

const domino = require('domino');
const win = domino.createWindow('<h1>Hello world</h1>');

global['window'] = win;
global['document'] = win.document;
global['navigator'] = win.navigator;

// fix runtime: TypeError: Cannot set property 'stringify' of undefined
win.JSON = JSON;
win.JSON.stringify = JSON.stringify;
win.JSON.parse = JSON.parse;
global['JSON'] = win.JSON;
console.log('freeyiyi1994', win.JSON, global['JSON']);

import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as compression from 'compression';

enableProdMode();

export const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const DIST_FOLDER = join(process.cwd(), 'dist');

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', './dist/browser');

app.get('/redirect/**', (req, res) => {
  const location = req.url.substring(10);
  res.redirect(301, location);
});

app.get('*.*', express.static('./dist/browser', {
  maxAge: '1y'
}));

app.get('/*', (req, res) => {
  res.render('index', { req, res }, (err, html) => {
    if (html) {
      res.send(html);
    } else {
      console.error(err);
      res.send(err);
    }
  });
});

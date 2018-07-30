# Canya.Com

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.5.

[![Build Status](https://travis-ci.com/canyaio/can-work.svg?token=FAxKySscNkseqRyx9f3i&branch=master)](https://travis-ci.com/canyaio/can-work)

## Development server

### Clone & Initial Setup:

#### Web App

Once only installations:

```
npm install -g angular-cli firebase-tools
```

```
git clone git@github.com:canyaio/can-work.git
cd can-work
npm install
cp src/environments/environment.ts.sample src/environments/environment.ts
```

Now, go to your firebase account and obtain the database credentials, and update the `firebase` block in `src/environments/environment.ts`

If you have not worked on this project before you will need to create a firebase alias:

```
firebase use --add
# ^^^ Enter your firebase project name when prompted, and then an alias. Use <YOUR_NAME> for example
firebase use <YOUR_NAME>
```

#### Algolia Full Text Search

*NB* A paid plan on firebase is required for external network calls

Create an account for yourself at: https://www.algolia.com

Within that project, create an 'index' called: `localdev_provider_index`

And get your values for 'Application ID' and 'Admin API Key' to use in firebase functions setup (see below)

#### Firebase Functions

```
cd functions/
firebase functions:config:set \
algolia.appid="UMAFX8JMPW" \
algolia.apikey="XXXXX" \
algolia.providerindex="localdev_provider_index" \
sendgrid.apikey="XXXXX"

firebase deploy --only functions
```

If you wish to execute the firebase functions for data management & seeding:

```
firebase functions:config:set dev.authkey="some-random-key-only-you-know"
```

##### Running firebase functions locally (from the project root)

1. Export the path to your credentials json file [as described here](https://firebase.google.com/docs/functions/local-emulator)
2. Output env vars to the runtime file: `firebase functions:config:get > functions/.runtimeconfig.json`
3. Run: `firebase serve`

### Start your app

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Deploying to your firebase instance:

firebase use <YOUR_NAME>
firebase deploy

## oAth Configuration

Assets for oAuth are:

Product Name: `www.canwork.io`
Product Logo: `https://www.canwork.io/assets/img/canya-media-square.png`
Privacy Policy: `https://www.canwork.io/assets/docs/canwork-privacy-policy.pdf`
Terms & Conditions: `https://www.canwork.io/assets/docs/canwork-terms-and-conditions.pdf`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

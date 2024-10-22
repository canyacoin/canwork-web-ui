---

> **Mirror**
> This repo mirrors from Gitlab to Github. Please commit to the Gitlab repo:
> https://gitlab.com/canyacoin/canwork/web-ui

---# CanWork.io

This is an Angular Project, generated using [Angular CLI](https://github.com/angular/angular-cli)

[![pipeline status](https://gitlab.com/canyacoin/canwork/web-ui/badges/master/pipeline.svg)]

_This project uses:_

- Node.js: 16.20.2
- Yarn: 1.22.19
- Angular (@angular/core): 16.2.12
- firebaseui: 6.1.0
- firebaseui-angular: 6.1.4
- @angular/fire: 7.6.1
- firebase: 9.23.0 (as a dependency of @angular/fire, not directly imported)
- Firebase-CLI (firebase-tools): 11.30.0
- Typescript: 4.9.3
- Walletconnect: 2.8.1

TODO: update node engine and dependencies of functions folder to 16

FirebaseUI/Angular compatibility table:
https://github.com/RaphaelJenni/firebaseui-angular#compatibility

Node.js/Typescript/Angular compatibility table:
https://angular.io/guide/versions

Angular build optimization configuration:
https://angular.io/guide/workspace-config#optimization-configuration

## Angular SSR progress

JS artifact patches into dist-ssr/functions/server/main.js:

- "urlParsingNode.pathname.charAt(0)" -> "urlParsingNode.pathname?.charAt(0)" (fix axios issue https://github.com/axios/axios/issues/6069)
- "(self," -> "(typeof self !== 'undefined' && self," (fix dropzone issue https://github.com/zefoy/ngx-dropzone-wrapper/issues/154)
- /self\?\.location/ -> "(typeof self !== 'undefined' && self)?.location" (self.location patch)
- /browserPopupRedirectResolver\=NOT_AVAILABLE_ERROR/ -> "browserPopupRedirectResolver=inMemoryPersistence" (firebase auth server side in memory persistence)

Patches are automated using this command from repository home, after building with "yarn run build:ssr":

```
node ssr-patch.js
```

To deploy only SSR site ans serve function:

```
cd dist-ssr
firebase deploy --only hosting:canwork-ssr,functions:ssr
```

## Setting Up

- [NPM](https://nodejs.org/en/)

- [Firebase CLI](https://www.npmjs.com/package/firebase)

```
npm install -g firebase-tools@11.3.0
```

- [YARN](https://yarnpkg.com/en/docs/install#mac-stable)

```
brew install yarn
```

### Clone & Initial Setup:

Git

```
git clone git@gitlab.com:canyacoin/canwork/web-ui.git
cd web-ui
git checkout -b "yourname"
```

Setup

Prior to running `yarn` ensure your node version is correct according to NVM.
Please install node dependencies with yarn (not npm) and do not generate a package-lock.json file.

```
nvm use
npm install -g yarn
npx husky install
npx husky set .husky/pre-commit "npx pretty-quick --staged"
```

A `.nvmrc` file is included to make this easy if you already use NVM (just `cd` to this projects root folder _with admin privileges_ and run `nvm use` to activate the correct node version)

WINDOWS USERS: `.nvmrc` format file is not supported with windows NVM so you will have to manually include the version number like `nvm use 10.15.3` and if it says its not installed then first do this `nvm install xx.xx.x`

Install node dependencies:

```
yarn
```

### Credentials

**Gitlab CI/CD**

Ask a CanYa Core member for access to the Gitlab Repo as "Maintainer"

Go to the Gitlab -> Settings (Sidebar) -> CI/CD (Sidebar) , scroll to `Variables` and click `Expand`

Scroll to the bottom of the list of credentials and click `reveal values`.

Copy the `ENVIRONMENT_STAGING` value into a file called `environment.ts`, then move that file into the `src/environments` folder.

Build!

**Firebase**

Ask a CanYa Core member for access to the firebase staging app: `staging-can-work`

From inside the repo, log into Firebase

```
firebase login      // Will launch the Google account login page
firebase list       // Double Check you have the project linked
firebase serve      // Serve locally
firebase deploy     // Deploy to staging
```

<!--Now, go to your firebase account and obtain the database credentials, and update the `firebase` block in `src/environments/environment.ts`-->

<!--If you have not worked on this project before you will need to create a firebase alias:-->

<!--```-->
<!--firebase use --add-->
<!--# ^^^ Enter your firebase project name when prompted, and then an alias. Use <YOUR_NAME> for example-->
<!--firebase use <YOUR_NAME>-->
<!--```-->

#### Algolia Full Text Search

_NB_ A paid plan on firebase is required for external network calls

Create an account for yourself at: https://www.algolia.com

Within that project, create an 'index' called: `localdev_provider_index`

And get your values for 'Application ID' and 'Admin API Key' to use in firebase functions setup (see below)

#### Firebase Functions

```
cd functions/
yarn

firebase functions:config:set algolia.appid="UMAFX8JMPW"
firebase functions:config:set algolia.apikey="0a791357564f5d9ba99935170fac4f22"
firebase functions:config:set algolia.providerindex="--FILL THIS OUT--"
firebase functions:config:set sendgrid.apikey="--FILL THIS OUT--"
firebase functions:config:set fbadmin.project_id="--FILL THIS OUT--"
firebase functions:config:set fbadmin.client_email="--FILL THIS OUT--"
firebase functions:config:set fbadmin.private_key="--FILL THIS OUT-- --private can be found by downloading a service account json file"
firebase functions:config:set fbadmin.database_url="--FILL THIS OUT--"
firebase functions:config:set dev.authkey="some-random-key-only-you-know"
firebase functions:config:set internal.authkey="xxx"


cd ../
firebase deploy --only functions
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

```
firebase use <YOUR_NAME>
firebase deploy
```

## oAth Configuration

Assets for oAuth are:

Product Name: `www.canwork.io`
Product Logo: `https://www.canwork.io/assets/img/canya-media-square.png`
Privacy Policy: `https://www.canwork.io/assets/docs/canwork-privacy-policy.pdf`
Terms & Conditions: `https://www.canwork.io/assets/docs/canwork-terms-and-conditions.pdf`

## Deploy to Production

Gitlab CI/CD is used. After committing and merging the change, a pipeline runs:

1. Build a `dist` package for `Staging`
2. Build a `dist` package for `Prod`
3. Deploy to `Staging`
4. Hold for manual deploy to `Prod` <-- You will need to manually approve this

You can view the script here: https://gitlab.com/canya-com/canwork/web-ui/blob/master/.gitlab-ci.yml

Go to Gitlab -> CI/CD (sidebar) -> Pipelines (sidebar).

Find the Build status:

![](https://snag.gy/4TLi6N.jpg)

Find the Deploy status:

![](https://snag.gy/C9gL5c.jpg)

Play it, and wait ~10minutes for it to deploy to production.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### General dev & dev ops notes:

#### Generate a new travis encrypted config file

May require installation and login of [travis ruby command line utility first](https://github.com/travis-ci/travis.rb)

1. Delete the existing encryption env var in [travis settings](https://travis-ci.com/canyaio/can-work/settings)
1. Generate a new encrypted file `travis encrypt-file src/environments/environment.staging.ts`
1. Move the file over the top of the previous version `mv environment.staging.ts.enc src/environments/environment.staging.ts.enc`
1. Update `.travis.yml` `openssl ...` decryption line to match the new xxx_key and xxx_iv environment vars
1. `git push`
1. Check [travis build status](https://travis-ci.com/canyaio/can-work)

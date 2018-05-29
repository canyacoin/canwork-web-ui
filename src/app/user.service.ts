import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/share';

// import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import * as firebase from 'firebase/app';

import * as IPFS from 'ipfs';
import * as OrbitDB from 'orbit-db';
import * as moment from 'moment';

const ipfsOptions = {
  start: true,
  repo: './canya',
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        // Use IPFS dev signal server
        // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
        // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/ipfs/QmckB75XM1rDhGcwT91eBZ2zhinczQw2R9Z6gVxoZ1wPMz'
        // Use local signal server
        // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
      ]
    },
  }
};

@Injectable()
export class UserService {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  uport: any = null;
  web3: any = null;

  ipfs: IPFS = null;
  orbitdb: OrbitDB = null;
  db: any = null;
  docs: any = null;

  orbitObservable: Observable<any>;
  orbitObserver: Observer<any>;

  usersCollectionRef: AngularFirestoreCollection<any>;
  users$: Observable<any[]>;

  constructor(private afs: AngularFirestore) {
    try {
      this.initUport();
      // this.initOrbit();
      this.usersCollectionRef = this.afs.collection<any>('users');
      this.users$ = this.usersCollectionRef.valueChanges();
    } catch (error) {
      console.error('UserService - error', error);
    }
  }

  initUport() {
    this.uport = new (<any>window).uportconnect.Connect('canya.com', {
      clientId: '2of6NrBdHGkHanGfBRcqr4yE6E1ayo542iV',
      signer: (<any>window).uportconnect.SimpleSigner('774e55701f230bc3a07c1d81cc2231c02085f36319c4ae72e1bf23963eac3db8')
    });
    this.web3 = this.uport.getWeb3();
  }

  async initOrbit() {
    this.ipfs = new IPFS(ipfsOptions);
    // this.ipfs.on('error', (e) => console.error('IPFS - error', e) );
    // console.log('ipfs', this.ipfs );

    this.ipfs.on('ready', async () => {
      this.orbitdb = new OrbitDB(this.ipfs, './canya');
      // console.log('orbit - public key', this.orbitdb.key.getPublic('hex') );

      const dbConfig = {
        replicate: true,
        create: true,
        sync: true,
        localOnly: false,
        // type: 'keyvalue',
        // Give write access to ourselves
        admin: [this.orbitdb.key.getPublic('hex')],
        write: ['*'],
      };
      // /orbitdb/QmQ7H4YKg7wYTzDCtSjcNF1YK3Rg6aY8eBMJYtmMSzeRUe/canya.user
      this.db = await this.orbitdb.keyvalue('canya.user', dbConfig);

      // console.log('key', this.db.key, this.db.key.getPublic('hex'));

      /* /////////////////////////////////////////////////// */

      // Listen for updates from peers
      this.db.events.on('ready', (res) => {
        // console.log('db ready', res);
        // console.log('orbitdb - keyvalue', this.db.address.toString(), this.db.get('user'), this.db.get('state') );
        this.orbitObserver.next({ dbLoaded: true });
      });
      // this.db.events.on('synced', (res) => {
      //   console.log('db synced', res);
      // });
      // this.db.events.on('load.progress', (address, hash, entry, progress, total) => {
      //   console.log('db - load.progress', progress, total);
      // });
      this.db.events.on('replicated', (address) => {
        // console.log( 'db - replicated - state', this.db.get('state'), address );
      });
      this.db.events.on('replicate', (address) => console.log('db - replicate', address));
      this.db.events.on('replicate.progress', (address) => console.log('db - replicate progress', address));
      this.db.events.on('write', (res) => {
        const userValue = this.db.get('user');
        const tmpValue = this.db.get('state');
        // console.log('db write', res, userValue, tmpValue);
      });
      await this.db.load();

      /* /////////////////////////////////////////////////// */

      const docsConfig = {
        replicate: true,
        create: true,
        sync: true,
        localOnly: false,
        // Give write access to ourselves
        admin: [this.orbitdb.key.getPublic('hex')],
        write: ['*'],
      };
      this.docs = await this.orbitdb.docs('canya.users', docsConfig);

      /* /////////////////////////////////////////////////// */

      // Listen for updates from peers
      this.docs.events.on('ready', (res) => {
        // console.log('docs ready', res);
        // console.log('orbitdb - docs', this.docs.address.toString() );
        this.orbitObserver.next({ docsLoaded: true });
      });
      // this.docs.events.on('synced', (res) => {
      //   console.log('docs synced', res);
      // });
      // this.docs.events.on('load.progress', (address, hash, entry, progress, total) => {
      //   console.log('docs - load.progress', progress, total);
      // });
      this.docs.events.on('replicated', (address) => {
        // console.log( 'docs - replicated - state', address );
      });
      this.docs.events.on('replicate', (address) => console.log('docs - replicate', address));
      this.docs.events.on('replicate.progress', (address) => console.log('docs - replicate progress', address));
      this.docs.events.on('write', (res) => {
        // console.log('docs write', res);
      });
      await this.docs.load();

      /* /////////////////////////////////////////////////// */
    });

    this.orbitObservable = new Observable((observer) => {
      this.orbitObserver = observer;
    }).share();
    this.orbitObservable.subscribe();
  }

  saveCredentials(credentials: any, type?: string) {
    return new Promise( async (resolve: any, reject: any) => {
      try {
        // credentials['id'] = camelCase(credentials.email);

        // Random avatar
        const rnd = Math.floor(Math.random() * 109) + 1;
        // 'assets/img/placeholder.png'
        if (credentials && !credentials.avatar) {
          credentials['avatar'] = { uri: `assets/img/animals/${rnd}.png` };
        } else {
          if (JSON.stringify(credentials.avatar).toLowerCase().includes('file')) {
            console.log('saveCredentials - includes files', credentials.avatar);
            credentials['avatar'] = { uri: `assets/img/animals/${rnd}.png` };
          }
        }

        // User or Provider?
        // if (type) {
        //   credentials['type'] = type;
        // } else {
        //   credentials['type'] = 'User';
        // }

        credentials['timestamp'] = moment().format('x');
        localStorage.setItem('credentials', JSON.stringify(credentials));
        this.saveUser(credentials);

        // && this.docs
        // console.log('connected - db', this.db, this.docs );
        if (this.db && this.docs) {
          // credentials['_id'] =
          await this.db.set('user', credentials);
          await this.docs.put(credentials);
          const f = this.docs.query((u) => u.address === credentials['address']);
          // console.log('docs', f );
          resolve(credentials);
        } else {
          resolve(credentials);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async connect(type?: string) {
    return new Promise((resolve: any, reject: any) => {

      this.uport.requestCredentials({
        requested: ['avatar', 'name', 'email', 'phone', 'country'],
        notifications: true // We want this if we want to receive credentials
      }).then(async (credentials) => {
        this.saveCredentials(credentials, type).then( (user: any) => {
          resolve(user);
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  loadUserData() {
    this.currentUser = JSON.parse(localStorage.getItem('credentials'));
    console.log('loadUserData - currentUser', this.currentUser);
  }

  getCurrentUser() {
    this.currentUser = JSON.parse(localStorage.getItem('credentials'));
    console.log('getCurrentUser - currentUser', this.currentUser, this.currentUser.address);
    if (this.currentUser && this.currentUser.address) {
      return this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().take(1);
    }
    return null;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  checkDBState() {
    return new Promise((resolve) => {
      if (this.db) {
        this.orbitObservable.take(1).subscribe((dbState) => {
          if (dbState && dbState.dbLoaded) {
            resolve(dbState);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve({ dbLoaded: true });
      }
    });
  }

  checkDOCSState() {
    return new Promise((resolve) => {
      if (!this.db) {
        this.orbitObservable.take(1).subscribe((dbState) => {
          if (dbState && dbState.docsLoaded) {
            resolve(dbState);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve({ docsLoaded: true });
      }
    });
  }

  verify() {
    // Attest specific credentials
    const credentials = JSON.parse(localStorage.getItem('credentials'));
    console.log('credentials', credentials);

    this.uport.attestCredentials({
      sub: credentials.address,
      claim: { 'email': credentials.email },
      exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    });
  }

  saveUser(userModel: any) {
    console.log('saveUser - userModel', userModel, userModel.address);
    if (userModel && userModel.address) {
      const tmpCredentials = userModel;

      console.log('saveUser - tmpCredentials before ', tmpCredentials);

      const credentials = JSON.parse(localStorage.getItem('credentials'));
      for (const key of Object.keys(credentials)) {
        if (!tmpCredentials[key]) {
          tmpCredentials[key] = credentials[key];
        }
      }
      localStorage.setItem('credentials', JSON.stringify(tmpCredentials));
      console.log('saveUser - tmpCredentials after', tmpCredentials);

      // camelCase(userModel.email);
      const ref = userModel.address;
      this.usersCollectionRef.doc(ref).snapshotChanges().take(1).subscribe((snap: any) => {
        console.log('saveUser - payload', snap.payload.exists);
        return snap.payload.exists ? this.usersCollectionRef.doc(ref).update(userModel) : this.usersCollectionRef.doc(ref).set(userModel);
      });
    }
  }

  async saveState(key: string, value: any) {
    return new Promise(async (resolve) => {
      if (this.db) {
        const dbState: any = await this.checkDBState();
        if (dbState && dbState.dbLoaded) {
          console.log('saveState - before', key, value);
          const data = await this.db.set(key, value);
          const tmpValue = this.db.get(key);
          console.log('saveState - after', data, tmpValue);
          resolve(data);
        }
      }
    });
  }

  saveData(key: string, value: any) {
    // if ( value instanceof Array ) {
    //   localStorage.setItem(key, JSON.stringify(value) );
    // } else {
    //   localStorage.setItem(key, value);
    // }
    const credentials = JSON.parse(localStorage.getItem('credentials'));
    if (credentials) {
      credentials[key] = value;
      localStorage.setItem('credentials', JSON.stringify(credentials));
    }

    // dApp
    this.saveState(key, value);

    // Firebase
    if (credentials && credentials.address) {
      const tmpModel: any = {};
      tmpModel[key] = value;
      tmpModel['address'] = credentials.address;
      console.log('saveData - before saveUser', tmpModel);
      this.saveUser(tmpModel);
    }
  }
}

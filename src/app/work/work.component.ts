import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';

import * as moment from 'moment';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css']
})
export class WorkComponent implements OnInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  uniqueId = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);

  conversation: any = [
    { flow: 'This is your opportunity to impress our community with your skills and expertise.', command: 'message' },
    { flow: 'Show your work!', command: 'message' },

    { flow: 'What\'s the title of the project?', command: 'message' },
    { flow: { field: 'title', placeholder: 'e.g. Mail client app', type: 'text', size: 38, icon: { 'ti-id-badge': true } }, command: 'input' },

    { flow: 'Describe your role in the project. Which parts of the project were you responsible for?', command: 'message' },
    { flow: { field: 'description', placeholder: 'Describe your project', type: 'text', size: 40, icon: { 'fa fa-file-o': true } }, command: 'input' },

    { flow: 'Tag the project with relevant skills to help to find your work more easily.', command: 'message' },
    { flow: { field: 'tags', placeholder: 'e.g. HTML, CSS, Photoshop...', type: 'text', size: 42, icon: { 'fa fa-tag': true } }, command: 'input' },

    // { flow: 'Insert a link(URL) of an image stored somewhere else on the Internet.', command: 'message' },
    { flow: 'Embed an image or video from an URL. (Optional)', command: 'message' },
    { flow: { field: 'image', placeholder: 'e.g. https://cdn.dribbble.com/...', type: 'text', size: 44, icon: { 'ti-image': true } }, command: 'input' },

    { flow: 'Enter project URL so our community has something to interact!', command: 'message' },
    { flow: { field: 'link', placeholder: 'https://...', type: 'text', size: 54, icon: { 'fa fa-external-link': true } }, command: 'input' },

    { flow: 'Fantastic! Thanks 👍.', command: 'message' },
    { flow: { field: 'state', actions: [{ caption: 'Add another project', type: 'button' }, { caption: 'Done', type: 'button' }] }, command: 'actions' }
  ];

  // private afDb: AngularFireDatabase
  constructor(private router: Router, private afs: AngularFirestore) {
  }

  ngOnInit() {
    console.log('WOID', this.uniqueId);
  }

  onAction(event: any) {
    console.log('onDone', event.object);
    const tmpModel: any = {};
    tmpModel[event.field] = event.object === 'Add another project' ? 'Done' : event.object;
    if (event.field === 'tags') {
      tmpModel[event.field] = event.object.split(',').map(item => item.trim());
    }
    tmpModel['id'] = this.uniqueId;
    tmpModel['timestamp'] = moment().format('x');
    // this.afDb.list(`works/${this.currentUser.address}`).update(this.uniqueId, tmpModel);

    this.afs.collection('portfolio').doc( this.currentUser.address ).collection('work').doc(this.uniqueId).snapshotChanges().take(1).toPromise().then( (snap: any) => {
      console.log('onAction - payload', snap.payload.exists);
      return snap.payload.exists ?
        this.afs.collection('portfolio').doc( this.currentUser.address ).collection('work').doc(this.uniqueId).update(tmpModel)
        : this.afs.collection('portfolio').doc( this.currentUser.address ).collection('work').doc(this.uniqueId).set(tmpModel);
    });

    if (event.object === 'Add another project') {
      // (<any>window).location.reload();
      this.onRefresh();
    }

    if (event.object === 'Done') {
      this.router.navigate(['/profile']);
    }
  }

  onRefresh() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    const currentUrl = this.router.url + '?';
    this.router.navigateByUrl(currentUrl).then( () => {
      this.router.navigated = false;
      this.router.navigate([this.router.url]);
    });
  }
}

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';

export class SkillTag {
  tag: string;
}

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy {

  currentUser: User;
  projectId = null;

  authSub: Subscription;
  // paramsSub: Subscription;

  skillTagsList: string[] = [];
  tagSelectionInvalid = false;
  acceptedTags: string[] = [];
  tagInput = '';

  projectForm: FormGroup = null;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private location: Location,
    private authService: AuthService,
    private afs: AngularFirestore) {

    this.projectForm = formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(255)])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(512)])],
      tags: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(255)])],
      image: [''],
      link: ['']
    });
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user;
        this.activatedRoute.params.take(1).subscribe((params) => {
          if (params['id']) {
            this.projectId = params['id'];
            this.loadProject(this.projectId);
          }
        });
      }
    });
    this.afs.collection<SkillTag>('skill-tags').valueChanges().take(1).subscribe((tags: SkillTag[]) => {
      this.skillTagsList = tags.map(x => x.tag);
    });
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  onTagEnter() {
    const tag = this.tagInput;
    const indexOfTag = this.skillTagsList.findIndex(x => x === tag);
    if (indexOfTag !== -1) {
      if (!this.acceptedTags.includes(tag)) {
        if (this.acceptedTags.length <= 5) {
          this.acceptedTags.push(tag);
          this.projectForm.controls['tags'].setValue(this.acceptedTags.join(','));
        } else {
          this.tagSelectionInvalid = true;
        }
      }
      this.tagInput = '';
      this.tagSelectionInvalid = false;
    } else if (tag !== '') {
      this.tagSelectionInvalid = true;
    }
  }

  removeTag(tag: string) {
    const index = this.acceptedTags.indexOf(tag);
    this.acceptedTags.splice(index, 1);
    this.projectForm.controls['tags'].setValue(this.acceptedTags.join(','));
  }

  loadProject(address: string) {
    try {
      this.afs.doc(`portfolio/${this.currentUser.address}/work/${address}`).valueChanges().take(1).subscribe((data: any) => {
        this.projectForm.controls['title'].setValue(data.title);
        this.projectForm.controls['description'].setValue(data.description);

        // on component init
        if (data.tags instanceof Array) {
          this.projectForm.controls['tags'].setValue(data.tags.join());
          this.acceptedTags = data.tags;
        } else {
          this.projectForm.controls['tags'].setValue('');
        }

        this.projectForm.controls['image'].setValue(data.image);
        this.projectForm.controls['link'].setValue(data.link);
      });
    } catch (error) {
      console.error('loadProject - error', error);
    }
  }

  submitForm() {
    try {
      let tags = this.projectForm.value.tags;
      if (!(this.projectForm.value.tags instanceof Array)) {
        tags = this.projectForm.value.tags.split(',').map(item => item.trim());
      }
      const tmpProject = {
        title: this.projectForm.value.title,
        description: this.projectForm.value.description,
        tags: tags,
        image: this.projectForm.value.image,
        link: this.projectForm.value.link,
        state: 'Done',
        timestamp: moment().format('x')
      };

      if (this.projectId == null) {
        const uid = this.guid();
        tmpProject['id'] = uid;
        this.afs.doc(`portfolio/${this.currentUser.address}/work/${uid}`).set(tmpProject);
      } else {
        this.afs.doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`).update(tmpProject);
      }

      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('submitForm - error', error);
    }
  }

  guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  onCancel() {
    if ((<any>window).$('html, body')) {
      (<any>window).$('html, body').animate({ scrollTop: 0 }, 600);
    }
  }

  onDelete() {
    try {
      this.afs.doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`).delete();

      if ((<any>window).$('html, body')) {
        (<any>window).$('html, body').animate({ scrollTop: 0 }, 600);
      }
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('onDelete - error', error);
    }
  }

  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}

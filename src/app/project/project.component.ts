import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';

import { UserService } from '../user.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));
  projectId = '';

  // Forms
  projectForm: FormGroup = null;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
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
    this.activatedRoute.params.subscribe((params) => {
      if (params['address']) {
        this.projectId = params['address'];
        this.loadProject(this.projectId);
      }
    });
  }

  loadProject(address: string) {
    try {
      this.afs.doc(`portfolio/${this.currentUser.address}/work/${address}`).valueChanges().take(1).subscribe((data: any) => {
        console.log('loadProject', data);
        this.projectForm.controls['title'].setValue(data.title);
        this.projectForm.controls['description'].setValue(data.description);

        if (data.tags instanceof Array) {
          this.projectForm.controls['tags'].setValue(data.tags.join());
        } else {
          this.projectForm.controls['tags'].setValue(data.tags);
        }

        this.projectForm.controls['image'].setValue(data.image);
        this.projectForm.controls['link'].setValue(data.link);
      });
    } catch (error) {
      console.error('loadProject - error', error);
    }
  }

  onProject() {
    try {
      let tags = this.projectForm.value.tags;
      if ( !(this.projectForm.value.tags instanceof Array) ) {
        tags = this.projectForm.value.tags.split(',').map(item => item.trim());
      }
      const tmpProject = {
        title: this.projectForm.value.title,
        description: this.projectForm.value.description,
        tags: tags,
        image: this.projectForm.value.image,
        link: this.projectForm.value.link,
        state: 'Done'
      };

      this.afs.doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`).update( tmpProject );
      this.router.navigate(['/profile']);
      // setTimeout( () => {
      //   this.router.navigate(['/profile']);
      // }, 600 );
    } catch (error) {
      console.error('onProfile - error', error);
    }
  }

  onCancel() {
    if ( (<any>window).$('html, body') ) {
      (<any>window).$('html, body').animate({scrollTop : 0}, 600);
    }
  }

  onDelete() {
    try {
      this.afs.doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`).delete();

      if ( (<any>window).$('html, body') ) {
        (<any>window).$('html, body').animate({scrollTop : 0}, 600);
      }
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('onDelete - error', error);
    }
  }

}

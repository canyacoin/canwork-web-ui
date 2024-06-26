import { Location } from '@angular/common'
import { Component, OnDestroy, OnInit, Directive } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { Work } from '../../core-classes/portfolio'
import { User } from '../../core-classes/user'
import { AuthService } from '../../core-services/auth.service'

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
})
export class ProjectComponent implements OnInit, OnDestroy {
  currentUser: User
  projectId = null

  authSub: Subscription

  initialTags: string[] = []
  projectLoaded = false

  projectForm: UntypedFormGroup = null

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private location: Location,
    private authService: AuthService,
    private afs: AngularFirestore
  ) {
    this.projectForm = formBuilder.group({
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ]),
      ],
      description: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(512),
        ]),
      ],
      tags: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(255),
        ]),
      ],
      image: [''],
      link: [''],
    })
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(
      (user: User) => {
        if (user && this.currentUser !== user) {
          this.currentUser = user
          this.activatedRoute.params.pipe(take(1)).subscribe(
            (params) => {
              if (params['id']) {
                this.projectId = params['id']
                this.loadProject(this.projectId)
              } else {
                this.projectLoaded = true
              }
            },
            (error) => {
              console.error('unable to retrieve data:', error)
            }
          )
        }
      },
      (error) => {
        console.error('unable to retrieve data:', error)
      }
    )
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  skillTagsUpdated(value) {
    this.projectForm.controls['tags'].setValue(value)
  }

  loadProject(address: string) {
    try {
      this.afs
        .doc(`portfolio/${this.currentUser.address}/work/${address}`)
        .valueChanges()
        .pipe(take(1))
        .subscribe((data: Work) => {
          this.projectForm.controls['title'].setValue(data.title)
          this.projectForm.controls['description'].setValue(data.description)

          this.initialTags = data.tags

          this.projectForm.controls['image'].setValue(data.image)
          this.projectForm.controls['link'].setValue(data.link)
          this.projectLoaded = true
        })
    } catch (error) {
      console.error('loadProject - error', error)
    }
  }

  submitForm() {
    try {
      const tags = this.projectForm.value.tags
        .split(',')
        .map((item) => item.trim())
      const tmpProject = {
        title: this.projectForm.value.title,
        description: this.projectForm.value.description,
        tags: tags,
        image: this.projectForm.value.image,
        link: this.projectForm.value.link,
        state: 'Done',
        timestamp: Date.now(),
      }

      if (this.projectId == null) {
        const uid = this.guid()
        tmpProject['id'] = uid
        this.afs
          .doc(`portfolio/${this.currentUser.address}/work/${uid}`)
          .set(tmpProject)
      } else {
        this.afs
          .doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`)
          .update(tmpProject)
      }

      this.router.navigate(['/profile'])
    } catch (error) {
      console.error('submitForm - error', error)
    }
  }

  guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    )
  }

  onCancel() {
    if ((<any>window).$('html, body')) {
      ;(<any>window).$('html, body').animate({ scrollTop: 0 }, 600)
    }
  }

  onDelete() {
    try {
      this.afs
        .doc(`portfolio/${this.currentUser.address}/work/${this.projectId}`)
        .delete()

      if ((<any>window).$('html, body')) {
        ;(<any>window).$('html, body').animate({ scrollTop: 0 }, 600)
      }
      this.router.navigate(['/profile'])
    } catch (error) {
      console.error('onDelete - error', error)
    }
  }

  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }
}

/*
create or edit article
*/

import { Component } from '@angular/core'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'
import { Router, ActivatedRoute } from '@angular/router'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { NgForm } from '@angular/forms'

@Component({
  selector: 'app-edit-article',
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css'],
})
export class EditArticleComponent {
  currentUser: User
  editing = false
  article: any = {}
  articleId = ''

  constructor(
    private router: Router,
    private authService: AuthService,
    private afs: AngularFirestore,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    // check auth
    try {
      this.currentUser = await this.authService.getCurrentUser()
    } catch (e) {}
    const isAdmin = this.currentUser?.isAdmin // configured into backend

    if (!isAdmin) this.router.navigate(['/home'])

    if (
      this.activatedRoute.snapshot.params['slug'] &&
      this.activatedRoute.snapshot.params['slug'] !== ''
    ) {
      this.editing = true // tentative

      const slug = this.activatedRoute.snapshot.params['slug']
      this.afs
        .collection('articles', (ref) => ref.where('slug', '==', slug))
        .get()
        .toPromise()
        .then((snapResult) => {
          // retrieve article to edit from firestore db
          if (!snapResult.empty && snapResult.docs && snapResult.docs.length) {
            const articleSnap = snapResult.docs[0]

            this.articleId = articleSnap.id // used later to save it

            // save in local data model
            this.article = articleSnap.data()

            console.log(this.article) // debug

            this.editing = true
          } else {
            this.editing = false // failed
          }
        })
    }
  }

  save() {
    console.log(this.article)
  }

  isValid(field) {
    if (field == 'slug') {
      if (this.article.slug?.length >= 5) return true
      return false
    }

    return true
  }

  isFormValid() {
    let isValid = true
    ;['slug'].every((field) => {
      isValid = this.isValid(field)
      return isValid
    })
    return isValid
  }
}

/*
create or edit article
*/

import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { AdminAuthService } from '@service/admin-auth.service'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { NgForm } from '@angular/forms'

const datePostedRegex = /^\d{4}-\d{2}-\d{2}$/
const fieldsToCheck = ['slug', 'title', 'category', 'datePosted']

@Component({
  selector: 'app-edit-article',
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css'],
})
export class EditArticleComponent {
  editing = false
  article: any = {}
  articleId = ''

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private adminAuthService: AdminAuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    // check auth
    const isAdmin = await this.adminAuthService.isFrontendAdmin()

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

            let articleDb: any = articleSnap.data()

            // update local only fields and remove db only ones

            articleDb.tagsString = ''
            articleDb.tags.forEach((el) => {
              if (articleDb.tagsString) articleDb.tagsString += ', '
              articleDb.tagsString += el.trim()
            })
            delete articleDb.tags

            // save in local data model
            this.article = articleDb

            console.log(this.article) // debug

            this.editing = true
          } else {
            this.editing = false // failed
          }
        })
    } else {
      // new article, default category value
      this.article.category = 'blog'
    }
  }

  save() {
    /*
    auto populate datePosted if needed
    */
    if (!this.article.datePosted) {
      this.article.datePosted = new Date().toISOString().substring(0, 10)
    }

    // add backend only fields, remove frontend only ones
    let articleDb: any = {}
    Object.assign(articleDb, this.article)

    // tags array
    articleDb.tags = []
    if (articleDb.tagsString.trim())
      articleDb.tags = articleDb.tagsString.trim().split(',')
    // cleanup
    for (let i = 0; i < articleDb.tags.length; i++) {
      articleDb.tags[i] = articleDb.tags[i].trim()
    }
    delete articleDb.tagsString

    console.log(articleDb)
  }

  isValid(field) {
    if (field == 'slug') {
      if (this.article[field]?.length >= 3) return true
      return false
    }

    if (field == 'title') {
      if (this.article[field]?.length >= 5) return true
      return false
    }

    if (field == 'category') {
      if (this.article[field]?.length >= 3) return true
      return false
    }

    if (field == 'datePosted') {
      if (!this.article[field]) return true

      let dateString = this.article[field]
      if (!dateString.match(datePostedRegex)) return false // Invalid format
      let d = new Date(dateString)
      let dNum = d.getTime()
      if (!dNum && dNum !== 0) return false // NaN value, Invalid date
      return d.toISOString().slice(0, 10) === dateString
    }

    return true
  }

  isFormValid() {
    let isValid = true

    fieldsToCheck.every((field) => {
      // all should be valid, first false breaks
      isValid = this.isValid(field)
      return isValid
    })

    return isValid
  }
}

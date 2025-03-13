/*
create or edit article
*/

import { Component, Inject, PLATFORM_ID } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { AdminAuthService } from '@service/admin-auth.service'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { NgForm } from '@angular/forms'
import { isPlatformBrowser } from '@angular/common'

import { Upload } from '@class/upload'

const datePostedRegex = /^\d{4}-\d{2}-\d{2}$/
const fieldsToCheck = ['slug', 'title', 'category', 'datePosted', 'body']

@Component({
  selector: 'app-edit-article',
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css'],
})
export class EditArticleComponent {
  editing = false
  article: any = {}
  articleId = ''
  saveError = ''
  saveSuccess = ''
  savingToDb = false

  hoveredFiles = false // main image
  isCurrentUpload: boolean = false // main image
  uploadedFiles: Upload[] = [] // main image
  mainUploadError = ''

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private adminAuthService: AdminAuthService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
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

  async save() {
    if (this.editing && !this.articleId) {
      this.showSaveStatus('', 'No article id')
      return
    }

    this.savingToDb = true

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
    if (articleDb.tagsString && articleDb.tagsString.trim())
      articleDb.tags = articleDb.tagsString.trim().split(',')
    // cleanup
    for (let i = 0; i < articleDb.tags.length; i++) {
      articleDb.tags[i] = articleDb.tags[i].trim()
    }
    delete articleDb.tagsString

    // console.log(articleDb)

    try {
      const saveMsg = `Success ${
        this.editing ? 'editing' : 'creating'
      } article!`

      if (this.editing) {
        // edit

        await this.afs
          .collection('articles')
          .doc(this.articleId)
          .update(articleDb)
      } else {
        // create

        // check for duplicates
        const dupSnap = await this.afs
          .collection('articles', (ref) =>
            ref.where('slug', '==', articleDb.slug)
          )
          .get()
          .toPromise()

        if (!dupSnap.empty) {
          this.showSaveStatus('', 'Duplicate slug')

          this.savingToDb = false
          return
        }

        // create new doc

        const newArticleRef = await this.afs
          .collection('articles')
          .add(articleDb)

        // save new id
        this.articleId = newArticleRef.id

        // switch to editing mode
        this.editing = true
      }

      // common
      this.showSaveStatus(saveMsg, '')
    } catch (err) {
      let errorMsg = `Error ${
        this.editing ? 'editing' : 'creating'
      } article: ${err.toString()}`
      console.log(err)
      this.showSaveStatus('', errorMsg)
    }

    this.savingToDb = false
    /*
    
    
    todo implement delete
    
    
    todo attachments and main image
    */
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

    if (field == 'body') {
      if (this.article[field]?.length >= 10) return true
      return false
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

  showSaveStatus(success, fail) {
    if (success) {
      this.saveSuccess = success
      setTimeout(() => {
        this.saveSuccess = '' // reset after 2 seconds
      }, 2000)
    }

    if (fail) {
      this.saveError = fail
      setTimeout(() => {
        this.saveError = '' // reset after 2 seconds
      }, 2000)
    }
  }

  autogrow() {
    if (!isPlatformBrowser(this.platformId)) return // not on ssr

    let textArea = document.getElementById('body')
    textArea.style.overflow = 'hidden'
    textArea.style.height = '0px'
    textArea.style.height = textArea.scrollHeight + 'px'
  }

  view(slug) {
    // preview article into a new window
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/blog/${slug}`])
    )

    window.open(url, '_blank')
  }

  showUploadError(msg) {
    this.mainUploadError = msg
    setTimeout(() => {
      this.mainUploadError = ''
    }, 2000)
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = true
    // Optionally add a CSS class to indicate the drag state
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = false
  }

  onUploadDrop(event: DragEvent) {
    // todo
    // from drag and drop, pay attention to file count
    console.log('onUploadDrop')
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = false
    if (this.isCurrentUpload) return // already uploading
    if (event.dataTransfer && event.dataTransfer.files) {
      let files = event.dataTransfer.files
      console.log(files)

      if (files.length == 0) return this.showUploadError('No files upload')
      if (files.length > 1) return this.showUploadError('Max 1 file')
    }
  }

  onUploadClick(event: any) {
    // todo
    // from click on upload link
    console.log('onUploadClick')
    if (this.isCurrentUpload) return // already uploading
    let files = event.target.files
    console.log(files)

    if (files.length == 0) return this.showUploadError('No files upload')
  }
}

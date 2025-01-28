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
  article: any

  constructor(
    private router: Router,
    private authService: AuthService,
    private afs: AngularFirestore,
    private activatedRoute: ActivatedRoute
  ) {
    this.article = {
      slug: 'test-slug',
    }
  }

  async ngOnInit() {
    // check auth
    try {
      this.currentUser = await this.authService.getCurrentUser()
    } catch (e) {}
    const isAdmin = this.currentUser?.isAdmin // configured into backend

    if (!isAdmin) this.router.navigate(['/home'])

    this.editing =
      this.activatedRoute.snapshot.params['slug'] &&
      this.activatedRoute.snapshot.params['slug'] !== ''
  }

  save() {
    console.log(this.article)
  }

  isValid(field) {
    if (field == 'slug') {
      if (this.article.slug.length > 0) return true
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

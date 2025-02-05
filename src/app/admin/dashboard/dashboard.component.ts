import { Component, Inject, PLATFORM_ID } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'
import { AdminAuthService } from '@service/admin-auth.service'

const HITS_PER_PAGE = 20

import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  articles$: Observable<any[]>
  mediumFeed = []
  hits = [] // the new hits array, injected into result component

  currentPage: number = 0 // the current blog admin page
  numHits: number = 0 // the number of hits of current blog query
  hitsPerPage: number = HITS_PER_PAGE // constant

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService,

    private afs: AngularFirestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.articles$ = this.afs
      .collection<any>('articles', (ref) => ref.orderBy('datePosted', 'desc'))
      .valueChanges()
  }

  async ngOnInit() {
    // check also here

    const isAdmin = await this.adminAuthService.isFrontendAdmin()

    if (!isAdmin) this.router.navigate(['/home'])

    this.articles$.subscribe((articles) => {
      this.hits = []
      if (articles && articles.length > 0) {
        articles.forEach((article) => {
          // let articleUrl = ''
          // if (article.category) {
          //   articleUrl = `/${article.category}/${article.slug}`
          // } else {
          //   articleUrl = `/${article.slug}`
          // }

          // link: `https://canwork.io${articleUrl}`,
          // link: `/blog/${article.slug}`,
          this.mediumFeed.push({
            thumbnail: article.imageUrl,
            title: article.title,
            subTitle: article.subTitle,
            body: article.body,
            tags: article.tags,
            datePosted: article.datePosted,
            author: article.author,
            slug: article.slug,
          })

          this.hits = this.mediumFeed.slice(0, this.hitsPerPage) // update
          this.numHits = this.mediumFeed.length
        })
      }
    })
  }

  onPageChange(newPage: number) {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.hits = this.mediumFeed.slice(
          this.currentPage * this.hitsPerPage,
          (this.currentPage + 1) * this.hitsPerPage
        ) // update
      }, 400) // 500 ms latency
    } else {
      this.hits = this.mediumFeed.slice(
        this.currentPage * this.hitsPerPage,
        (this.currentPage + 1) * this.hitsPerPage
      ) // update
    }

    this.currentPage = newPage // set new page position
  }
}

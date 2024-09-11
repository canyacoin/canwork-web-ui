import { Component } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs'
const HITS_PER_PAGE = 9

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  articles$: Observable<any[]>
  queryBlog: string = ''
  mediumFeed = []

  hits = [] // the new hits array, injected into result component

  currentPage: number = 0 // the current search page
  numHits: number = 0 // the number of hits of current search
  hitsPerPage: number = HITS_PER_PAGE // constant

  constructor(private afs: AngularFirestore) {
    this.articles$ = this.afs
      .collection<any>('articles', (ref) => ref.orderBy('datePosted', 'desc'))
      .valueChanges()
  }
  ngOnInit() {
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

          // link: `https://app.canwork.io${articleUrl}`,
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

  // ngOnInit() {
  //   this.articles$.subscribe((articles) => {
  //     if (articles && articles.length > 0) {
  //       articles.forEach((article) => {
  //         let articleUrl = ''
  //         if (article.category) {
  //           articleUrl = `/${article.category}/${article.slug}`
  //         } else {
  //           articleUrl = `/${article.slug}`
  //         }

  //         this.mediumFeed.push({
  //           thumbnail: article.imageUrl,
  //           title: article.title,
  //           subTitle: article.subTitle,
  //           tags: article.tags,
  //           datePosted: article.datePosted,
  //           author: article.author,
  //           link: `https://app.canwork.io${articleUrl}`,
  //         })
  //       })
  //       console.log('articles===>', articles)

  //       this.hits = this.mediumFeed.slice(0, this.hitsPerPage) // update
  //       this.numHits = this.mediumFeed.length
  //     }
  //   })
  // }
  // two way binding, event from paging component (user input)
  onPageChange(newPage: number) {
    setTimeout(() => {
      this.hits = this.mediumFeed.slice(
        this.currentPage * this.hitsPerPage,
        (this.currentPage + 1) * this.hitsPerPage
      ) // update
    }, 400) // 500 ms latency

    this.currentPage = newPage // set new page position
  }

  handleSearchQuery(query: string) {
    this.queryBlog = query
  }
}

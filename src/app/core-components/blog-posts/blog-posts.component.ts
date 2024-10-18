import { Component, OnInit } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
})
export class BlogPostsComponent implements OnInit {
  articles$: Observable<any[]>
  placeholder = 'assets/img/outandabout.png'
  mediumFeed = []
  canLook = false

  constructor(private afs: AngularFirestore) {
    this.articles$ = this.afs
      .collection<any>('articles', (ref) =>
        ref.orderBy('datePosted', 'desc').limit(3)
      )
      .valueChanges()
  }

  ngOnInit() {
    this.articles$.subscribe((articles) => {
      this.mediumFeed = []
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
        })
      }
    })
  }
}

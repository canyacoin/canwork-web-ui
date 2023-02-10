import { Component, OnInit } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from 'angularfire2/firestore'

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.css'],
})
export class BlogPostsComponent implements OnInit {
  articlesCollection: AngularFirestoreCollection<any>
  placeholder = 'assets/img/outandabout.png'
  mediumFeed = []
  canLook = false
  constructor(private afs: AngularFirestore) {
    this.articlesCollection = this.afs.collection<any>('articles')
  }

  async ngOnInit() {
    const articlesSnapshot = await this.articlesCollection.ref
      .orderBy('datePosted', 'desc')
      .limit(3)
      .get()
    if (!articlesSnapshot.empty) {
      articlesSnapshot.forEach(doc => {
        let obj = doc.data()
        let articleUrl = ''
        if (obj.category) articleUrl = '/' + obj.category + '/' + obj.slug
        else articleUrl = '/' + obj.slug
        this.mediumFeed.push({
          title: obj.title,
          thumbnail: obj.imageUrl,
          link: 'https://canwork.io' + articleUrl,
        })
      })
    }
  }
}

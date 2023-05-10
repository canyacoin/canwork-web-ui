import { Component, OnInit, Directive } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore'

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
      articlesSnapshot.forEach((doc) => {
        let obj = doc.data()
        let articleUrl = ''
        if (obj.category) articleUrl = '/' + obj.category + '/' + obj.slug
        else articleUrl = '/' + obj.slug
        this.mediumFeed.push({
          thumbnail: obj.imageUrl,
          title: obj.title,
          subtitle: obj.subTitle,
          author: obj.author,
          link: 'https://canwork.io' + articleUrl,
        })
      })
    }
  }
}

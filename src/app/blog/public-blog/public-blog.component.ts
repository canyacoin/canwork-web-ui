import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { SeoService } from '@service/seo.service'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
// spinner
import { NgxSpinnerService } from 'ngx-spinner'
import { MessageService } from 'primeng/api'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Observable } from 'rxjs'
import { Article, Blog } from '@class/blog'

@Component({
  selector: 'public-blog',
  templateUrl: './public-blog.component.html',
  styleUrls: ['./public-blog.component.css'],
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
})
export class PublicBlogComponent {
  @ViewChild('contentContainer') contentContainer: ElementRef | undefined
  articles$: Observable<any[]>
  paramsSub: Subscription

  loaded: number = 0
  currentArticle: Blog = {} as Blog
  contentHtml: SafeHtml = ''
  headingsArray: string[] = []
  headingsIdArray: string[] = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private afs: AngularFirestore,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.spinner.show()

    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      this.initBlog(params)
    })
    setTimeout(() => {
      /** spinner ends after 3000ms */
      this.spinner.hide()
    }, 1500)
  }

  ngAfterViewInit() {
    this.activatedRoute.fragment.subscribe((fragment) => {
      if (fragment) {
        const element = document.getElementById(fragment)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    })
  }

  initBlog(params: any) {
    const { slug } = params
    // console.log('slug', slug)

    // Directly query Firestore for the article that matches the slug
    this.afs
      .collection('articles', (ref) => ref.where('slug', '==', slug))
      .valueChanges()
      .pipe(take(1))
      .subscribe((articles: Article[]) => {
        if (articles.length > 0) {
          const matchingArticle = articles[0] // Assuming slugs are unique
          this.loaded = 1
          console.log('this.loaded', this.loaded)
          // const matchingArticle = {
          //   imageUrl:
          //     'https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F8c05f69b9ea0451cabdeeee15461756a.jpg?alt=media',
          //   subTitle:
          //     'Major Release: Exciting Updates to Our Freelancing Platform',
          //   body: '  <p style="font-weight: 500;">Welcome to the July update, and a big thank you if you’re still here following our progress. We’ve been talking about it all year, and now we finally have a massive major CanWork release in our testing environment, getting ready to go live.</p>\r\n\r\n  <h3 style="font-weight: 500;">Key Highlights</h3>\r\n\r\n  <h4 style="font-weight: 500;">Upgraded Framework</h4>\r\n  <p style="font-weight: 500;">We have upgraded from Angular 7 to 17, a monumental milestone that updates our web app framework (and heaps of dependencies) for better security and maintainability. Along the way, we also upgraded many third-party services and features, including database interactions, cloud services, and search functionalities. We even made things faster.</p>\r\n\r\n  <h4 style="font-weight: 500;">New Design & UI</h4>\r\n  <p style="font-weight: 500;">What began as a simple landing page refresh evolved into a complete overhaul of our UI, providing an opportunity to improve the entire codebase structure.</p>\r\n\r\n  <h5 style="font-weight: 500;">New Landing Page</h5>\r\n  <p style="font-weight: 500;">[[image1]]</p>\r\n<p style="font-weight: 300 text-align:center">What do you think about the landing text?  Give us feedback!\r\n\r\n  <h5 style="font-weight: 500;">New Freelancer and Job Search</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>New style and display</li>\r\n    <li>Advanced search functionalities for better filtering and sorting</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">[[image2]]</p><br>\r\n\r\n<h5 style="font-weight: 500;">Updated User Profiles</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Enhanced designs and functionalities</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">[[image3]]</p><br>\r\n\r\n  <h5 style="font-weight: 500;">Improved Job Creation and Management Interfaces</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Rich Text</li>\r\n      </ul>\r\n  <p style="font-weight: 500;">[[image4]]</p>\r\n<ul style="font-weight: 500;">\r\n       <li>Enhanced interfaces and processes</li>\r\n      </ul>\r\n  <p style="font-weight: 500;">[[image5]]</p><br>\r\n\r\n<h5 style="font-weight: 500;">Improved Proposals & Management Interfaces</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Enhanced interfaces and processes</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">[[image6]]</p><br>\r\n\r\n<h5 style="font-weight: 500;">Improved Action & Transaction Logs</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>More detailed and accessible logs for better tracking and transparency</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">[[image7]]</p>\r\n  \r\n  <h5 style="font-weight: 500;">Updated Wallet & Payment Flow</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Streamlined design for better user experience</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">[[image8]]</p>  <p style="font-weight: 500;">[[image9]]</p><Br>\r\n\r\n  <h5 style="font-weight: 500;">Enhanced UI/UX</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>New features like drag-and-drop, multi-file upload, and improved job detail views</li>\r\n  </ul>\r\n\r\n  <h5 style="font-weight: 500;">Bug Fixes and Optimisations</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Resolved various UI issues and fixed several bugs</li>\r\n  </ul>\r\n\r\n  <h5 style="font-weight: 500;">Component-Based Styling</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Replaced a 10,000-line+ legacy CSS file with new local, component-based Tailwind stylings, making the code easier to follow and maintain</li>\r\n  </ul>\r\n\r\n  <h5 style="font-weight: 500;">Codebase Cleanup</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Removed legacy logic, improved component logic, and enhanced overall structure using best practices</li>\r\n  </ul>\r\n\r\n  <h5 style="font-weight: 500;">Commit Volume</h5>\r\n  <ul style="font-weight: 500;">\r\n    <li>Over 250 commits to bring these updates to fruition, along with thousands of lines of code changes, deletions, new files, and reorganisations</li>\r\n  </ul>\r\n  <p style="font-weight: 500;">This extensive update explains why it’s taken us some time to finalise this release.</p>\r\n<br>\r\n<p style="font-weight: 500;">[[image10]]</p><br>\r\n\r\n  <h4 style="font-weight: 500;">Single Codebase Transition</h4>\r\n  <p style="font-weight: 500;">Previously, our app was split across two codebases—one for the web app core features and another for presenting the surface-level site to search engines and casual visitors.</p>\r\n\r\n  <h5 style="font-weight: 500;">Angular SSR</h5>\r\n  <p style="font-weight: 500;">To reduce complexity, we are implementing a stable Angular solution in a single codebase with our web UI to satisfy SEO needs. The Angular SSR (formerly Angular Universal) architecture combines Angular client and Node.js server with Firebase functions and hosting. After the successful proof-of-concept, we will transition after the major release.</p>\r\n\r\n  <h5 style="font-weight: 500;">PWA Features</h5>\r\n  <p style="font-weight: 500;">We’re also evaluating the addition of Progressive Web Application (PWA) features to enhance performance by serving the first page from functions and handling subsequent updates via local service workers.</p>\r\n<br>\r\n<p style="font-weight: 500;">[[image11]]</p><br>\r\n  <h3 style="font-weight: 500;">$50K USDT Buyback Initiative and 932K CAN Burn</h3>\r\n  <p style="font-weight: 500;">You may have noticed or taken advantage of the recent $50K CAN Buyback Initiative. This month, we burned 932,065 CAN Tokens, reducing the circulating supply as intended.</p>\r\n\r\n  <a href="https://bscscan.com/tx/0x8f4df004517e7a0e3e6972ce26f2eee724dece94de6c990b8ba6403fbcebccd1"><p style="font-weight: 500;">View transaction details here.</p></a>\r\n\r\n  <h3 style="font-weight: 500;">Next Steps</h3>\r\n  <ul style="font-weight: 500;">\r\n    <li>Deploy the new major release live</li>\r\n    <li>Implement Angular SSR and reduce the codebase</li>\r\n    <li>Update DevOps, including the deployment pipeline, Firebase, and Google Cloud implementations</li>\r\n  </ul>\r\n\r\n  <h3 style="font-weight: 500;">Call for Feedback</h3>\r\n  <p style="font-weight: 500;">We understand there are still some missing pieces. Thank you for your patience. Please report any bugs, issues, or provide feedback. Community participation in testing and bug finding is highly welcomed. If interested, please reach out to us!</p>\r\n\r\n  <p style="font-weight: 500;">We look forward to finalising these updates for production in the coming weeks. Stay tuned.</p>\r\n\r\n  <br><br>\r\n  Telegram channel:\r\n  <br>\r\n  <br>\r\n  <button class="btn btn-info" onclick="window.location.href=\'https://t.me/CanYaCommunity\';">Join us on Telegram</button><br>\r\n  <br>\r\n  CanWork: <b><a href="https://www.canwork.io/">https://www.canwork.io/</a></b><br>\r\n  Twitter: <b><a href="https://twitter.com/CanWork_">https://twitter.com/CanWork_io</a></b><br>\r\n  Facebook: <b><a href="https://www.facebook.com/CanWorkPlatform">https://www.facebook.com/CanWorkPlatform</a></b><br>\r\n  Instagram: <b><a href="https://www.instagram.com/canwork.io/">https://www.instagram.com/canwork.io/</a></b>\r\n  </p>\r\n\r\n</body>\r\n</html>',
          //   category: 'blog',
          //   author: 'Johan Lives',
          //   title: 'July 2024 Update',
          //   datePosted: '2024-07-08',
          //   slug: 'july-2024',
          //   tags: ['Canwork', ' Freelance', ' BNB Chain'],
          //   imageBodyArray:
          //     '["https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F11b026fa053545c2b9788c6af4356a35.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F29b81d42e3bb4c3cb2603428190ad532.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2Fd6d0c70ca2cf4366844b8ec1628ed132.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2Fe319d1f112434269a89abfde0adac55d.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F167e8260cec7454caf9c73302597befb.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2Fcbe448fa303a4f58a5780dc2962f5d27.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F4e59a3f09208430c9c509fdecf3ecb5f.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2Fdfe69d022fd54415b11f147e8b3e1468.jpeg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2Ff08793abcd304a34bbc1ff04aa99e81b.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F200c92be95e44b068a2e74a30429bf23.jpg?alt=media","https://firebasestorage.googleapis.com/v0/b/can-work-io.appspot.com/o/uploads%2Farticles%2F27eb37ba8136400c8e3ff80b6aa0b0f3.jpg?alt=media"]',
          // }

          // Handle the matching article here
          // console.log('Found article:', matchingArticle)
          // Spread operator to assign matchingArticle properties to currentArticle
          this.currentArticle = {
            ...matchingArticle,
            imageBodyArray:
              typeof matchingArticle.imageBodyArray === 'string'
                ? JSON.parse(matchingArticle.imageBodyArray)
                : matchingArticle.imageBodyArray,
          }

          // Replace placeholders with image URLs
          let rawHtml: string = this.replaceImagePlaceholders(
            matchingArticle.body
          )
          rawHtml = this.addIdsToHeadings(rawHtml) // Add IDs to headings
          this.headingsArray = this.extractHeadings(rawHtml)
          this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml)

          // console.log('this.contentHtml =', this.contentHtml)
          // console.log('this.headingsArray =', this.headingsArray)

          // console.log('this.currentArticle:', this.currentArticle)
        } else {
          this.loaded = 2
          console.log('No matching article found')
        }
      })
  }

  replaceImagePlaceholders(content: string): string {
    if (!this.currentArticle.imageBodyArray) return content

    let updatedContent = content
    this.currentArticle.imageBodyArray.forEach((url: string, index: number) => {
      const placeholder = `[[image${index + 1}]]`
      updatedContent = updatedContent.replace(
        placeholder,
        `<img src="${url}" alt="Image ${index + 1}" class="rounded-xl" />`
      )
    })

    return updatedContent
  }

  extractHeadings(value: string): string[] {
    // Create a new DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(value, 'text/html')

    // Select all heading elements (h1, h2, h3, h4)
    const headings = doc.querySelectorAll('h1, h2, h3, h4')

    // Convert NodeList to an array and get the text content
    return Array.from(headings).map(
      (heading) => heading.textContent?.trim() || ''
    )
  }

  convertToId(str: string): string {
    return str
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z\s]/g, '') // Remove any non-alphabetic characters except spaces
      .trim() // Remove any leading or trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
  }

  addIdsToHeadings(value: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(value, 'text/html')

    const headings = doc.querySelectorAll('h1, h2, h3, h4')
    headings.forEach((heading) => {
      const textContent = heading.textContent?.trim() || ''
      const id = this.convertToId(textContent)
      this.headingsIdArray.push(id)
      heading.setAttribute('id', id)
    })

    return doc.documentElement.outerHTML
  }

  scrollToSection(id: string) {
    if (this.contentContainer) {
      const element = this.contentContainer.nativeElement.querySelector(
        `#${id}`
      )
      if (element) {
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - 180 // Adjust the offset here

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }
  }
}

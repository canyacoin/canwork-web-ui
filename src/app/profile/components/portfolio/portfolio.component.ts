import { Component, Input, OnDestroy, OnInit, Directive, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { User } from '../../../core-classes/user'
import { AuthService } from '../../../core-services/auth.service'
import { ChatService } from '../../../core-services/chat.service'

@Component({
  selector: 'app-profile-portfolio',
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean

  allPortfolioItems: any[] = []
  loaded = false
  isDialogVisible = false
  selectedPortfolio = null

  currentIndex = 0
  showPrevButton = false
  showNextButton = false
  dots: any[] = []
  items = []
  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setPortfolio(this.userModel.address)
    this.items = [
      {
        label: 'Edit',
        code: 'edit',
        icon: 'fi_edit_gray.svg',
      },
      {
        label: 'Delete',
        code: 'delete',
        icon: 'delete.svg',
      },
    ]
  }

  openDialog(item: any, portfolio?: any) {
    if (portfolio) {
      console.log(portfolio)
      this.selectedPortfolio = portfolio
    }

    this.isDialogVisible = true
  }

  async setPortfolio(address: string) {
    const portfolioRecords = this.afs.collection(`portfolio/${address}/work`)
    const data = await portfolioRecords.get().toPromise()
    this.allPortfolioItems = data.docs.map((doc) => doc.data())
    console.log(this.allPortfolioItems)
    this.dots = new Array(this.allPortfolioItems.length).fill('')
    this.loaded = true
    this.updateArrowsAndDots()
  }

  updateArrowsAndDots() {
    const totalItems = this.allPortfolioItems.length
    this.showPrevButton = this.currentIndex > 0
    this.showNextButton = this.currentIndex < totalItems - 1
    this.dots = this.dots.map((_, index) => (index === this.currentIndex ? 'active' : ''))
  }

  scrollSlider(direction: number) {
    this.currentIndex += direction
    if (this.currentIndex < 0) this.currentIndex = 0
    if (this.currentIndex >= this.allPortfolioItems.length) this.currentIndex = this.allPortfolioItems.length - 1
    this.scrollSlide()
  }

  onDotClick(index: number) {
    this.currentIndex = index
    this.scrollSlide()
  }

  scrollSlide() {
    const scrollDistance = 270 * this.currentIndex
    document.getElementById('portfolioSlider')?.scrollTo({ left: scrollDistance, behavior: 'smooth' })
  }

  // Chat the user without proposing a job
  chatUser() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.chatService.createNewChannel(user, this.userModel)
      } else {
        this.router.navigate(['auth/login'])
      }
    })
  }

  onSliderScroll() {
    const slider = document.getElementById('portfolioSlider')!
    const scrollLeft = slider.scrollLeft
    const scrollDistance = 270
    const newIndex = Math.round(scrollLeft / scrollDistance)
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex
      this.updateArrowsAndDots()
    }
  }
}

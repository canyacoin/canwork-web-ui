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
  portfolioSubscriber: Subscription
  loaded = false
  isDialogVisible = false
  visibleDeleteModal = false
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

  OnDestroy() {
    this.portfolioSubscriber.unsubscribe()
  }

  async deletePortfolio(event) {
    event.stopPropagation()
    try {
      const userAddress = this.userModel.address
      await this.afs.doc(`portfolio/${userAddress}/work/${this.selectedPortfolio.id}`).delete()
      this.visibleDeleteModal = false
    } catch (error) {
      console.error('Error updating portfolio item: ', error)
    }
  }

  onDialogCancel(event) {
    event.stopPropagation()
    this.visibleDeleteModal = false
  }

  openDialog(item: any, portfolio?: any) {
    if (portfolio) {
      this.selectedPortfolio = portfolio
    }
    if (item?.code === 'delete') {
      this.visibleDeleteModal = true
      return
    }
    this.isDialogVisible = true
  }

  async setPortfolio(address: string) {
    const portfolioRecords = this.afs.collection(`portfolio/${address}/work`)
    this.portfolioSubscriber = portfolioRecords.valueChanges().subscribe((data) => {
      if (data.length > 0) this.allPortfolioItems = data
      this.updateArrowsAndDots()
    })
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
    const scrollWidth = slider.scrollWidth
    const clientWidth = slider.clientWidth
    const maxScrollLeft = scrollWidth - clientWidth
    const scrollPercentage = scrollLeft / maxScrollLeft
    const totalItems = this.allPortfolioItems.length
    const newIndex = Math.round(scrollPercentage * (totalItems - 1))
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex
      this.updateArrowsAndDots()
    }
  }
}

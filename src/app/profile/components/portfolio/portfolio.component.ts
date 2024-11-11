import { Component, Input, OnDestroy, OnInit, Directive, ViewChild, ElementRef } from '@angular/core'
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
export class PortfolioComponent implements OnInit, OnDestroy {
  @Input() userModel: User
  @Input() isMyProfile: boolean
  @Input() notMyProfile: boolean

  allPortfolioItems: any[] = []
  loaded = false
  isDialogVisible = false
  selectedPortfolio = null

  currentIndex = 0
  showPrevButton = false
  showNextButton = false
  dots: any[] = []

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setPortfolio(this.userModel.address)
  }

  ngOnDestroy() {}

  async openDialog() {
    const userAddress = this.userModel.address
    const doc = this.afs.collection(`portfolio/${userAddress}/work`)
    const data = await doc.get().toPromise()
    console.log(data.docs.map((doc) => doc.data()))
    this.isDialogVisible = true
  }

  async setPortfolio(address: string) {
    const portfolioRecords = this.afs.collection(`portfolio/${address}/work`)
    const data = await portfolioRecords.get().toPromise()
    this.allPortfolioItems = data.docs.map((doc) => doc.data())
    console.log(this.allPortfolioItems)
    this.dots = new Array(this.allPortfolioItems.length).fill('') // Initialize dots array based on the length of allPortfolioItems
    this.loaded = true
    this.updateArrowsAndDots()
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

  updateArrowsAndDots() {
    const totalItems = this.allPortfolioItems.length;
    const scrollWidth = totalItems * (250 + 20);
    this.showPrevButton = this.currentIndex > 0;
    this.showNextButton = this.currentIndex < totalItems - 1;
  
    // Update dots array to reflect active/inactive state based on currentIndex
    this.dots = this.dots.map((_, index) => index === this.currentIndex ? 'active' : '');
  }
  
  

  scrollSlider(direction: number) {
    this.currentIndex += direction
    if (this.currentIndex < 0) this.currentIndex = 0
    if (this.currentIndex >= this.allPortfolioItems.length) this.currentIndex = this.allPortfolioItems.length - 1
    const scrollDistance = 270 * this.currentIndex
    document.getElementById('portfolioSlider')?.scrollTo({ left: scrollDistance, behavior: 'smooth' })
    this.updateArrowsAndDots()
  }

  onDotClick(index: number) {
    this.currentIndex = index
    const scrollDistance = 270 * this.currentIndex
    document.getElementById('portfolioSlider')?.scrollTo({ left: scrollDistance, behavior: 'smooth' })
    this.updateArrowsAndDots()
  }
}

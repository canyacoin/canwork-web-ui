import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CanPay, CanPayData } from '@canpay-lib/lib'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { ChatService } from '@service/chat.service'
import { UserService } from '@service/user.service'

@Component({
  selector: 'app-buy-coffee',
  templateUrl: './buy-coffee.component.html',
  styleUrls: ['./buy-coffee.component.css'],
})
export class BuyCoffeeComponent implements OnInit {
  userModel: User
  currentUser: User
  CanPay: any
  canPayOptions: CanPay

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    const userId = this.activatedRoute.snapshot.params['address'] || null
    if (userId) {
      this.userModel = await this.userService.getUser(userId)
      this.currentUser = await this.authService.getCurrentUser()
      if (this.userModel) {
        this.startCanpay()
      }
    }
  }

  startCanpay() {
    this.canPayOptions = {
      complete: this.onComplete.bind(this),
      cancel: this.onComplete.bind(this),
      userEmail: this.currentUser.email || '',
    }
  }

  async onPaymentTxHash(txHash: string, from: string) {
    await this.chatService.sendTipMessage(txHash, this.userModel.address)
  }

  async onComplete(canPayData: CanPayData) {
    this.router.navigate(['/profile/alt', this.userModel.address])
  }
}

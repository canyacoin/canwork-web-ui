import { Component, OnInit, Input, Directive } from '@angular/core'
import { User } from '@class/user'
import { environment } from '@env/environment'

@Directive()
@Component({
  selector: 'app-profile-get-referral',
  templateUrl: './get-referral.component.html',
  styleUrls: ['./get-referral.component.css'],
})
export class GetReferralComponent implements OnInit {
  @Input() userModel: User
  referralCode

  constructor() {}

  ngOnInit() {
    this.referralCode = this.userModel.slug
  }

  copyCode() {
    let code = this.referralCode
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = code
    document.body.appendChild(selBox)
    selBox.select()
    selBox.focus()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    document.getElementById('gotcode').style.display = 'block'
    setTimeout(function () {
      document.getElementById('gotcode').style.display = 'none'
    }, 2000)
  }
}

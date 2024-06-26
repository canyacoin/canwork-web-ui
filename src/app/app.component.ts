import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { AuthService } from '@service/auth.service'
// spinner
import { NgxSpinnerService } from 'ngx-spinner'
import { MessageService } from 'primeng/api'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    /** spinner starts on init */
    this.spinner.show()

    setTimeout(() => {
      /** spinner ends after 500ms */
      this.spinner.hide()
    }, 500)

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return
      }
      window.scrollTo(0, 0)
      /** spinner ends after NavigationEnd event */
      this.spinner.hide()
    })
    this.notifyAddAddressIfNecessary()
  }

  async notifyAddAddressIfNecessary() {
    try {
      const noAddress = await this.authService.isAuthenticatedAndNoAddress()
      if (noAddress) {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail:
            'Add BNB Chain (BEP20) wallet to make or receive payments on CanWork.',
        })
      }
    } catch (error) {}
  }
}

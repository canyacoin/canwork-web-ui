import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '@service/auth.service'
// spinner
import { NgxSpinnerService } from 'ngx-spinner'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    /** spinner starts on init */
    this.spinner.show()

    setTimeout(() => {
      /** spinner ends after 2 seconds */
      this.spinner.hide()
    }, 2000)

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return
      }
      window.scrollTo(0, 0)
      /** spinner ends after NavigationEnd event */
    })
    this.notifyAddAddressIfNecessary()
  }

  async notifyAddAddressIfNecessary() {
    try {
      const noAddress = await this.authService.isAuthenticatedAndNoAddress()
      if (noAddress) {
        this.toastr.info(
          'Add BNB Chain (BEP20) wallet to make or receive payments on CanWork.',
          undefined,
          {
            timeOut: 0,
            extendedTimeOut: 0,
            positionClass: 'toast-top-full-width',
            closeButton: true,
          }
        )
      }
    } catch (error) {}
  }
}

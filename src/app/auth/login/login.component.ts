import { Component, OnInit } from '@angular/core'

import { HttpHeaders } from '@angular/common/http'

import { ActivatedRoute, Router } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/compat/auth'

import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular'
import { User } from '../../core-classes/user'
import { AuthService } from '../../core-services/auth.service'
import { UserService } from '../../core-services/user.service'
// spinner
import { NgxSpinnerService } from 'ngx-spinner'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loading = false
  returnUrl: string
  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private userService: UserService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/'
    this.spinner.show()
    setTimeout(() => {
      /** spinner ends after 2 seconds */
      this.spinner.hide()
    }, 2000)
  }

  onFirebaseLogin(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    this.loading = true
    this.spinner.hide()
    const user = signInSuccessData.authResult.user
    const rnd = Math.floor(Math.random() * 109) + 1
    const parsedUser = new User({
      '@context': 'http://schema.org',
      '@type': 'Person',
      name: user['displayName'] || 'Empty',
      address: user['uid'],
      avatar: {
        uri: user['photoURL'] || `assets/img/animals/${rnd}.png`,
      },
      email: user['email'] || 'Empty',
      phone: user['phoneNumber'] || 'Empty',
      state: user['state'] || 'Empty',
      whitelisted: user['whitelisted'] || false,
      whitelistRejected: user['whitelistRejected'] || false,
      whitelistSubmitted: user['whitelistSubmitted'] || false,
      verified: user['verified'] || false,
    })

    this.handleLogin(parsedUser)
  }

  async handleLogin(userDetails: User) {
    let user: User
    try {
      user = await this.userService.getOwnUser(userDetails.address)
    } catch (error) {
      console.error(
        `! failed to query for user with address: [${userDetails.address}] error was: `,
        error
      )
    }

    if (user && user.address) {
      //console.log('+ logging existing user in:', user.email)
      ;(await this.afAuth.currentUser)
        .getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
          window.sessionStorage.accessToken = idToken
        })
        .catch((error) => {
          console.error('! jwt token was not stored in session storage ', error)
          alert('Sorry, we encountered an unknown error')
        })
      this.authService.setUser(user)

      if (this.route.snapshot.queryParams['nextAction'])
        this.router.navigate([this.returnUrl], {
          queryParams: {
            nextAction: this.route.snapshot.queryParams['nextAction'],
          },
        })
      else this.router.navigate([this.returnUrl])
    } else {
      //console.log('+ detected new user:', userDetails.email, userDetails)
      this.initialiseUserAndRedirect(userDetails)
    }
  }

  async initialiseUserAndRedirect(user: User) {
    //console.log(`initialise`)
    this.userService.saveUser(user).then(
      (res) => {
        this.authService.setUser(user)
        this.router.navigate(['/profile/setup'])
      },
      (err) => {
        console.log('onLogin - err', err)
      }
    )
  }
}

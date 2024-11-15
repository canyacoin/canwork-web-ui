import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Injectable()
export class AnimationService {
  deskAnim = null
  consultAnim = null
  airportAnim = null
  homeAnim = null
  handAnim = null
  portfolioAnim = null

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  resetAnimations() {
    if (this.deskAnim) {
      this.deskAnim = null
    }
    if (this.consultAnim) {
      this.consultAnim = null
    }
    if (this.airportAnim) {
      this.airportAnim = null
    }
    if (this.homeAnim) {
      this.homeAnim = null
    }
    if (this.handAnim) {
      this.handAnim = null
    }
    if (this.portfolioAnim) {
      this.portfolioAnim = null
    }
  }

  loadAnimations() {
    try {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          if (document.getElementById('desk')) {
            const deskData = {
              wrapper: document.getElementById('desk'),
              animType: 'html',
              loop: true,
              prerender: true,
              autoplay: true,
              path: 'assets/data/desk.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            this.deskAnim = (<any>window).bodymovin.loadAnimation(deskData)
            this.deskAnim.setSpeed(0.75)
          }

          if (document.getElementById('consult')) {
            const consultData = {
              wrapper: document.getElementById('consult'),
              animType: 'html',
              loop: false,
              prerender: true,
              autoplay: true,
              path: 'assets/data/consult.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            this.consultAnim = (<any>window).bodymovin.loadAnimation(
              consultData
            )
          }

          if (document.getElementById('airport')) {
            const airportData = {
              wrapper: document.getElementById('airport'),
              animType: 'html',
              loop: true,
              prerender: true,
              autoplay: true,
              path: 'assets/data/airport.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            this.airportAnim = (<any>window).bodymovin.loadAnimation(
              airportData
            )
            this.airportAnim.setSpeed(0.25)
          }

          if (document.getElementById('home')) {
            const homeData = {
              wrapper: document.getElementById('home'),
              animType: 'html',
              loop: true,
              prerender: true,
              autoplay: true,
              path: 'assets/data/home.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            this.homeAnim = (<any>window).bodymovin.loadAnimation(homeData)
            this.homeAnim.setSpeed(0.75)
          }

          if (document.getElementById('hand')) {
            const handData = {
              wrapper: document.getElementById('hand'),
              animType: 'html',
              loop: true,
              prerender: true,
              autoplay: true,
              path: 'assets/data/hand.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            this.handAnim = (<any>window).bodymovin.loadAnimation(handData)
            this.handAnim.setSpeed(0.75)
          }

          if (document.getElementById('portfolio')) {
            const portfolioData = {
              wrapper: document.getElementById('portfolio'),
              animType: 'html',
              loop: true,
              prerender: true,
              autoplay: true,
              path: 'assets/data/hand.json',
              rendererSettings: {
                progressiveLoad: false,
              },
            }
            const portfolioAnim = (<any>window).bodymovin.loadAnimation(
              portfolioData
            )
            portfolioAnim.setSpeed(0.75)
          }
        }, 0)
      } else {
        console.log(
          new Date().toISOString() +
            ' - animations not loaded cause we are not in the browser'
        )
      }
    } catch (error) {
      console.log('loadAnimations - error', error)
    }
  }
}

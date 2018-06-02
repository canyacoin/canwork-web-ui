import { Injectable } from '@angular/core';

@Injectable()
export class AnimationService {

  theWindow = (<any>window).$(window);
  winHeight = this.theWindow.height();
  animDuration = this.winHeight * 3;

  deskAnim = null;
  consultAnim = null;
  airportAnim = null;
  homeAnim = null;
  handAnim = null;
  portfolioAnim = null;

  constructor() {
    if (navigator.userAgent.match(/Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i)) {
      this.animDuration = this.winHeight * 8;
    } else if (navigator.userAgent.match(/Tablet|iPad/i)) {
      this.animDuration = this.winHeight * 4;
    }
  }

  resetAnimations() {
    if (this.deskAnim) {
      this.deskAnim = null;
    }
    if (this.consultAnim) {
      this.consultAnim = null;
    }
    if (this.airportAnim) {
      this.airportAnim = null;
    }
    if (this.homeAnim) {
      this.homeAnim = null;
    }
    if (this.handAnim) {
      this.handAnim = null;
    }
    if (this.portfolioAnim) {
      this.portfolioAnim = null;
    }
  }

  loadAnimations() {
    try {
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
            }
          };
          this.deskAnim = (<any>window).bodymovin.loadAnimation(deskData);
          this.deskAnim.setSpeed(0.75);
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
              progressiveLoad: false
            }
          };
          this.consultAnim = (<any>window).bodymovin.loadAnimation(consultData);
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
              progressiveLoad: false
            }
          };
          this.airportAnim = (<any>window).bodymovin.loadAnimation(airportData);
          this.airportAnim.setSpeed(0.25);
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
              progressiveLoad: false
            }
          };
          this.homeAnim = (<any>window).bodymovin.loadAnimation(homeData);
          this.homeAnim.setSpeed(0.75);
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
              progressiveLoad: false
            }
          };
          this.handAnim = (<any>window).bodymovin.loadAnimation(handData);
          this.handAnim.setSpeed(0.75);
        }
      }, 0);

    } catch (error) {
      console.log('loadAnimations - error', error);
    }
  }

  animatebodymovin(duration, animObject) {
    const scrollPosition = this.theWindow.scrollTop();
    const maxFrames = animObject.totalFrames;
    const frame = (maxFrames / 100) * (scrollPosition / (duration / 100));
    animObject.goToAndStop(frame, true);
  }
}

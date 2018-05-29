'use strict';

$(function () {

  /*
  |--------------------------------------------------------------------------
  | Configure your website
  |--------------------------------------------------------------------------
  |
  | We provided several configuration variables for your ease of development.
  | Read their complete description and modify them based on your need.
  |
  */

  thesaas.config({

    /*
    |--------------------------------------------------------------------------
    | Google API Key
    |--------------------------------------------------------------------------
    |
    | Here you may specify your Google API key if you need to use Google Maps
    | in your application
    |
    | https://developers.google.com/maps/documentation/javascript/get-api-key
    |
    */

    googleApiKey: 'AIzaSyDRBLFOTTh2NFM93HpUA4ZrA99yKnCAsto',

    /*
    |--------------------------------------------------------------------------
    | Google Analytics Tracking
    |--------------------------------------------------------------------------
    |
    | If you want to use Google Analytics, you can specify your Tracking ID in
    | this option. Your key would be a value like: UA-12345678-9
    |
    */

    googleAnalyticsId: '',

    /*
    |--------------------------------------------------------------------------
    | Smooth Scroll
    |--------------------------------------------------------------------------
    |
    | If true, the browser's scrollbar moves smoothly on scroll and gives your
    | visitor a better experience for scrolling.
    |
    */

    smoothScroll: true

  });


  /*
  |--------------------------------------------------------------------------
  | Custom Javascript code
  |--------------------------------------------------------------------------
  |
  | Now that you configured your website, you can write additional Javascript
  | code below this comment. You might want to add more plugins and initialize
  | them in this file.
  |
  */

  // const theWindow = $(window);
  // const winHeight = theWindow.height();
  // var animDuration = winHeight * 3;
  // if (navigator.userAgent.match(/Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i)) {
  //   animDuration = winHeight * 8;
  // } else if (/Tablet|iPad/i) {
  //   animDuration = winHeight * 4;
  // }
  // var deskAnim = null;
  // var consultAnim = null;
  // var airportAnim = null;
  // var homeAnim = null;
  // var handAnim = null;
  // var portfolioAnim = null;

  // if (document.getElementById('desk')) {
  //   const deskData = {
  //     wrapper: document.getElementById('desk'),
  //     animType: 'html',
  //     loop: true,
  //     prerender: true,
  //     autoplay: true,
  //     path: 'assets/data/desk.json',
  //     rendererSettings: {
  //       progressiveLoad: false, // Boolean, only svg renderer, loads dom elements when needed. Might speed up initialization for large number of elements.
  //     }
  //   };
  //   deskAnim = bodymovin.loadAnimation(deskData);
  //   deskAnim.setSpeed(0.75);
  // }

  /*/////////////////////////////////////////////////////////////////*/

  // svg
  // renderer: 'canvas',
  // if (document.getElementById('consult')) {
  //   const consultData = {
  //     wrapper: document.getElementById('consult'),
  //     animType: 'html',
  //     loop: false,
  //     prerender: true,
  //     autoplay: false,
  //     path: 'assets/data/consult.json',
  //     rendererSettings: {
  //       progressiveLoad: false
  //     }
  //   };
  //   consultAnim = bodymovin.loadAnimation(consultData);
  //   // consultAnim.setSpeed(0.75);
  // }

  // if (document.getElementById('airport')) {
  //   /*/////////////////////////////////////////////////////////////////*/

  //   const airportData = {
  //     wrapper: document.getElementById('airport'),
  //     animType: 'html',
  //     loop: false,
  //     prerender: true,
  //     autoplay: false,
  //     path: 'assets/data/airport.json',
  //     rendererSettings: {
  //       progressiveLoad: false
  //     }
  //   };
  //   airportAnim = bodymovin.loadAnimation(airportData);
  //   // airportAnim.setSpeed(0.75);
  // }

  // if (document.getElementById('home')) {
  //   /*/////////////////////////////////////////////////////////////////*/

  //   const homeData = {
  //     wrapper: document.getElementById('home'),
  //     animType: 'html',
  //     loop: true,
  //     prerender: true,
  //     autoplay: true,
  //     path: 'assets/data/home.json',
  //     rendererSettings: {
  //       progressiveLoad: false
  //     }
  //   };
  //   homeAnim = bodymovin.loadAnimation(homeData);
  //   homeAnim.setSpeed(0.75);
  // }

  // if (document.getElementById('hand')) {

  //   /*/////////////////////////////////////////////////////////////////*/

  //   const handData = {
  //     wrapper: document.getElementById('hand'),
  //     animType: 'html',
  //     loop: true,
  //     prerender: true,
  //     autoplay: true,
  //     path: 'assets/data/hand.json',
  //     rendererSettings: {
  //       progressiveLoad: false
  //     }
  //   };
  //   handAnim = bodymovin.loadAnimation(handData);
  //   handAnim.setSpeed(0.75);
  // }

  /*/////////////////////////////////////////////////////////////////*/

  // theWindow.scroll(function () {
  //   if (consultAnim) {
  //     animatebodymovin(animDuration, consultAnim);
  //   }

  //   if (airportAnim) {
  //     animatebodymovin(animDuration / 2, airportAnim);
  //   }
  // });

  // function animatebodymovin(duration, animObject) {
  //   const scrollPosition = theWindow.scrollTop();
  //   const maxFrames = animObject.totalFrames;
  //   const frame = (maxFrames / 100) * (scrollPosition / (duration / 100));
  //   animObject.goToAndStop(frame, true);
  // }

  $('[data-toggle="popover"]').popover({
    container: 'body'
  });
});

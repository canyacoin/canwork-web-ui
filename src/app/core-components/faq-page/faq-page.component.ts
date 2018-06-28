import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css']
})
export class FaqPageComponent implements OnInit {
  faqs = [
      {q: "Who is CanWork for?", a: "CANWork is for digital online services (eg. graphics designers, content writers, digital marketing specialists) Future service, CANTasker, will serve local services"},
      {q: "Why CanWork?", a:""},
      {q: "How do I get started?",a:""},
      {q: "Do I have to pay to join?",a:"No, it's completely free!"},
      {q: "Who is a 'provider'?",a:"A 'provider' is anyone offerring a service via the CanYa Ecosystem"},
      {q: "What are 'pioneers' and 'ambassadors' ?",a:"'Prioneers' are the first 20 providers hand-picked by CanYa. 'Ambassadors' are first 200 providers after the pioneers. "},
      {q: "What is CanYaCoin? (CAN)?",a:""},
      {q: "Why do I have to use CAN?",a:""},
      {q: "How do I buy CAN?",a:""},
      {q: "Can I use BTC?",a:""},
      {q: "What happens if there is a dispute?",a:"Initially CanYa will arbitrate to resolve the dispute. Disputes are rare, 1 in 1000 cases."},
      {q: "How can I trust to get paid?",a:"All funds are held in our escrow smart contract so you will get paid upon completion."},
      {q: "How can I cancel a contract?",a:""},
      {q: "How do I control the notification settings I receive?",a:""},
      {q: "What happens if crypto price changes?",a:""}

  ]
  constructor() { }

  ngOnInit() {
  }

}

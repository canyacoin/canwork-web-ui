import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css']
})
export class FaqPageComponent implements OnInit {
  faqs = [
      {q: "Who is CanWork for?", a: "CANWork is for digital online services (eg. graphics designers, content writers, digital marketing specialists) Future service, CANTasker, will serve local services"},
      {q: "How do I get started?",a:"Sign up for CanWork in the top right hand corner and follow the prompts. When your signing up as a provider you will need to be whitelisted, a free process that take up to 72 hours to determine if your eligible to be a provider."},
      {q: "Do I have to pay to join?",a:"No, it's completely free!"},
      {q: "Who is a 'provider'?",a:"A 'provider' is anyone offerring a service via the CanYa Ecosystem"},
      {q: "What are 'pioneers' and 'ambassadors' ?",a:"'Prioneers' are the first 20 providers hand-picked by CanYa. 'Ambassadors' are first 200 providers after the pioneers. "},
      {q: "How much does CanWork costs?", a:"CanWork is free to use! however there is a 1% service charge that happens once payment is released from escrow." },
      {q: "What is CanYaCoin? (CAN)?",a:"The CAN token is an ERC-20 compliant token.The CanYaCoin (CAN) powers the platform’s payment system, enabling a decentralised, trustless and hedged escrow service, a bridge between fiat and a variety of cryptocurrencies, and a powerful rewards system to encourage network effects. The CAN token is also the token that powers the CanYaDAO and provides value to incentivise a decentralised taskforce to support the CANApps"},
      {q: "Why do I have to use CAN?",a:"CAN token can be used within our ecosystem for purchases or jobs, CAN can also be converted into Ethereum."},
      {q: "How do I get paid?",a:"When you accept or issue a contract, the money moves into an escrow with a smart contract. While in the escrow account the amount can not be changed without consent from both parties. Once a job is completed and both parties are happy, the money will be release and sent to you."},
      {q: "What wallet do I have to use?", a:"We currently support Metamask for crypto payments."},
      {q: "Do I have to use Metamask?", a:"If you are simply browsing our platform you won’t need to use metamask. Metamask is only required for payments."},
      {q: "How can I trust to get paid?",a:"All funds are held in our escrow smart contract so you will get paid upon completion."},
      {q: "What happens if there is a dispute?",a:"Initially CanYa will arbitrate to resolve the dispute. Disputes are rare, 1 in 1000 cases."},
      {q: "Can I cancel a contract?",a:"Yes,  once the contract has been started you can cancel it at any time. To cancel a contract go to the manage job page and click on the options button for that job. Note that until final payments are finalised, the provider owns the work.      "},
      {q: "How do I control the notification settings I receive?",a:"Yes, currently your notifications are only about job requests and will come via email. You can unsubscribe from these emails anytime, at the bottom of the email. If you would like to see CanYa updates you can go to canya.io"},
      {q: "How do I buy CAN?",a:"You can buy them using the Bancor widget, or you can download them from exchanges such as KuCoin"}
  ]
  constructor() { }

  ngOnInit() {
  }

}

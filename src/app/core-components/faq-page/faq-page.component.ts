import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css']
})
export class FaqPageComponent implements OnInit {
  faqs = [
      {q: "Who is CANwork for?", a: "CANwork is a platform for clients to find quality providers who offer digital services (eg. software engineering, graphics design, content writing, digital marketing). "},
      {q: "Why CANwork?",a:"CANwork only takes 1% in service fees when you make a transaction. This means that when you receive payment for your work, you take more of your hard earned salary home. You can expect high quality providers from CANwork. This because all of our providers are hand picked and vetted for their skills. CANwork is decentralised  - CANWork does not and will never keep or distribute your personal data. CANwork provides fantastic utility for the many unbanked agents in the developing world. Cryptocurrency payments allow for international transactions to be processed quickly and with less fees.Payments on CANwork are enabled for use globally. Those in countries where paypal is not available don’t have to worry when using our platform because our transactions are all made using cryptocurrency. National currency such as USD and AUD transactions coming soon. CANwork has a global reach because of the borderless nature of crypto payments.  This is particularly beneficial as it gives everyone equal opportunity to access the global gig economy, and most importantly equal opportunity to earn an equivalent wage. CANwork is continually being optimised for your experience. We pride ourselves on the fact that CANwork is made from insights from our community. We are a platform for gig workers, designed by gig workers. CANwork has created a suite of free tools which allows a sole operator to build and operate their business from their own computer."},
      {q: "How do I get started as a provider?", a: "Join CANwork and set up your account as a provider. You will then receive an email from us to get started with completing your profile. When your signing up as a provider you will need to be whitelisted, which can take up to 72 hours to determine if your eligible to be a provider."},
      {q: "How do I get started as a client?", a: "Simply join CANwork and set your account up as a client. You will then have full access to the platform, and be able to communicate with any service provider. "},
      {q: "Do I have to pay to join?",a:"No, it's completely free!"},
      {q: "What is CanYaCoin? (CAN)?",a:"The CAN token is an ERC-20 compliant token.The CanYaCoin (CAN) powers the platform’s payment system, enabling a decentralised, trustless and hedged escrow service, a bridge between fiat and a variety of cryptocurrencies, and a powerful rewards system to encourage network effects. The CAN token is also the token that powers the CanYaDAO and provides value to incentivise a decentralised taskforce to support the CANApps. "},
      {q: "Why do I have to use CAN?",a:"CAN token is the native token of the CanYa Ecosystem. All transactions on CANwork and the CanYa ecosystem are done in CAN tokens power our payment system, and allows us to charge only 1% in fees. We are focused on providing utility to the token which will in turn help the health of our token and provides incentive for users to hold CAN tokens as our platform continues to develop."},
      {q: "Can I use Bitcoin (BTC)?", a:"Not yet. We will be working to make our escrow handle BTC payments in the future."},
      {q: "How can I trust to get paid?",a:"All funds awaiting completion of a job are held in our escrow smart contract. They are only released when both parties (client and provider) agree that they are satisfied. In the case of when there is a job dispute, users can flag their issue and prompt our CanYaDAO. The CanYaDAO admins will handle disputes through voting to work towards the best outcome possible for both parties."},
      {q: "How can I cancel a contract?" a:"We discourage cancelling a contract, but in the case where a contract must be cancelled, you are able to do so. To cancel a contract, go to the manage jobs page and select the job which you would like to cancel. All users must agree before cancelling the job. If the client cancels the job, they must pay the provider for any work completed. If the provider cancels the job, the client will have receive a refund by default. In the case where there is a dispute, the CanYaDAO can help!"},
      {q: "How do I control the notification settings I receive?", a:"Notifications from CANwork currently are sent via email. You can unsubscribe from these emails anytime, at the bottom of the email. If you would like to see CanYa updates you can go to canya.io."},
      {q: "What happens if crypto price changes?", a:"CanYa’s hedged escrow service mitigates against market volatility. If you’ve quoted, for example, $500 USD in CAN tokens for a job, you will receive the same value of $500 USD in CAN upon completing the job regardless of changes in CanYaCoin price. "},
      {q: "How do I buy CAN?",a:"You can buy them using the Bancor widget, or you can download them from exchanges such as KuCoin"},
      {q: "How much does CanWork costs?", a:"CanWork is free to use or browse. However there is a 1% service charge that happens once payment is released from escrow." },
      {q: "What wallet do I have to use?", a:"We currently support Metamask for crypto payments."},
      {q: "Do I have to use Metamask?", a:"If you are simply browsing our platform you won’t need to use metamask. Metamask is only required for payments."},
      {q: "Can I access it on my mobile?", a:"You can! However you will not be able to do any Web3 enhancements, such as payments, on your usual browsers such as safari or chrome on mobile. To do that, you will need to use web-capable wallet apps, such as Trust Browser."},
      {q: "Can I set up multiple accounts?", a:"We discourage making multiple accounts. If you would like to be both provider and a client, you are able to do so. A provider can contact another provider if they, for example, want to sub-contract for a job."},
      {q: "If I have a grievance with the other party during a job is there a way to fairly resolve it?",a:"If you have a problem while working we have systems in place to ensure fair judgement. This will be resolved by members of the CanYa DAO. "},
      {q: "What is the CanYa DAO?", a:"The CanYa DAO is a group of trusted users that judge grievance claims. By selecting the right side of the argument they will recieve CAN tokens and by choosing the wrong side they will be fined and their reputation and sway in the decision making process will be compromised."},
      {q: "Who can see my profile?", a:"Everyone can see your profile, we use a shuffling algorithm to make sure that everyone gets a turn at the top of the page. In the future, we will be implementing review systems and premium spots so that you can increase your exposure. "},
      {q: "I need to download some assets from CanYa, where can I get them?", a: "You can download them from CanStyle.io"}
  ]
  constructor() { }

  ngOnInit() {
  }

}

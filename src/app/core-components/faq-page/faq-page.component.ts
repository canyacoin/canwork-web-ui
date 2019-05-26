import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css']
})
export class FaqPageComponent implements OnInit {
  faqs = [
    {
      index: 'q-1',
      q: 'Who is CANwork for?',
      a: 'CANWork is a platform for clients to find quality providers who offer digital services (eg. software engineering, graphics design, content writing, digital marketing). '
    },
    {
      index: 'q-2',
      q: 'Why CANwork?',
      a: 'CANwork only takes 1% in service fees when you make a transaction. This means that when you receive payment for your work, you take more of your hard earned salary home. You can expect high quality providers from CANwork. This because all of our providers are hand picked and vetted for their skills. CANwork is decentralised  - CANWork does not and will never keep or distribute your personal data. CANwork provides fantastic utility for the many unbanked agents in the developing world. Cryptocurrency payments allow for international transactions to be processed quickly and with less fees. Payments on CANwork are enabled for use globally. Those in countries where paypal is not available don’t have to worry when using our platform because our transactions are all made using cryptocurrency. National currency such as USD and AUD transactions coming soon. CANwork has a global reach because of the borderless nature of crypto payments.  This is particularly beneficial as it gives everyone equal opportunity to access the global gig economy, and most importantly equal opportunity to earn an equivalent wage. CANwork is continually being optimised for your experience. CANwork is made from insights from our community and is a platform for gig workers, designed by gig workers. CANwork has created a suite of free tools which allows a sole operator to build and operate their business from their own computer.'
    },
    {
      index: 'q-3',
      q: 'How do I get started as a provider?',
      a: 'Join CANwork and set up your account as a provider. You will then receive an email to get started with completing your profile. When your signing up as a provider you will need to be whitelisted, which can take up to 72 hours to determine if your eligible to be a provider.'
    },
    {
      index: 'q-4',
      q: 'How do I get started as a client?',
      a: 'Simply join CANwork and set your account up as a client. You will then have full access to the platform, and be able to communicate with any service provider. '
    },
    {
      index: 'q-5',
      q: 'Do I have to pay to join?',
      a: 'No, joining is completely free!'
    },
    {
      index: 'q-6',
      q: 'What is CanYaCoin? (CAN)',
      a: 'CanYaCoin or CAN is the token which powers the platform’s payment system, enabling a decentralised, trustless escrow service. The escrow is a bridge between a variety of cryptocurrencies.'
    },
    {
      index: 'q-7',
      q: 'Why do I have to use CAN?',
      a: 'CAN token is the native token of the CanYa Ecosystem, providing a bridge between other currencies. The CAN token is integrated into the hedged escrow, ensuring that all transactions on the platform are hedged and free from price volatility.'
    },
    {
      index: 'q-8',
      q: 'Can I use BTC (Bitcoin)?',
      a: 'Not yet. The community will be working to make the escrow handle BTC payments in the future.'
    },
    {
      index: 'q-9',
      q: 'How can I trust to get paid?',
      a: 'All funds awaiting completion of a job are held in the escrow smart contract. They are only released when both parties (client and provider) agree that they are satisfied. In the case of when there is a job dispute, users can flag their issue and prompt CanYa support.'
    },
    {
      index: 'q-10',
      q: 'How can I cancel a contract?',
      a: 'In the case where a contract must be cancelled, you are able to do so. To cancel a contract, go to the manage jobs page and select the job which you would like to cancel. All users must agree before cancelling the job. If the client cancels the job, they must pay the provider for any work completed. If the provider cancels the job, the client will have receive a refund by default. In the case where there is a dispute, the CanYa Support can help!'
    },
    {
      index: 'q-11',
      q: 'How do I control the notification settings I receive?',
      a: 'Notifications from CANwork currently are sent via email. You can unsubscribe from these emails anytime, at the bottom of the email. If you would like to see CanYa updates you can go to canya.io.'
    },
    {
      index: 'q-12',
      q: 'What happens if crypto price changes?',
      a: 'CanYa’s hedged escrow service mitigates against market volatility. If you’ve quoted, for example, $500 USD in CAN tokens for a job, you will receive the same value of $500 USD in CAN upon completing the job regardless of changes in CanYaCoin price.'
    },
    {
      index: 'q-13',
      q: 'How do I buy CAN?',
      a: 'You can buy CAN through the Bancor widget in CANwork or you can buy them through an exchange. You can the links to all available exchanges from the exchanges page, accessible from your profile page.'
    },
    {
      index: 'q-14',
      q: 'How much does CanWork cost?',
      a: 'CanWork, costs nothing to use or browse, there is a 1% service charge that happens once payment is released from escrow.'
    },
    {
      index: 'q-15',
      q: 'How do I get paid?',
      a: 'When you accept or issue a contract, the money moves into escrow. While in the escrow account the amount can not be changed without consent from both parties. Once a job is completed and both parties are happy, the money will be release and sent to you.'
    },
    {
      index: 'q-16',
      q: 'What wallet should I use?',
      a: 'Use metamask for payments.'
    },
    {
      index: 'q-18',
      q: 'Do I have to use Metamask?',
      a: 'If you are simply browsing our platform you won’t need to use metamask. Metamask is only required for payments.'
    },
    {
      index: 'q-19',
      q: 'Can anybody be apply to be a provider ?',
      a: 'Yes! However providers will be screened through the CanYa support for QA.'
    },
    {
      index: 'q-20',
      q: 'Can I access it on my mobile phone?',
      a: 'You can! However you will not be able to do any Web3 enhancements, such as payments, on your usual browsers such as safari or chrome on mobile. To do that, you will need to use Trust Browser. You can download trust browser on the app store or the google play store.'
    },
    {
      index: 'q-21',
      q: 'Can I set up multiple accounts?',
      a: 'If you would like to be both provider and a client, you are able to do so. A provider can contact another provider if they, for example, want to sub-contract for a job.'
    },
    {
      index: 'q-23',
      q: 'If I have a dispute with the other party during a job is there a way to fairly resolve it?',
      a: 'If you have a problem while working CanWork has systems in place to ensure fair judgement. This will be resolved by members of the CanYa support.'
    },
    {
      index: 'q-24',
      q: 'Who can see my profile?',
      a: 'Everyone can see your profile, CanWork uses a shuffling algorithm to make sure that everyone gets a turn at the top of the page. In the future, the CanWork team will be implementing review systems and premium spots so that you can increase your exposure.'
    }
  ];
  queryFaqs: any = [];
  constructor() { }
  isOnMobile = false;

  ngOnInit() {
    const ua = window.navigator.userAgent;
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    this.onSearch('');
  }
  onKeyUp(event: any) {
    this.onSearch(event);
  }
  onSearch(query: string) {
    if (query !== '') {
      const tmpFaq: any = [];
      this.faqs.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
          tmpFaq.push(item);
        }
      });
      this.queryFaqs = tmpFaq;
    } else {
      this.queryFaqs = this.faqs;
    }
  }
}

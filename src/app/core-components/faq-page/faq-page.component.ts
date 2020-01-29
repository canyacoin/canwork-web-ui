import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css'],
})
export class FaqPageComponent implements OnInit {
  faqs = [
    {
      index: 'q-1',
      q: 'Who is CanWork for?',
      a:
        'CanWork is a digital services marketplace for software engineers, graphics designers, content creators, digital marketers, virtual assitants or anyone with a digital service. If you are looking to hire or provider digital services using Binance Chain (BEP2) assets, CanWork is for you!',
    },
    {
      index: 'q-2',
      q: 'Why CanWork?',
      a:
        'CanWork is the digital service marketplace on Binance Chain. CanWork only takes a 1% payment fee.',
    },
    {
      index: 'q-3',
      q: 'How do I get started as a provider?',
      a:
        'Join CanWork and set up your account as a provider. You will need a Binance Chain (BEP2) wallet address to complete profile setup.  Note: your profile must meet a mininum standard quality and is subject to approval.',
    },
    {
      index: 'q-4',
      q: 'How do I get started as a client?',
      a:
        'Simply join CanWork and set your account up as a client. You will then have full access to the platform, and be able to communicate with any service provider.',
    },
    {
      index: 'q-5',
      q: 'Do I have to pay to join?',
      a: 'No, joining is completely free!',
    },
    {
      index: 'q-6',
      q: 'What is CanYaCoin? (CAN)',
      a:
        'CanYaCoin or CAN is the native token that powers the platform’s payment system and will be the bridge between all Binance Chain (BEP2) assets',
    },
    {
      index: 'q-7',
      q: 'Why do I have to use CAN?',
      a:
        'The CAN token is the only accepted token for now.   In early 2020, CanWork will accept all Binance Chain (BEP2) assets.',
    },
    {
      index: 'q-8',
      q: 'Can I use BTC (Bitcoin)?',
      a:
        'Not yet. However, other Binance Chain projects are developing cross-chain swaps including with BTC.',
    },
    {
      index: 'q-9',
      q: 'How can I trust to get paid?',
      a:
        'All funds awaiting completion of a job are held in escrow. They are only released when both parties (client and provider) agree that they are satisfied. In the case a job dispute, users can flag their issue and prompt CanYa support.',
    },
    {
      index: 'q-10',
      q: 'How can I cancel a contract?',
      a:
        'In the case where a contract must be cancelled, you are able to do so. To cancel a contract, go to the manage jobs page and select the job which you would like to cancel. All users must agree before cancelling the job. If the client cancels the job, they must pay the provider for any work completed. If the provider cancels the job, the client will have receive a refund by default. In the case where there is a dispute, the CanYa Support can help!',
    },
    {
      index: 'q-11',
      q: 'How do I control the notification settings I receive?',
      a:
        'Notifications from CanWork currently are sent via email. You can unsubscribe from these emails anytime, at the bottom of the email. If you would like to see CanYa updates you can go to canya.io.',
    },
    {
      index: 'q-12',
      q: 'What happens if crypto price changes?',
      a:
        'Our escrow service is hedged and mitigates against market volatility. If you’ve quoted, for example, $500 USD in CAN tokens for a job, you will receive the same value of $500 USD in CAN upon completing the job regardless of changes in CanYaCoin price.',
    },
    {
      index: 'q-13',
      q: 'How do I buy CAN?',
      a:
        'You can buy CAN through the Binance DEX https://binance.org. CanWork will soon support all BEP2 assets, not just CAN',
    },
    {
      index: 'q-14',
      q: 'How much does CanWork cost?',
      a:
        'CanWork, costs nothing to use or browse, there is a 1% service charge that happens once payment is released from escrow.',
    },
    {
      index: 'q-15',
      q: 'How do I get paid?',
      a:
        'When you accept or issue a contract, the money moves into escrow. While in the escrow account the amount can not be changed without consent from both parties. Once a job is completed and both parties are happy, the money will be release and sent to you.',
    },
    {
      index: 'q-16',
      q: 'What wallet should I use?',
      a:
        'CanWork connects seemlessly with any wallet that supports Binance Chain (BEP2) assets.   You can connect your wallet via WalletConnect, Ledger or KeyStore.   We recommend Trust Wallet https://trustwallet.com/.',
    },
    {
      index: 'q-17',
      q: 'Can anybody apply to be a provider ?',
      a:
        'Yes! However providers will be screened through the CanYa support for quality assurance.',
    },
    {
      index: 'q-19',
      q: 'Can I set up multiple accounts?',
      a:
        'If you would like to be both provider and a client, you are able to do so. A provider can contact another provider if they, for example, want to sub-contract for a job.',
    },
    {
      index: 'q-20',
      q:
        'If I have a dispute with the other party during a job is there a way to fairly resolve it?',
      a:
        'Dont worry.  The funds are escrowed until all parties agree.  If you have a problem while working, CanWork has systems in place to ensure fair judgement. You can contact support at anytime at support@canya.com',
    },
    {
      index: 'q-24',
      q: 'Who can see my profile?',
      a:
        'Everyone can see your profile, CanWork uses a shuffling algorithm to make sure that everyone gets a turn at the top of the page. In the future, the CanWork team will be implementing review systems and premium spots so that you can increase your exposure.',
    },
  ]
  queryFaqs: any = []
  constructor() {}
  isOnMobile = false

  ngOnInit() {
    const ua = window.navigator.userAgent
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    )
    this.onSearch('')
  }
  onKeyUp(event: any) {
    this.onSearch(event)
  }
  onSearch(query: string) {
    if (query !== '') {
      const tmpFaq: any = []
      this.faqs.map(item => {
        if (
          JSON.stringify(item)
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
          tmpFaq.push(item)
        }
      })
      this.queryFaqs = tmpFaq
    } else {
      this.queryFaqs = this.faqs
    }
  }
}

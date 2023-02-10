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
        'CanWork is a digital services marketplace for software engineers, graphics designers, content creators, digital marketers, virtual assitants or anyone with a digital service. If you are looking to hire or provide digital services using BNB Chain, CanWork is for you!',
    },
    {
      index: 'q-2',
      q: 'Why CanWork?',
      a:
        'CanWork is the digital service marketplace on BNB Chain. CanWork only takes a 1% payment fee.',
    },
    {
      index: 'q-3',
      q: 'How do I get started as a provider?',
      a:
        'Join CanWork and set up your account as a provider. You will need a BNB Chain wallet address to complete profile setup.  You can connect via MetaMask or WalletConnect.  Note: your profile must meet a mininum standard quality and is subject to approval.',
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
        'CanYaCoin or CAN is the original token that powered the CanWork ecosystem.  We have since removed the need to use the native CAN token on the platform and use platform fees to buy CAN off the market.',
    },
    {
      index: 'q-7',
      q: 'How do I pay?',
      a:
        'As a client you can pay into escrow using BNB & selected BEP20 tokens.  Providers will always be paid in BUSD.',
    },
    {
      index: 'q-8',
      q: 'Can I use native BTC (Bitcoin) or ETH (Ethereum)?',
      a:
        'No, we currently only acccept BNB Chain assets such as BNB and selected BEP20 tokens.',
    },
    {
      index: 'q-9',
      q: 'How can I trust to get paid?',
      a:
        'All funds awaiting completion of a job are held in escrow. They are only released when both parties (client and provider) agree that they are satisfied. In the case a job dispute, users can flag their issue and prompt CanWork support.',
    },
    {
      index: 'q-10',
      q: 'How can I cancel a contract?',
      a:
        'In the case where a contract must be cancelled, you are able to do so. To cancel a contract, go to the manage jobs page and select the job which you would like to cancel. All users must agree before cancelling the job. If the client cancels the job, they must pay the provider for any work completed. If the provider cancels the job, the client will have receive a refund by default. In the case where there is a dispute, the CanWork Support can help!',
    },
    {
      index: 'q-11',
      q: 'How do I control the notification settings I receive?',
      a:
        'Notifications from CanWork currently are sent via email. You can unsubscribe from these emails anytime, at the bottom of the email.',
    },
    {
      index: 'q-12',
      q: 'What happens if crypto price changes?',
      a:
        'Our escrow service automatically liquidates tokens to the BUSD stablecoin at time of deposit, to protect against market volatility. Providers will be paid in BUSD when the job is complete.',
    },
    {
      index: 'q-14',
      q: 'How much does CanWork cost?',
      a:
        'CanWork costs nothing to use or browse.  There is a 1% service charge that happens once payment is released from escrow.',
    },
    {
      index: 'q-15',
      q: 'How do I get paid?',
      a:
        'You get paid in the Binance USD Stablecoin (BUSD)as soon as the job is completed and accepted by the Client.  When you accept or issue a contract, the money moves into escrow. While in the escrow account the amount can not be changed without consent from both parties. Once a job is completed and both parties are happy, the money will be release and sent to you.',
    },
    {
      index: 'q-16',
      q: 'What wallet should I use?',
      a:
        'CanWork connects seemlessly with Metamask and WalletConnect. We recommend and use Trust Wallet https://www.trustwallet.com.',
    },
    {
      index: 'q-17',
      q: 'Can anybody apply to be a provider ?',
      a:
        'Yes! However providers will be screened through the CanWork support for quality assurance.',
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
        'Dont worry.  The funds are escrowed until all parties agree.  If you have a problem while working, CanWork has systems in place to ensure fair judgement. You can contact support at anytime at support@canwork.io',
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

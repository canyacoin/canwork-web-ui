import { ActionType } from './job-action-type'
import { UserType } from './user-type'

const sgMail = require('@sendgrid/mail')
const replyTo = 'CanWork - No Reply <noreply@canya.com>'
/*
 * Interfaces
 */
interface EmailMessage {
  to: string
  from?: string
  subject: string
  title: string
  bodyHtml: string
}

interface IJobStateEmailNotification {
  interpolateTemplates(db: FirebaseFirestore.Firestore, jobId: string): void
  deliver(sendgridApiKey: string, returnUri: string): void
}

/*
 * Abstract (Parent/Base Class)
 */
abstract class AEmailNotification implements IJobStateEmailNotification {
  db: FirebaseFirestore.Firestore
  initiatedByUid: string
  jobId: string
  jobData: any
  clientData: any
  providerData: any
  emailMessages: EmailMessage[]

  constructor() {
    this.emailMessages = new Array()
  }

  // Parent method for building 'EmailMessage' objects.
  // Each factory calls this with super.interpolateTemplates(db, jobId);
  // And then does it's own work to interpolate the html template
  public interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    this.db = db
    console.log('AEmailNotification.interpolateTemplates()')
    return this.populateDataObjects(jobId)
  }

  // Send the built 'EmailMessage' via sendgrid
  public deliver(sendgridApiKey: string, returnUri: string): void {
    sgMail.setApiKey(sendgridApiKey)
    sgMail.setSubstitutionWrappers('{{', '}}')

    this.emailMessages.forEach(emailMessage => {
      console.log('+ sending message to', emailMessage.to)
      sgMail.send(
        {
          to: emailMessage.to,
          from: replyTo,
          subject: emailMessage.subject,
          html: emailMessage.bodyHtml,
          substitutions: {
            title: emailMessage.title,
            returnLinkText: 'View Job Details Here',
            returnLinkUrl: `${returnUri}/inbox/job/${this.jobData.id}`,
          },
          templateId: '4fc71b33-e493-4e60-bf5f-d94721419db5',
        },
        (error, result) => {
          if (error) {
            console.error('! error sending message:', error.response.body)
          }
        }
      )
    })
  }

  // Get a user by ID
  private async getUserObjects(userId: string): Promise<any> {
    console.log('AEmailNotification.getUserObjects() userId:', userId)
    try {
      const user = await this.db
        .collection('users')
        .doc(userId)
        .get()
      console.log('+ user data retrieved for:', user.data().email)
      return user.data()
    } catch (error) {
      console.error(`! unable to retrieve user data using ID: ${userId}`, error)
      throw new Error(error)
    }
  }

  // Locate the job document in the collection, and populate the this.jobData object member
  private async populateDataObjects(jobId: string) {
    console.log('AEmailNotification.populateJobData()')
    // Get the job object from the 'jobs' collection
    try {
      const data = await this.db
        .collection('jobs')
        .doc(jobId)
        .get()
      this.jobData = data.data()
      console.log('+ job data populated:', this.jobData)
    } catch (error) {
      console.error(`! unable to retrieve job data using ID: ${jobId}`, error)
      throw new Error(error)
    }
    if (!this.jobData) {
      const error = `no job data could be found using ID: ${jobId}`
      console.warn(error)
    }
    console.log('+ retrieved job data:', this.jobData)

    // Populate the required user objects for client & provider:
    this.clientData = await this.getUserObjects(this.jobData.clientId)
    this.providerData = await this.getUserObjects(this.jobData.providerId)
  }

  getRecipient() {
    const lastJobAction = this.jobData.actionLog[
      this.jobData.actionLog.length - 1
    ]
    return lastJobAction.executedBy === UserType.client
      ? this.providerData
      : this.clientData
  }

  getSender() {
    const lastJobAction = this.jobData.actionLog[
      this.jobData.actionLog.length - 1
    ]
    return lastJobAction.executedBy === UserType.client
      ? this.clientData
      : this.providerData
  }
}

/*
 * Implementations
 */

// Send notification to the provider that a new job has been requested
class ProviderJobRequestNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('ProviderJobRequestNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }
    const title = `You have a work request from ${this.clientData.name}`
    this.emailMessages.push({
      to: this.providerData.email,
      from: replyTo,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.providerData.name},<br>
      ${this.clientData.name} has requested a job:
      "${this.jobData.information.title}".
      Please login to CanWork to review this job.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

class CancelJobNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('CancelJobNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()
    const title = `${sender.name} has cancelled the job`

    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} has cancelled a job:
      "${this.jobData.information.description}".`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

// Send notification to client that the requested job has been accepted by the provider
class JobRequestAcceptedNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('JobRequestAcceptedNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()
    const title = `Your work request to ${sender.name} has been accepted`

    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} has accepted your job request:
      "${this.jobData.information.description}".
      A payment into the escrow is now required to proceed.<br><br>
      Please login to CanWork to make the payment.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

// Send notification to client that the requested job has been declined
class JobRequestDeclinedNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('JobRequestDeclinedNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()
    const title = `Your work request to ${sender.name} has been declined`

    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} has declined your job request:
      "${this.jobData.information.description}".
      Please login to CanWork to review this job.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

// Send notification to provider that the requested job has a counter offer
class JobRequestCounterOfferNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('JobRequestCounterOfferNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()

    const title = `Job: ${this.jobData.information.title}, has a counter offer`
    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} has made a counter offer to your job request:
      "${this.jobData.information.title}".
      Please login to CanWork to review this job.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

class AddMessageNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('AddMessageNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()

    const title = `${sender.name} sent you a message via CanWork`
    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} just sent you a message regarding the job:
      "${this.jobData.information.title}".
      Login to CanWork to see this message.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

class FinishedJobNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('FinishedJobNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const title = `${this.providerData.name} has marked the job as finished`
    this.emailMessages.push({
      to: this.clientData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.clientData.name},<br>
      ${this.providerData.name} has marked the job:
      "${this.jobData.information.title}" as finished.
      Login to CanWork to complete the job and release the funds from escrow.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

class AcceptFinishNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('AcceptFinishNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const title = `${this.clientData.name} has released the funds.`
    this.emailMessages.push({
      to: this.providerData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.providerData.name},<br>
      Congratulations! ${this.clientData.name} has accepted the job:
      "${this.jobData.information.title}"
      as complete and released the escrowed funds to your wallet.`,
    })

    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

class DisputeNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('DisputeNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const recipient = this.getRecipient()
    const sender = this.getSender()

    const title = `${sender.name} has raised a dispute.`
    this.emailMessages.push({
      to: recipient.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${recipient.name},<br>
      ${sender.name} has raised a dispute for the job:
      "${this.jobData.information.title}".
      Login to CanWork to see the discussion.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

// Send notification to the provider that they may commence the job
class JobRequestCommenceNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('JobRequestCommenceNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    let title = `${this.clientData.name} has commenced the job`
    this.emailMessages.push({
      to: this.providerData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.providerData.name},<br>
      ${this.clientData.name}
      has transfered the funds into the CanWork escrow for the job request:
      "${this.jobData.information.title}".<br> The funds are safely held in escrow until the job is complete and released to your wallet. <br>`,
    })

    title = `You have commenced the job`
    this.emailMessages.push({
      to: this.clientData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.clientData.name},<br>
      You have made a payment into escrow for the job:
      "${this.jobData.information.title}".`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

// Send notification to the provider that they may commence the job
class JobRequestCommenceFailedNotification extends AEmailNotification {
  constructor() {
    super()
  }

  async interpolateTemplates(
    db: FirebaseFirestore.Firestore,
    jobId: string
  ): Promise<void> {
    console.log('JobRequestCommenceFailedNotification.interpolateTemplates()')
    try {
      await super.interpolateTemplates(db, jobId)
    } catch (error) {
      console.error(error)
    }

    const title = `Uh-oh, your transaction to enter the escrow was un-successful`
    this.emailMessages.push({
      to: this.clientData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Hi ${this.clientData.name},<br>
      The transaction of this failed deposit can be viewed from your job details page.`,
    })
    console.log('+ dump emailMessages:', this.emailMessages)
  }
}

export function notificationEmail(action: string) {
  console.log('+ build factory object for action:', action)

  const actions = {}

  actions[ActionType.createJob] = ProviderJobRequestNotification
  actions[ActionType.cancelJob] = CancelJobNotification
  actions[ActionType.acceptTerms] = JobRequestAcceptedNotification
  actions[ActionType.declineTerms] = JobRequestDeclinedNotification
  actions[ActionType.counterOffer] = JobRequestCounterOfferNotification
  actions[ActionType.enterEscrow] = JobRequestCommenceNotification
  actions[ActionType.enterEscrowFailed] = JobRequestCommenceFailedNotification
  actions[ActionType.addMessage] = AddMessageNotification
  actions[ActionType.finishedJob] = FinishedJobNotification
  actions[ActionType.acceptFinish] = AcceptFinishNotification
  actions[ActionType.dispute] = DisputeNotification

  const jobAction = actions[action]

  if (!jobAction) {
    console.log(`! unknown action type: ${action}`)
    return undefined
  }

  return new jobAction()
}

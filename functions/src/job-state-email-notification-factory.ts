const sgMail = require('@sendgrid/mail');
const replyTo = 'noreply@canya.com';

/*
 * Interfaces
 */
interface EmailMessage {
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
}

interface IJobStateEmailNotification {
  interpolateTemplates(db: FirebaseFirestore.Firestore, jobId: string): void;
  deliver(sendgridApiKey: string, returnUri: string): void;
}

/*
 * Abstract (Parent/Base Class)
 */
abstract class AEmailNotification implements IJobStateEmailNotification {
  db: FirebaseFirestore.Firestore
  initiatedByUid: string;
  jobId: string;
  jobData: any;
  clientData: any;
  providerData: any;
  emailMessages: EmailMessage[];

  constructor() {
    this.emailMessages = new Array();
  }

  // Parent method for building 'EmailMessage' objects.
  // Each factory calls this with super.interpolateTemplates(db, jobId);
  // And then does it's own work to interpolate the html template
  public interpolateTemplates(db: FirebaseFirestore.Firestore, jobId: string): Promise<void> {
    this.db = db;
    console.log('AEmailNotification.interpolateTemplates()');
    return this.populateDataObjects(jobId);
  }

  // Send the built 'EmailMessage' via sendgrid
  public deliver(sendgridApiKey: string, returnUri: string): void {
    sgMail.setApiKey(sendgridApiKey);
    sgMail.setSubstitutionWrappers('{{', '}}');

    this.emailMessages.forEach(emailMessage => {
      console.log('+ sending message to', emailMessage.to);
      sgMail.send({
        to: emailMessage.to,
        from: replyTo,
        subject: emailMessage.subject,
        html: emailMessage.bodyHtml,
        substitutions: {
          title: emailMessage.title,
          returnLinkText: 'View Job Details Here',
          returnLinkUrl: `${returnUri}/inbox/jobs/${this.jobData.id}`,
        },
        templateId: '4fc71b33-e493-4e60-bf5f-d94721419db5'
      }, (error, result) => {
        if (error) {
          console.error('! error sending message:', error.response.body)
        }
      });
    });
  }

  // Get a user by ID
  private async getUserObjects(userId: string): Promise<any> {
    console.log('AEmailNotification.getUserObjects() userId:', userId);
    let user;
    try {
      user = await this.db.collection('users').doc(userId).get();
      console.log('+ user data retrieved for:', user.data().email);
    } catch (error) {
      console.error(`! unable to retrieve user data using ID: ${userId}`, error);
      throw new Error(error);
    }
    return user.data();
  }

  // Locate the job document in the collection, and populate the this.jobData object member
  private async populateDataObjects(jobId: string) {
    console.log('AEmailNotification.populateJobData()');
    // Get the job object from the 'jobs' collection
    try {
      const data = await this.db.collection('jobs').doc(jobId).get();
      this.jobData = data.data();
      console.log('+ job data populated:', this.jobData);
    } catch (error) {
      console.error(`! unable to retrieve job data using ID: ${jobId}`, error);
      throw new Error(error);
    }
    if (!this.jobData) {
      const error = `no job data could be found using ID: ${jobId}`;
      console.warn(error);
    }
    console.log('+ retrieved job data:', this.jobData);

    // Populate the required user objects for client & provider:
    this.clientData = await this.getUserObjects(this.jobData.clientId);
    this.providerData = await this.getUserObjects(this.jobData.providerId);
  }
}

/*
 * Implementations
 */

// Send notification to client that a new job has been requested
class ClientJobRequestNotification extends AEmailNotification {
  constructor() {
    super();
  }

  async interpolateTemplates(db: FirebaseFirestore.Firestore, jobId: string): Promise<void> {
    console.log('ClientJobRequestNotification.interpolateTemplates()');
    try {
      await super.interpolateTemplates(db, jobId);
    } catch (error) {
      console.error(error);
    }
    console.log('+ building job request email for provider');

    // get html template here

    const title = `You have a work request from ${this.clientData.name}`

    this.emailMessages.push({
      to: this.providerData.email,
      subject: title,
      title: title,
      bodyHtml: `
      Dear ${this.providerData.name},<br>
      ${this.clientData.name} has requested a job: "${this.jobData.information.description}". Please login to CanWork to review this request.`
    });
    console.log('+ dump emailMessages:', this.emailMessages);
  }
}

// Send notification to provider only
// class ProviderNotification extends AEmailNotification {
//   constructor() {
//     super();
//   }

//   async interpolateTemplates(db: FirebaseFirestore.Firestore, jobId: string): Promise<void> {
//     await super.interpolateTemplates(db, jobId);
//     console.log('+ sending email to provider');
//     // return "";
//   }
// }

// // Send notification to client and provider
// class ProviderAndClientNotification extends AProvider {
//   constructor(initiatedByUid: string, jobId: string, job: any) {
//     super(initiatedByUid, jobId, job);
//   }
//   interpolateTemplate(): string {
//     console.log('+ sending email to client and provider');
//     return "";
//   }
// }

// // Send notification to client, provider and support
// class AllPartiesNotification extends AProvider {
//   constructor(initiatedByUid: string, jobId: string, job: any) {
//     super(initiatedByUid, jobId, job);
//   }
//   interpolateTemplate(): string {
//     console.log('+ sending email to client, provider and support');
//     return "";
//   }
// }

export function notificationEmail(action: string) {
  console.log('+ build factory object for action:', action)
  switch (action) {
    case 'Create job': {
      return new ClientJobRequestNotification();
    } default: {
      console.log('! unknown action type: ', action)
      return undefined;
    }
  }

}

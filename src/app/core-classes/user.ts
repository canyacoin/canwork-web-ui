export class User {
  '@type': string;
  '@context': string;
  address: string;
  avatar: Avatar;
  bio: string;
  category: UserCategory;
  colors: string[] = [];
  description: string;
  email: string;
  ethAddress: string;
  hourlyRate: string;
  name: string;
  networkAddress: string;
  offset: string;
  phone: string;
  publicEncKey: string;
  publicKey: string;
  pushToken: string;
  skillTags: string[] = [];
  state: UserState;
  timestamp: string;
  timezone: string;
  title: string;
  type: UserType;
  whitelisted: boolean;
  whitelistRejected: boolean;
  whitelistSubmitted: boolean;
  work: string;
  workSkillTags: string[] = [];

  upvotes = 0
  downvotes = 0
  numberOfReviews = 0

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}

export class Avatar {
  uri: string;
}

export enum UserState {
  done = 'Done'
}

export enum UserType {
  client = 'User',
  provider = 'Provider'
}

export enum UserCategory {
  contentCreator = 'CONTENT CREATORS',
  designer = 'DESIGNERS & CREATIVES',
  finance = 'FINANCIAL EXPERTS',
  marketing = 'MARKETING & SEO',
  softwareDev = 'SOFTWARE DEVELOPERS',
  virtualAssistant = 'VIRTUAL ASSISTANTS'
}

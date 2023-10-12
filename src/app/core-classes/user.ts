export class User {
  '@type': string
  '@context': string
  address: string
  avatar: Avatar
  compressedAvatarUrl: any
  bio: string
  category: UserCategory
  colors: string[] = []
  description: string
  email: string
  bscAddress: string
  slug: string
  hourlyRate: string
  name: string
  networkAddress: string
  offset: string
  phone: string
  publicEncKey: string
  publicKey: string
  pushToken: string
  rating: Rating = new Rating()
  skillTags: string[] = []
  state: UserState
  timestamp: number
  timezone: string
  title: string
  type: UserType
  verified: boolean
  whitelisted: boolean
  whitelistRejected: boolean
  whitelistSubmitted: boolean
  referredBy: string
  work: string
  workSkillTags: string[] = []

  upvotes = 0
  downvotes = 0
  numberOfReviews = 0

  constructor(init?: Partial<User>) {
    Object.assign(this, init)
  }
}

export class Rating {
  count = 0
  average = 0

  constructor() {}
}

export class Avatar {
  uri: string
}

export enum UserState {
  done = 'Done',
}

export enum UserType {
  client = 'User',
  provider = 'Provider',
}

export enum UserCategory {
  contentCreator = 'CONTENT CREATORS',
  designer = 'DESIGNERS & CREATIVES',
  marketing = 'MARKETING & SEO',
  softwareDev = 'SOFTWARE DEVELOPERS',
  virtualAssistant = 'VIRTUAL ASSISTANTS',
}

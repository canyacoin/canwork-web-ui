export class User {
    '@type': string;
    '@context': string;
    address: string;
    avatar: Avatar;
    bio: string;
    category: string;
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
    work: string;
    workSkillTags: string[] = [];

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

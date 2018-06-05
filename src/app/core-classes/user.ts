export class User {
    '@type': string;
    '@context': string;
    address: string;
    avatar: Avatar;
    bio: string;
    category: string;
    colors: string[];
    description: string;
    email: string;
    ethAddress: string;
    name: string;
    networkAddress: string;
    phone: string;
    publicEncKey: string;
    publicKey: string;
    pushToken: string;
    state: UserState;
    timestamp: string;
    timezone: string;
    title: string;
    type: string;
    work: string;

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

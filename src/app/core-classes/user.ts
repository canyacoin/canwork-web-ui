import { State } from './state.enum';

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
    name: string;
    phone: string;
    state: State;
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
